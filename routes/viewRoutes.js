const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const { authJwt } = require('./../middlewares');
const { route } = require('./reviewRoutes');

const router = express.Router();

router.use(viewsController.alerts);

router.get('/', authController.isLoggedIn, viewsController.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);

router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);

router.get('/verify/:verifyToken', viewsController.verifyUserAccount);

router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);

// Get current connected user account
router
  .route('/me')
  .get(authJwt.verifyToken, viewsController.getAccount);

  // Get current connected user account
router
  .route('/billing')
  .get(authJwt.verifyToken, viewsController.getBilling);

// Get administrator manage tours
router
  .route('/manage-tours')
  .get(authJwt.verifyToken, viewsController.getManageTours);

// Get administrator manage users
router
.route('/manage-users')
.get(authJwt.verifyToken, viewsController.getManageUsers);

// Get administrator manage reviews
router
  .route('/manage-reviews')
  .get(authJwt.verifyToken, viewsController.getManageReviews);

// Get administrator manage bookings
router
.route('/manage-bookings')
.get(authJwt.verifyToken, viewsController.getManageBookings);

router.get('/my-tours', authJwt.verifyToken, viewsController.getMyTours);

router
  .route('/my-favorites')
  .get(authJwt.verifyToken, viewsController.getMyFavoriteTours);

router.post('/submit-user-data', authJwt.verifyToken, viewsController.updateUserData);

// GET list of reviews home URI
router
  .route('/my-reviews')
  .get(authJwt.verifyToken, viewsController.getMyReviews)

router
  .route('/review')
  .get(authJwt.verifyToken, viewsController.getReviewForm)


module.exports = router;
