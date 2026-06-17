const { StatusCodes } = require('http-status-codes');

const { AuthService, OtpService } = require('../services/index');
const { UserRepository, OtpRepository } = require('../repositories/index');

const successResponse = require('../utils/success_response');
const errorResponse = require('../utils/error_response');

// Wire up dependencies — Repository → OtpService → AuthService
const userRepository = new UserRepository();
const otpRepository = new OtpRepository();
const otpService = new OtpService(otpRepository);
const authService = new AuthService(userRepository, otpService);

// ─── SIGNUP ───────────────────────────────────────────────────────────────────

// @ROUTE  POST /api/v1/auth/signup/send-otp
// @DESC   Step 1 — Send OTP to mobile for signup
// @ACCESS Public
async function signupSendOtp(req, res) {
    try {
        const { mobile } = req.body;
        const result = await authService.signupSendOtp(mobile);
        return res.status(StatusCodes.OK).json(successResponse('OTP sent successfully', result));
    } catch (error) {
        console.log('signupSendOtp:', error.message);
        return res.status(error.statusCode || 500).json(errorResponse(error.reason, error.errorMessage));
    }
}

// @ROUTE  POST /api/v1/auth/signup/verify-otp
// @DESC   Step 2 — Verify OTP and receive a short-lived signup_token
// @ACCESS Public
async function signupVerifyOtp(req, res) {
    try {
        const { mobile, otp } = req.body;
        const result = await authService.signupVerifyOtp(mobile, otp);
        return res.status(StatusCodes.OK).json(successResponse('OTP verified successfully', result));
    } catch (error) {
        console.log('signupVerifyOtp:', error.message);
        return res.status(error.statusCode || 500).json(errorResponse(error.reason, error.errorMessage));
    }
}

// @ROUTE  POST /api/v1/auth/signup/complete
// @DESC   Step 3 — Submit profile details and create account
// @ACCESS Public (requires signup_token from Step 2 in body)
async function completeSignup(req, res) {
    try {
        const result = await authService.completeSignup(req.body.signup_token, req.body);
        return res
            .status(StatusCodes.CREATED)
            .json(successResponse('Account created successfully', result));
    } catch (error) {
        console.log('completeSignup:', error.message);
        return res.status(error.statusCode || 500).json(errorResponse(error.reason, error.errorMessage));
    }
}

// ─── SIGNIN ───────────────────────────────────────────────────────────────────

// @ROUTE  POST /api/v1/auth/signin/send-otp
// @DESC   Step 1 — Send OTP to mobile for signin
// @ACCESS Public
async function signinSendOtp(req, res) {
    try {
        const { mobile } = req.body;
        const result = await authService.signinSendOtp(mobile);
        return res.status(StatusCodes.OK).json(successResponse('OTP sent successfully', result));
    } catch (error) {
        console.log('signinSendOtp:', error.message);
        return res.status(error.statusCode || 500).json(errorResponse(error.reason, error.errorMessage));
    }
}

// @ROUTE  POST /api/v1/auth/signin/verify-otp
// @DESC   Step 2 — Verify OTP and receive a JWT token
// @ACCESS Public
async function signinVerifyOtp(req, res) {
    try {
        const { mobile, otp } = req.body;
        const result = await authService.signinVerifyOtp(mobile, otp);
        return res.status(StatusCodes.OK).json(successResponse('Signed in successfully', result));
    } catch (error) {
        console.log('signinVerifyOtp:', error.message);
        return res.status(error.statusCode || 500).json(errorResponse(error.reason, error.errorMessage));
    }
}

// ─── BIOMETRIC LOGIN ──────────────────────────────────────────────────────────

// @ROUTE  POST /api/v1/auth/biometric-login
// @DESC   Login using biometric (called after on-device biometric passes)
// @ACCESS Public
async function biometricLogin(req, res) {
    try {
        const { mobile, biometric_type } = req.body;
        const result = await authService.biometricLogin(mobile, biometric_type);
        return res.status(StatusCodes.OK).json(successResponse('Biometric login successful', result));
    } catch (error) {
        console.log('biometricLogin:', error.message);
        return res.status(error.statusCode || 500).json(errorResponse(error.reason, error.errorMessage));
    }
}

module.exports = {
    signupSendOtp,
    signupVerifyOtp,
    completeSignup,
    signinSendOtp,
    signinVerifyOtp,
    biometricLogin,
};
