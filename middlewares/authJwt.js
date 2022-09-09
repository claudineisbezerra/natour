const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const Role = require('./../models/roleModel');
const RefreshToken = require('./../models/refreshTokenModel');
const authController = require('./../controllers/authController');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const authenticate = require('./../utils/authenticate');


const silentAccessTokenRenew = async (req, res, next) => {
  // 1) Check if refresh toke was provided
  if (!req.body.requestToken) {
    return next(
      new AppError('Token param (refresh token) is required!', 403)
    );
  }
  const requestToken = req.body.requestToken;
  try {
    // 2) Check if refresh token exists in database
    let userRefreshToken = await RefreshToken.findOne({ token: requestToken }).populate("user", "_id is2FAEnabled");
    if (!userRefreshToken) {
      return next(
        new AppError('Refresh token not found!', 403)
      );
    }
    // 3) Validate if refresh token is not expired
    if (RefreshToken.verifyExpiration(userRefreshToken)) {
      await RefreshToken.findByIdAndRemove(userRefreshToken._id);
      return next(
        new AppError('Refresh token was expired. Please make a new signin request!', 403)
      );
    }

    // 4) Generate new access token
    let newAccessToken;
    if (userRefreshToken.user.is2FAEnabled){
      newAccessToken = authenticate.signAccessToken(userRefreshToken.user._id, false);
    } else {
      newAccessToken = authenticate.signAccessToken(userRefreshToken.user._id, true);
    }

    // 5) Set cookie for new timeframe access token validity
    res.cookie('jwt', newAccessToken, {
      expires: new Date(Date.now() + process.env.JWT_ACCESS_TOKEN_EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    });
    
    // 6) Set header to use new valid AccessToken on the flow
    req.headers.authorization = `Bearer ${newAccessToken}`;

    // 7) Get user associated to accessToken
    const currentUser = await User.findById(userRefreshToken.user._id).populate({path: 'roles',select: '-__v'});
    if (!currentUser) {
      return next( new AppError('The user belonging to this accessToken does no longer exist.', 401));
    }
    // Grant access to authorized route
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    return next(
      new AppError(err, 500)
    );
  }
};

verifyToken = async (req, res, next) => {
  // 1) Getting accessToken and check of it's there
  let accessToken = authenticate.getBearerToken(req.headers, req.cookies, next);
  try {
    // 2) accessToken validation - example TokenExpiredError
    const decoded = await authenticate.validateAccessToken(accessToken, next);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id).populate({path: 'roles',select: '-__v'});
    if (!currentUser) {
      return next( new AppError('The user belonging to this accessToken does no longer exist.', 401));
    }

    // 4) Check if user changed password after the accessToken was issued
    if (currentUser.changedPasswordAfterIssuedAccessToken(decoded.iat)) {
      return next(
        new AppError('User recently changed the password! Please log in again.', 401)
      );
    }

    // 5) Verification to garantee that user with enabled 2FA is already authorized
    if (currentUser.is2FAEnabled && !decoded.authorized){
      return next(
        new AppError('2FA authorization is required as 2FA is enabled to the user.', 401)
      )
    }

    // Grant access to authorized route
    req.user = currentUser;
    res.locals.user = currentUser;
    return next();
  } catch (err) {
    if (err.name = 'TokenExpiredError') {
      // refreshToken is required to get new accessToken
      if (!req.cookies.jwtRefreshToken) {
        return next(
          new AppError('No refreshToken provided! Please log in to get access.', 401)
        );
      } else {
        req.body.requestToken = req.cookies.jwtRefreshToken;
      }
      await silentAccessTokenRenew(req, res, next);
    } else {
      return next(
        new AppError(err, 500)
      );
    }
  }
};

restrictToRoles = (...allowedRoles) => {
  return (req, res, next) => {
    let roles = req.user.roles.map(obj => obj.name);
    let countAllowance = 0;

    for (let i = 0; i < roles.length; i++  ) {
      let role = roles[i];
      if (allowedRoles.includes(role)) {
        countAllowance++
      }
    }
    if (countAllowance <= 0){
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

isAccountVerified = async (req, res, next) => {
  // 1) Get user based on provided email
  const { email } = req.body;
  if (!email ) {
    return next(new AppError('Please provide email!', 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!await user.isAccountVerified()) {
    return next(new AppError('User Account not verified. Please confirm your account before logging in', 401));
  }

  return next();
};

isAdmin = (req, res, next) => {
  const checkRole = 'admin';
  // 1) Check if user parameter exists
  if (!req.user._id) {
    return new AppError('The is no user logged in.', 400);
  }

  // 2) Find user by _id and check associated role
  User.findById(req.user._id).exec((err, user) => {
    if (err) {
      return new AppError( err, 500);
    }
    Role.find(
      {_id: { $in: user.roles }},
      (err, roles) => {
        if (err) {
          return new AppError( err, 500);
        }
        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === checkRole ) {
            next();
            return;
          }
        }
        res.status(403).json({
          status: 'error',
          message: `Require ${checkRole} Role!`
        });
        return;
      }
    );
  });
};

isUser = (req, res, next) => {
  const checkRole = 'user';
  // 1) Check if user parameter exists
  if (!req.user._id) {
    return new AppError('The is no user logged in.', 400);
  }

  // 2) Find user by _id and check associated role
  User.findById(req.user._id).exec((err, user) => {
    if (err) {
      return new AppError( err, 500);
    }
    Role.find(
      {_id: { $in: user.roles }},
      (err, roles) => {
        if (err) {
          return new AppError( err, 500);
        }
        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === checkRole ) {
            next();
            return;
          }
        }
        res.status(403).json({
          status: 'error',
          message: `Require ${checkRole} Role!`
        });
        return;
      }
    );
  });
};

isGuide = (req, res, next) => {
  const checkRole = 'guide';
  // 1) Check if user parameter exists
  if (!req.user._id) {
    return new AppError('The is no user logged in.', 400);
  }

  // 2) Find user by _id and check associated role
  User.findById(req.user._id).exec((err, user) => {
    if (err) {
      return new AppError( err, 500);
    }
    Role.find(
      {_id: { $in: user.roles }},
      (err, roles) => {
        if (err) {
          return new AppError( err, 500);
        }
        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === checkRole ) {
            next();
            return;
          }
        }
        res.status(403).json({
          status: 'error',
          message: `Require ${checkRole} Role!`
        });
        return;
      }
    );
  });
};

isLeadGuide = (req, res, next) => {
  const checkRole = 'lead-guide';
  // 1) Check if user parameter exists
  if (!req.user._id) {
    return new AppError('The is no user logged in.', 400);
  }

  // 2) Find user by _id and check associated role
  User.findById(req.user._id).exec((err, user) => {
    if (err) {
      return new AppError( err, 500);
    }
    Role.find(
      {_id: { $in: user.roles }},
      (err, roles) => {
        if (err) {
          return new AppError( err, 500);
        }
        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === checkRole ) {
            next();
            return;
          }
        }
        res.status(403).json({
          status: 'error',
          message: `Require ${checkRole} Role!`
        });
        return;
      }
    );
  });
};

const authJwt = {
  verifyToken,
  isAccountVerified,
  restrictToRoles,
  isAdmin,
  isUser,
  isGuide,
  isLeadGuide
};

module.exports = authJwt;