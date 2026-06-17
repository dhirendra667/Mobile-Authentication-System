const rateLimit = require('express-rate-limit');
const { StatusCodes } = require('http-status-codes');

const { OTP_RATE_LIMIT_MAX, OTP_RATE_LIMIT_WINDOW_MINUTES } = require('../config/server_config');
const errorResponse = require('../utils/error_response');

// HTTP-layer rate limiter for OTP send endpoints
// Keyed by mobile number from request body (not IP) so rate limit is per-user
// Works as the first line of defence — OtpService has a DB-level check as backup

const otpRateLimiter = rateLimit({
    windowMs: OTP_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
    max: OTP_RATE_LIMIT_MAX,

    // Key by mobile number from request body, fall back to IP
    keyGenerator: (req) => {
        return req.body?.mobile || req.ip;
    },

    // Return consistent JSON instead of the default HTML response
    handler: (req, res) => {
        return res.status(StatusCodes.TOO_MANY_REQUESTS).json(
            errorResponse(
                'Too Many Requests',
                `You have exceeded the OTP request limit. Please wait ${OTP_RATE_LIMIT_WINDOW_MINUTES} minutes before trying again.`
            )
        );
    },

    // Skip rate limiting in test environment
    skip: () => process.env.NODE_ENV === 'test',

    standardHeaders: true,  // Return rate limit info in RateLimit-* headers
    legacyHeaders: false,    // Disable X-RateLimit-* headers
});

// Stricter limiter for the biometric login endpoint — prevents mobile enumeration
const biometricRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,

    keyGenerator: (req) => req.body?.mobile || req.ip,

    handler: (req, res) => {
        return res.status(StatusCodes.TOO_MANY_REQUESTS).json(
            errorResponse(
                'Too Many Requests',
                'Too many biometric login attempts. Please wait 15 minutes.'
            )
        );
    },

    skip: () => process.env.NODE_ENV === 'test',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { otpRateLimiter, biometricRateLimiter };
