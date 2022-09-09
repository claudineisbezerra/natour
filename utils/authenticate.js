const jwt = require('jsonwebtoken');
const twoFactor = require('node-2fa');
const { promisify } = require('util');
const AppError = require('./../utils/appError');

// Signs a JWT access token
exports.signAccessToken = (id, is2FAEnabled) => {
  return jwt.sign({ id, authorized: !is2FAEnabled }, process.env.JWT_USER_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN });
};

// Signs a OTP access token
exports.signTOTPToken = (decodeToken) => {
  return jwt.sign(decodeToken, process.env.JWT_USER_ACCESS_SECRET, {});
};

exports.getBearerToken = (headers, cookies, next) => {
  let accessToken;
  if (headers.authorization && headers.authorization.startsWith('Bearer')) {
    accessToken = headers.authorization.split(' ')[1];
  } else if (cookies.jwt) {
    accessToken = cookies.jwt;
  }
  if (!accessToken) {
    return next(
      new AppError('No accessToken provided! Please log in to get access.', 401)
    );
  }
  return accessToken;
}

exports.validateAccessToken = async (accessToken, next) => {
  return await promisify(jwt.verify)(accessToken, process.env.JWT_USER_ACCESS_SECRET);
  // try {
  //   // accessToken validation
  //   const decoded = await promisify(jwt.verify)(accessToken, process.env.JWT_USER_ACCESS_SECRET);
  //   return decoded
  // } catch (err) {
  //     return next(
  //       new AppError(err, 401)
  //     );
  //   }
}

exports.generate2FA = (options) => {
  try {
    const config = {
      name: encodeURIComponent(options.name ? options.name : process.env.NAME2FA),
      account: encodeURIComponent(options.account ? `:${options.account}` : process.env.ACCOUNT2FA),
    }
    const newOTPSecret = twoFactor.generateSecret(config);
    const secret = newOTPSecret.secret;

    const newOTPToken = this.generate2FAToken(newOTPSecret.secret)
    const token = newOTPToken.token;

    return { secret, token };
  } catch (err) {
    return next(new AppError(err, 500));
  }
  /*
  { secret: 'XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W',
    uri: 'otpauth://totp/My%20Awesome%20App:johndoe?secret=XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W&issuer=My%20Awesome%20App',
    qr: 'https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=otpauth://totp/My%20Awesome%20App:johndoe%3Fsecret=XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W%26issuer=My%20Awesome%20App'
  }
  */
}

exports.generate2FASecret = (options) => {
  try {
    const config = {
      name: encodeURIComponent(options.name ? options.name : process.env.NAME2FA),
      account: encodeURIComponent(options.account ? `:${options.account}` : process.env.ACCOUNT2FA),
    }
    const newOTPSecret = twoFactor.generateSecret(config);
    return newOTPSecret;
  } catch (err) {
    return next(new AppError(err, 500));
  }
  /*
  { secret: 'XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W',
    uri: 'otpauth://totp/My%20Awesome%20App:johndoe?secret=XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W&issuer=My%20Awesome%20App',
    qr: 'https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=otpauth://totp/My%20Awesome%20App:johndoe%3Fsecret=XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W%26issuer=My%20Awesome%20App'
  }
  */
}

exports.generate2FAToken = (OTPSecret) => {
  if (!OTPSecret) {
    return next(
      new AppError('No OTPSecret provided!', 401)
    );
  }
  try {
    const newOTPToken = twoFactor.generateToken(OTPSecret);
    return newOTPToken;
  } catch (err) {
    return next(new AppError(err, 500));
  }
}

exports.verify2FAToken = (OTPSecret, OTPToken) => {
  if (!OTPSecret || !OTPToken) {
    new AppError('No secret/token provided for vefification!', 401);
  }
  try {
    const result2FA = twoFactor.verifyToken(OTPSecret, OTPToken, process.env.WINDOW2FA * 1);
    const delta = result2FA === null ? result2FA : result2FA.delta;
    let objResult = {message: "", isValid: false};

    if (delta == 0 ){
      objResult.isValid = true;
      objResult.message = 'VALID: Current Key is within the time frame.';
    } else if(delta == 1){
      objResult.isValid = false;
      objResult.message = 'INVALID: Current Key entered too early (an older key was meant to be used).';
    } else if(delta == -1){
      objResult.isValid = false;
      objResult.message = 'INVALID: Current Key entered too late (a newer key was meant to be used).';
    } else {
      objResult.isValid = false;
      objResult.message = 'INVALID: Current token does not match, or Current token out of time sync.';
    }

    return objResult;

  } catch (err) {
    return new AppError(err, 500);
  }
}



