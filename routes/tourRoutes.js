const express = require('express');
const tourController = require('./../controllers/tourController');
const { authJwt } = require('./../middlewares');
const reviewRouter = require('./../routes/reviewRoutes');
const bookingRouter = require('./../routes/bookingRoutes');

const router = express.Router();

// router.param('id', tourController.checkID);

// GET /tour/{{tourId}}/reviews
// POST /tour/{{tourId}}/reviews
router.use('/:tourId/reviews', reviewRouter);

// GET /tour/{{tourId}}/bookings
// POST /tour/{{tourId}}/bookings
router.use('/:tourId/bookings', bookingRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authJwt.verifyToken,
    authJwt.restrictToRoles('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authJwt.verifyToken,
    authJwt.restrictToRoles('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authJwt.verifyToken,
    authJwt.restrictToRoles('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )

module.exports = router;
