const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const { OTP_LENGTH } = require('../config/server_config');

// Generates a cryptographically random numeric OTP
// Default length is controlled by OTP_LENGTH env variable
function generateOTP(length = OTP_LENGTH) {
    // Build a numeric-only OTP using crypto randomInt for each digit
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += crypto.randomInt(0, 10).toString();
    }
    return otp;
}

// Hashes an OTP using bcrypt before storing in DB
// saltRounds = 10 is sufficient since OTPs are already short-lived
async function hashOTP(otp) {
    return bcrypt.hash(otp, 10);
}

// Compares a plain OTP against a stored bcrypt hash
async function compareOTP(plainOtp, hashedOtp) {
    return bcrypt.compare(plainOtp, hashedOtp);
}

module.exports = { generateOTP, hashOTP, compareOTP };
