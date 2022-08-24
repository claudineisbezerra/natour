const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictToRoles('user', 'admin'),
    reviewController.setTourUserIds,
    reviewController.restrictToReviewMyBookedTours,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictToRoles('user', 'admin'),
    reviewController.setTourUserIds,
    reviewController.restrictToReviewMyBookedTours,
    reviewController.updateReview
  )
  .delete(
    authController.restrictToRoles('user', 'admin'),
    reviewController.setTourUserIds,
    reviewController.restrictToReviewMyBookedTours,
    reviewController.deleteReview
  );

module.exports = router;
