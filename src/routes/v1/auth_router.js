const express = require('express');

const {
    signupSendOtp,
    signupVerifyOtp,
    completeSignup,
    signinSendOtp,
    signinVerifyOtp,
    biometricLogin,
} = require('../../controllers/auth_controller');

const {
    validateSendOtp,
    validateVerifyOtp,
    validateCompleteSignup,
    validateBiometricLogin,
} = require('../../validators/auth_validator');

const { otpRateLimiter, biometricRateLimiter } = require('../../middlewares/rate_limit_middleware');

const router = express.Router();

// ─────────────────────────────────── SIGNUP ───────────────────────────────────

/**
 * @swagger
 * /auth/signup/send-otp:
 *   post:
 *     summary: Step 1 — Send OTP to mobile for signup
 *     tags: [Auth - Signup]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupSendOtpRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       409:
 *         description: Mobile already registered
 *       429:
 *         description: Too many OTP requests
 */
router.post('/signup/send-otp', otpRateLimiter, validateSendOtp, signupSendOtp);

/**
 * @swagger
 * /auth/signup/verify-otp:
 *   post:
 *     summary: Step 2 — Verify signup OTP and receive signup_token
 *     tags: [Auth - Signup]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupVerifyOtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified — returns signup_token (valid 5 min)
 *       400:
 *         description: Incorrect or expired OTP
 */
router.post('/signup/verify-otp', validateVerifyOtp, signupVerifyOtp);

/**
 * @swagger
 * /auth/signup/complete:
 *   post:
 *     summary: Step 3 — Submit profile and create account
 *     tags: [Auth - Signup]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompleteSignupRequest'
 *     responses:
 *       201:
 *         description: Account created — returns user and JWT token
 *       400:
 *         description: Validation error or invalid signup_token
 *       409:
 *         description: Mobile already registered
 */
router.post('/signup/complete', validateCompleteSignup, completeSignup);

// ─────────────────────────────────── SIGNIN ───────────────────────────────────

/**
 * @swagger
 * /auth/signin/send-otp:
 *   post:
 *     summary: Step 1 — Send OTP to mobile for signin
 *     tags: [Auth - Signin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SigninSendOtpRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: Mobile not registered
 *       429:
 *         description: Too many OTP requests
 */
router.post('/signin/send-otp', otpRateLimiter, validateSendOtp, signinSendOtp);

/**
 * @swagger
 * /auth/signin/verify-otp:
 *   post:
 *     summary: Step 2 — Verify signin OTP and receive JWT
 *     tags: [Auth - Signin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SigninVerifyOtpRequest'
 *     responses:
 *       200:
 *         description: Signed in — returns user and JWT token
 *       400:
 *         description: Incorrect or expired OTP
 */
router.post('/signin/verify-otp', validateVerifyOtp, signinVerifyOtp);

// ─────────────────────────────── BIOMETRIC LOGIN ──────────────────────────────

/**
 * @swagger
 * /auth/biometric-login:
 *   post:
 *     summary: Login with biometric (called after on-device biometric passes)
 *     tags: [Auth - Biometric]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BiometricLoginRequest'
 *     responses:
 *       200:
 *         description: Biometric login successful — returns user and JWT token
 *       401:
 *         description: Biometric not enabled or type mismatch
 *       404:
 *         description: Mobile not registered
 *       429:
 *         description: Too many biometric attempts
 */
router.post('/biometric-login', biometricRateLimiter, validateBiometricLogin, biometricLogin);

module.exports = router;
