const express = require('express');
const bookingController = require('./../controllers/bookingController');
const { authJwt } = require('./../middlewares');

// { mergeParams: true } is requested to access params in nested routes
const router = express.Router({ mergeParams: true });

// Check if accessToken remains valid and set global authenticated user.
// all routes after this middleware
router.use(authJwt.verifyToken);

router.get('/checkout-session/:tourId', bookingController.getStripeCheckoutSession);

router.use(authJwt.restrictToRoles('admin', 'lead-guide'));

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
