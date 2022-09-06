const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const loadData = require('./loadDataOnStartUp');

checkDuplicateUsernameOrEmail = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return new AppError('Missing email. Please inform your email!', 400);
  }
  const user = await User.findOne({email: req.body.email})
  if (user) {
    return next(new AppError('Email is already in use!', 400));
  }
  next();
});

checkRolesExisted = catchAsync(async (req, res, next) => {
  if (!req.body.roles || req.body.roles.length <= 0) {
    return next(new AppError('Missing roles parameter. Please inform your roles!', 400));
  }

  const ROLES = await loadData.getRoles();
  if (!ROLES) {
    return next(new AppError('ROLE misconfiguration. Please validate your database content!', 400));
  }

  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        return next(new AppError(`Role \"${req.body.roles[i]}\" does not exist!`, 400));
      }
    }
    next();
  }
});

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;
