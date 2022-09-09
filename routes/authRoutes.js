const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const bookingRouter = require('./../routes/bookingRoutes');
const { verifySignUp, authJwt } = require('./../middlewares');
const router = express.Router();

// ------------------------------------ TEST API AUTH ENDPOINTS ------------------------------------
router.get("/test/all", userController.allAccess);
router.get("/test/user", [authJwt.verifyToken], userController.userBoard);
router.get("/test/admin", [authJwt.verifyToken, authJwt.isAdmin], userController.adminBoard);
router.get("/test/guide",  [authJwt.verifyToken, authJwt.isGuide], userController.guideBoard);
// ------------------------------------ TEST API AUTH ENDPOINTS ------------------------------------

// Generate OTP secret + token
router.get('/generate2FA', authController.generate2FA);

// Generate OTP secret
router.get('/generate2FASecret', authController.generate2FASecret);

// Generate OTP token
router.get('/generate2FAToken', authController.generate2FAToken);

// Verify OTP token
router.get('/verify2FAToken', authController.verify2FAToken);

module.exports = router;
