const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const bookingRouter = require('./../routes/bookingRoutes');
const { verifySignUp, authJwt } = require('./../middlewares');
const router = express.Router();

// ------------------------------------ TEST API AUTH ENDPOINTS ------------------------------------



// ------------------------------------ TEST API AUTH ENDPOINTS ------------------------------------

// GET or POST /users/{{userId}}/bookings
// router.use('/:userId/bookings', bookingRouter);

router.post('/signup', verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted, authController.signup);
// Verify user account by email link before logging in
router.patch('/verify/:verifyToken', authController.verifyUserAccount);
router.post('/login', authJwt.isAccountVerified, authController.login);

// Authenticate using two factor authentication providing time-based one-time password (TOTP) secret
router.post('/loginTOTP', authController.loginTOTP);

router.get('/logout', authController.logout);

// Renew access token using refresh token
router.post('/refreshtoken', authController.renewAccessToken);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:accessToken', authController.resetPassword);

// Check if accessToken remains valid and set global authenticated user.
// all routes after this middleware will be affected
router.use(authJwt.verifyToken);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMyPassword', authController.updatePassword);
router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// GET or POST /users/{{userId}}/bookings
router.use('/:userId/bookings', bookingRouter);

router.use(authJwt.restrictToRoles('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
