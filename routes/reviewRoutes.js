const express = require('express');
const reviewController = require('./../controllers/reviewController');
const { authJwt } = require('./../middlewares');

// { mergeParams: true } is requested to access params in nested routes
const router = express.Router({ mergeParams: true });

// Check if accessToken remains valid and set global authenticated user.
// all routes after this middleware
router.use(authJwt.verifyToken);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authJwt.restrictToRoles('user', 'admin'),
    reviewController.setTourUserIds,
    reviewController.restrictToReviewMyBookedTours,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authJwt.restrictToRoles('user', 'admin'),
    reviewController.setTourUserIds,
    reviewController.restrictToReviewMyBookedTours,
    reviewController.updateReview
  )
  .delete(
    authJwt.restrictToRoles('user', 'admin'),
    reviewController.setTourUserIds,
    reviewController.restrictToReviewMyBookedTours,
    reviewController.deleteReview
  );

module.exports = router;
