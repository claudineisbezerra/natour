const Review = require('./../models/reviewModel');
const Booking = require('./../models/bookingModel');
const AppError = require('./../utils/appError');
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

  // To allow for nested GET reviews on tour (hack).
  // Referenced objects in mongoose
  let filter = {};
  filter = { tour: tourId, user:  userId};

  let query = Booking.findOne(filter);
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
