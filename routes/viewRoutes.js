const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const { authJwt } = require('./../middlewares');

const router = express.Router();

router.use(viewsController.alerts);

router.get('/', authController.isLoggedIn, viewsController.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authJwt.verifyToken, viewsController.getAccount);

router.get('/my-tours', authJwt.verifyToken, viewsController.getMyTours);

router.post('/submit-user-data', authJwt.verifyToken, viewsController.updateUserData);

module.exports = router;
