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
  let roles = [];
  if (!req.body.roles || req.body.roles.length <= 0) {
    roles[0] = process.env.DEFAULT_USER_ROLE;
  }

  const ROLES = await loadData.getRoles();
  if (!ROLES) {
    return next(new AppError('ROLE misconfiguration. Please validate your database content!', 400));
  }

  if (roles) {
    for (let i = 0; i < roles.length; i++) {
      if (!ROLES.includes(roles[i])) {
        return next(new AppError(`Role \"${roles[i]}\" does not exist!`, 400));
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
