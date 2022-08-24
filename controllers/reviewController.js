const Review = require('./../models/reviewModel');
const Booking = require('./../models/bookingModel');
const mongoose = require('mongoose');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

//Restriction to allow review to users own booked tours
exports.restrictToReviewMyBookedTours = catchAsync(async (req, res, next) => {
  const userId = req.body.user ? req.body.user : req.user.id
  const tourId = req.body.tour ? req.body.tour : req.params.tourId
  const findOptions = {tour: mongoose.Types.ObjectId(tourId), user:  mongoose.Types.ObjectId(userId)};

  let query = Booking.findOne(findOptions);
  const doc = await query;

  if (!doc) {
    return next(new AppError(`You can only manage your own booked tours. This userId: ${userId} has no bookings for this tourId: ${tourId}`, 404));
  }

  next();
});

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOneById(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
