const { StatusCodes } = require('http-status-codes');
const errorResponse = require('../utils/error_response');

// Simple field-presence validators — keep it lightweight without extra deps

// Validates mobile number format — accepts E.164 format e.g. +919876543210
function isValidMobile(mobile) {
    return /^\+[1-9]\d{7,14}$/.test(mobile);
}

// Validates ISO date string e.g. 1996-03-15
function isValidDate(dateStr) {
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
}

// ─── Middleware validators ────────────────────────────────────────────────────

function validateSendOtp(req, res, next) {
    const { mobile } = req.body;
    if (!mobile) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'mobile is missing from the request body')
        );
    }
    if (!isValidMobile(mobile)) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'mobile must be a valid E.164 number e.g. +919876543210')
        );
    }
    next();
}

function validateVerifyOtp(req, res, next) {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'mobile and otp are required')
        );
    }
    if (!isValidMobile(mobile)) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'mobile must be a valid E.164 number')
        );
    }
    if (!/^\d{4,8}$/.test(otp)) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'otp must be a numeric string between 4 and 8 digits')
        );
    }
    next();
}

function validateCompleteSignup(req, res, next) {
    const { signup_token, mobile, name, age, gender, date_of_birth } = req.body;

    if (!signup_token) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'signup_token is missing from the request body')
        );
    }
    if (!mobile || !isValidMobile(mobile)) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'valid mobile number is required')
        );
    }
    if (!name || name.trim().length < 2) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'name must be at least 2 characters')
        );
    }
    if (!age || isNaN(age) || age < 1 || age > 120) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'age must be a number between 1 and 120')
        );
    }
    if (!gender || !['male', 'female', 'other'].includes(gender)) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'gender must be male, female, or other')
        );
    }
    if (!date_of_birth || !isValidDate(date_of_birth)) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'date_of_birth must be a valid date in YYYY-MM-DD format')
        );
    }

    // Optional biometric fields validation
    if (req.body.biometric_type &&
        !['fingerprint', 'face_id', 'none'].includes(req.body.biometric_type)) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'biometric_type must be fingerprint, face_id, or none')
        );
    }

    next();
}

function validateBiometricLogin(req, res, next) {
    const { mobile, biometric_type } = req.body;
    if (!mobile || !isValidMobile(mobile)) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'valid mobile number is required')
        );
    }
    if (!biometric_type || !['fingerprint', 'face_id'].includes(biometric_type)) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'biometric_type must be fingerprint or face_id')
        );
    }
    next();
}

function validateUpdateBiometric(req, res, next) {
    const { biometric_enabled, biometric_type } = req.body;
    if (typeof biometric_enabled !== 'boolean') {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'biometric_enabled must be a boolean')
        );
    }
    if (!biometric_type || !['fingerprint', 'face_id', 'none'].includes(biometric_type)) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'biometric_type must be fingerprint, face_id, or none')
        );
    }
    // If enabling biometrics, type cannot be 'none'
    if (biometric_enabled && biometric_type === 'none') {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'biometric_type must be fingerprint or face_id when biometric_enabled is true')
        );
    }
    next();
}

module.exports = {
    validateSendOtp,
    validateVerifyOtp,
    validateCompleteSignup,
    validateBiometricLogin,
    validateUpdateBiometric,
};
