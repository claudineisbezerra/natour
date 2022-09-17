const crypto = require('crypto');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

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
  // 1) Get the data, for the requested tour (including reviews, guides and startdates)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
  // console.log('getTour tour: ',tour);

  // 2) Get the logged user
  const user = res.locals.user;
  // console.log('getTour user: ',user);
  // console.log('getTour user._id: ',user._id);
  // console.log('getTour tour._id: ',tour._id);
  let bookedTours = [];
  if (user) {
    // 3) Get booked tours of connected user
    tour.startDates.forEach(date => {
      let bookedTour;
      // console.log('date: ', date);
      date.participants.forEach(participant => {
        // 1) Get tour review
        let reviewId;
        if(String(user._id) === String(participant)) {
          tour.reviews.forEach(review => {
            // console.log('review.user: ',review.user)
            if (String(tour._id) === String(review.tour) && String(user._id) === String(review.user._id)) {
              // console.log('user._id: ',user._id)
              // console.log('participant: ',participant)
              // console.log('tour._id: ',tour._id)
              // console.log('review.tour: ',review.tour)
              // // console.log('review.user: ',review.user)
              // console.log('review.user: ',review.user._id)
              // console.log(' ');

              reviewId = review._id;
            }
          });
          bookedTour = {
            userId: participant,
            tourId: tour._id,
            tourStartDate: date.startDate,
            reviewId: reviewId
          }
        }
      });

      if (bookedTour) {
        bookedTours.push(bookedTour);
      }
      
    });
  } else {
    return next(new AppError('There is no user logged in. Please Log in.', 404));
  }
  // console.log('bookedTours: ', bookedTours);

  // 2) Build template

  // 3) Render template using data from step 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
    bookedTours
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

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings by the user
  const tours = await Booking.aggregate([
    {
      $match: { user: mongoose.Types.ObjectId(req.user.id) }
    },
    // 2) Get Tour information thru object referenced
    {
      $lookup:
        {
          from: 'tours',
          localField: 'tour',
          foreignField: '_id',
          as: 'tour'
        }
    },
    // 3) Merge Booking and Tour objects to be one
    {
      $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$tour", 0 ] }, "$$ROOT" ] } }
    },
    // 4) Recriate object properties
    // important! Keeps only a TOUR DATE booked by the user
    { 
      $project: {
        _id: 0,
        name: 1, 
        duration: 1,
        maxGroupSize:1,
        difficulty:1,
        ratingsAverage:1,
        ratingsQuantity:1,
        price:1,
        summary:1,
        description:1,
        imageCover:1,
        images:1,
        createdAt:1,
        secretTour: 1,
        startLocation:1,
        locations:1,
        guides:1,
        slug:1,
        user:1,
        paid:1,
        startDates: {
              $filter: {
                 input: "$startDates",
                 as: "dt",
                cond: { $eq: [ "$$dt.startDate", "$tourStartDate" ] }
              }
           },
      } 
    }
  ])

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  // User must be connected and authenticated
  let filter = { user: req.user._id };
  let populateOptions = 'tour';
  let queryString = req.query;

  const features = new APIFeatures(Review.find(filter), queryString, populateOptions)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populate();
  
  const doc = await features.query;

  // SEND RESPONSE TO FRONT END PUG PAGE
  res.status(200).render('reviews', {
    title: 'Review your tour experiences',
    status: 'success',
    results: doc.length,
    reviews: doc
  });
});

exports.getReviewForm = catchAsync(async (req, res, next) => {
  // Paramenter send by querystring
  const { action, reviewId, tourId, tourStartDate } = req.query;
  const backURL = req.header('Referer');

  let docResult = {};
  let tour = {};

  // Create new Review
  if (action === 'create') {
    if (!tourId ) {
      return next(new AppError('Please provide a tour id!', 400));
    }
    tour = await Tour.findById(tourId);
    if (!tour) {
      return next(new AppError(`No document found with review ID: ${reviewId}`, 404));
    }
  }

  // Update Review. Existing reviewId
  if (action === 'update') {
    if (!reviewId ) {
      return next(new AppError('Please provide a review id!', 400));
    }
    docResult = await Review.findById(reviewId).populate('tour');
    if (!docResult) {
      return next(new AppError(`No document found with review ID: ${reviewId}`, 404));
    }
    tour = docResult.tour;
  }

  res.status(200).render('review', {
    title: 'Review your tour experience',
    status: 'success',
    results: docResult.length,
    review: docResult,
    tour,
    backURL: backURL,
    action
  });
});
