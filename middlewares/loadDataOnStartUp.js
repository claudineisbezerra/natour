const Role = require('../models/roleModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getRoles = async () => {
  const roleObjArray = await Role.find({})
  if (!roleObjArray) {
    return next(new AppError('Roles not found!', 404));
  }
  let roles = roleObjArray.map(obj => obj.name);
  return roles;
};



