const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

// { mergeParams: true } is requested to access params in nested routes
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getStripeCheckoutSession);

router.use(authController.restrictToRoles('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.setTourUserIds, bookingController.checkBookingRules, bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.setTourUserIds, bookingController.updateBooking)
  .delete(bookingController.setTourUserIds, bookingController.deleteBooking);

module.exports = router;
