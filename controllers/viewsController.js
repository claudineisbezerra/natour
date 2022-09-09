const crypto = require('crypto');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking') {
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly, please come back later.";
  }
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build template
  // 3) Render template using data from step 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign Up for your account'
  });
};

// DIRECT HTTP CALL to verify user account by email link before logging in
exports.verifyUserAccount = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested verification
  const verifyNotHashedToken = req.params.verifyToken;
  if (!verifyNotHashedToken ) {
    return next(new AppError('Please provide valid Verification Token!', 400));
  }

  let firstName;
  try {
    // 2) Get user based on the verifyNotHashedToken
    const verifyHashedToken = crypto.createHash('sha256').update(verifyNotHashedToken).digest('hex');

    // 3) Check if user exists and verifyToken is valid
    const conditions = {'verifyToken': verifyHashedToken, 'verifyExpires': { $gt: Date.now() }};
    const user = await User.findOne(conditions).select('+verifyToken').populate({path: 'roles',select: '-__v'});

    // 4) If verifyToken has not expired, and there is user, validate user account
    if (!user) {
      return next(new AppError('Verification Token is invalid or has expired', 400));
    }

    user.verified = true;
    user.verifiedAt = Date.now();
    user.verifyToken = undefined;
    user.verifyExpires = undefined;
    user.verifyNotHashedToken = undefined;

    firstName = user.name.split(' ')[0];
    await user.save({ validateBeforeSave: false });
  } catch (err) {
    return next(new AppError(err, 500));
  }

  res.status(200).render('login', {
    title: 'Log into your account',
    alert: `Congrats ${firstName}. \n Your account was successfully activated. \n Please Log into your account.`
  });

});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  ).clone();

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});
