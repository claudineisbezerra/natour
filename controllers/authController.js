const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const twoFactor = require('node-2fa');
const User = require('./../models/userModel');
const Role = require('./../models/roleModel');
const RefreshToken = require('./../models/refreshTokenModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const authenticate = require('./../utils/authenticate');
const { constants } = require('buffer');

const createSendSignedTokens = async (user, statusCode, aToken, rToken, req, res) => {
  try {
    // 1) Generate signed accessToken using jsonwebtoken
    let accessToken;
    if(aToken) {
      accessToken = aToken;
    } else {
      accessToken = authenticate.signAccessToken(user._id, user.is2FAEnabled );
    }

    // 2) Generate and persists signed refreshToken using jsonwebtoken
    let refreshToken;
    if(rToken) {
      refreshToken = rToken;
    } else {
      refreshToken = refreshToken = await RefreshToken.createToken(user._id);
    }

    // 3) Set accessToken cookie valid for  24 hours
    res.cookie('jwt', accessToken, {
      expires: new Date(Date.now() + process.env.JWT_ACCESS_TOKEN_EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    });

    // 4) Set refreshToken cookie valid for  24 hours
    // In this scenario, refreshToken is saved in client side cookies only for test reasons
    res.cookie('jwtRefreshToken', refreshToken, {
      expires: new Date(Date.now() + process.env.JWT_REFRESH_TOKEN_EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    });

    // 5) Set list of authorities/roles of the user
    let authorities = [];
    for (let i = 0; i < user.roles.length; i++) {
      authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
    }

    // 6) Remove sensitive properties from output
    user.password = undefined;
    user.passwordConfirm = undefined;
    user.verifiedAt = undefined;
    user.verifyToken = undefined;
    user.verifyExpires = undefined;

    // 7) Set return
    res.status(statusCode).json({
      status: 'success',
      data: {
        user
      },
      accessToken,
      refreshToken,
      roles: authorities
    });
  } catch (err) {
    return next(new AppError(err, 500));
  }
};

exports.renewAccessToken = catchAsync( async (req, res, next) => {
  let requestToken =  req.body.requestToken;
  if (!requestToken) {
    return next(new AppError('Refresh Token is required!', 403));
  }

  try {
    let userRefreshToken = await RefreshToken.findOne({ token: requestToken }).populate("user", "_id is2FAEnabled");
    if (!userRefreshToken) {
      return next(new AppError('Refresh token is not in database!', 403));
    }

    if (RefreshToken.verifyExpiration(userRefreshToken)) {
      await RefreshToken.findByIdAndRemove(userRefreshToken._id);
      return next(new AppError('Refresh token was expired. Please make a new signin request!', 403));
    }

    // Inverts is2FAEnabled to respect OTP token validity
    let newAccessToken;
    if (userRefreshToken.user.is2FAEnabled){
      newAccessToken = authenticate.signAccessToken(userRefreshToken.user._id, false);
    } else {
      newAccessToken = authenticate.signAccessToken(userRefreshToken.user._id, true);
    }

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: userRefreshToken.token,
    });
  } catch (err) {
    return next(new AppError(err, 500));
  }
});

exports.signup = catchAsync(async (req, res, next) => {
  // 1 Get roles _id to set user reference
  let roles;
  if (req.body.roles) {
    const foundRoles = await Role.find({name: { $in: req.body.roles }})
    if (!foundRoles) {
      return next(new AppError('No configured roles found', 404));
    }
    roles = foundRoles.map(role => role._id);
  } else {
    const defaultRole = 'user'
    const role = await Role.findOne({ name: defaultRole });
    if (!role) {
      return next(new AppError(`No default configured role: ${defaultRole} found`, 404));
    }
    roles = [role._id];
  }

  // 1) Saves at DB and uses mongoose middlewares to complement register
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    roles: roles
  });

  // 2) Prepare URL to user verify user account
  const accessToken = newUser.verifyNotHashedToken;
  const url = `${req.protocol}://${req.get('host')}/verify/${accessToken}`;
  await new Email(newUser, url).sendVerifyUserAccount();

  // 3) Send JWT signed in accessToken to client side
  createSendSignedTokens(newUser, 201, null, null, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password was provided
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password').populate("roles", "-__v");

  if (!user || !(await user.IsValidPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, set and send tokens to client
  createSendSignedTokens(user, 200, null, null, req, res);

});

// Authenticate using two factor authentication providing time-based one-time password (TOTP) secret
exports.loginTOTP = catchAsync(async (req, res, next) => {
  // 1) Getting params for accessToken and OTP validations
  const { OTPSecret, OTPToken } = req.body;
  if (!OTPSecret || !OTPToken) {
    return next(
      new AppError('No secret/token provided for verification!', 401)
    );
  }

  // 2) Getting params (accessToken)
  let accessToken = authenticate.getBearerToken(req.headers, req.cookies, next);
  try {

    // 3) accessToken validation
    let newTOTPAccessToken;
    let decoded = await authenticate.validateAccessToken(accessToken, next);

    // 4) 2FA validation and creation of New Access Token
    if (decoded){
      if(authenticate.verify2FAToken(OTPSecret, OTPToken).isValid) {
          decoded.authorized = true;
          newTOTPAccessToken = authenticate.signTOTPToken(decoded);
      } else {
        return next( new AppError('Invalid one-time password (otp) 2FA.', 401));
      }

      // 5) Check if user still exists
      const user = await User.findById(decoded.id).populate({path: 'roles',select: '-__v'});
      if (!user) {
        return next( new AppError('The user belonging to this accessToken does no longer exist.', 401));
      }

      // 6) Check if user changed password after the accessToken was issued
      if (user.changedPasswordAfterIssuedAccessToken(decoded.iat)) {
        return next(
          new AppError('User recently changed the password! Please log in again.', 401)
        );
      }

      // 7) If everything ok, set and send tokens to client
      createSendSignedTokens(user, 200, newTOTPAccessToken, null, req, res);
    }
  } catch (err) {
    return next(
      new AppError(err, 500)
    );
  }
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_USER_ACCESS_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfterIssuedAccessToken(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.verifyUserAccount = catchAsync(async (req, res, next) => {
  const verifyNotHashedToken = req.params.verifyToken;

  // 1) Check if verifyNotHashedToken was provided
  if (!verifyNotHashedToken ) {
    return next(new AppError('Please provide valid Verification Token!', 400));
  }

  // 1) Get user based on the verifyNotHashedToken
  const verifyHashedToken = crypto.createHash('sha256').update(verifyNotHashedToken).digest('hex');

  // 2) Check if user exists and verifyToken is valid
  const conditions = {'verifyToken': verifyHashedToken, 'verifyExpires': { $gt: Date.now() }};

  const user = await User.findOne(conditions).select('+verifyToken').populate({path: 'roles',select: '-__v'});

  // 2) If verifyToken has not expired, and there is user, validate user account
  if (!user) {
    return next(new AppError('Verification Token is invalid or has expired', 400));
  }

  user.verified = true;
  user.verifiedAt = Date.now();
  user.verifyToken = undefined;
  user.verifyExpires = undefined;
  user.verifyNotHashedToken = undefined;

  await user.save({ validateBeforeSave: false });
  // Action required since doc,save() do not populate reference objects
  await user.populate('roles');

  // 4) Log the user in, send JWT
  createSendSignedTokens(user, 200, null, null, req, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on provided email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset accessToken
  const pwdResetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const pwdResetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${pwdResetToken}`;
    await new Email(user, pwdResetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Access Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!'), 500 );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.accessToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If accessToken has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Access Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user

  // 4) Log the user in, send JWT
  createSendSignedTokens(user, 200, null, null, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.IsValidPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendSignedTokens(user, 200, null, null, req, res);
});

exports.generate2FA = (req, res, next) => {
  const options = {name:req.body.name, account: req.body.account};
  try {
    const otp2fa = authenticate.generate2FA(options);
    return res.status(200).json({
      otp: otp2fa
    });
  } catch (err) {
    return next(new AppError(err, 500));
  }
};

exports.generate2FASecret = (req, res, next) => {
  const options = {name:req.body.name, account: req.body.account};
  try {
    const newOTPSecret = authenticate.generate2FASecret(options);
    return res.status(200).json({
      OTPSecret: newOTPSecret.secret
    });
  } catch (err) {
    return next(new AppError(err, 500));
  }
};

exports.generate2FAToken = (req, res, next) => {
  if (!req.body.OTPSecret) {
    return next(
      new AppError('No OTPSecret provided!', 401)
    );
  }

  const OTPSecret = req.body.OTPSecret;
  try {
    // 1) Generate signed accessToken using jsonwebtoken
    const newOTPToken = authenticate.generate2FAToken(OTPSecret);
    return res.status(200).json({
      OTPToken: newOTPToken.token
    });
  } catch (err) {
    return next(new AppError(err, 500));
  }
};

exports.verify2FAToken = (req, res, next) => {
  if (!req.body.OTPSecret || !req.body.OTPToken) {
    return next(
      new AppError('No secret/token provided for verification!', 401)
    );
  }

  const OTPSecret = req.body.OTPSecret;
  const OTPToken = req.body.OTPToken;

  try {
    const result = authenticate.verify2FAToken(OTPSecret, OTPToken, next);

    return res.status(200).json(result);
  } catch (err) {
    return next(new AppError(err, 500));
  }
};

