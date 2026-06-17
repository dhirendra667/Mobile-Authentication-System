const { Op } = require('sequelize');
const { OtpVerification } = require('../models/index');

// OtpRepository handles all direct DB operations for the OtpVerifications table
class OtpRepository {

    // Create a new OTP record — called every time a fresh OTP is sent
    async createOtp(mobile, otp_hash, purpose, expires_at) {
        return OtpVerification.create({ mobile, otp_hash, purpose, expires_at });
    }

    // Find the most recent unverified, unexpired OTP for a mobile + purpose pair
    async findLatestActiveOtp(mobile, purpose) {
        return OtpVerification.findOne({
            where: {
                mobile,
                purpose,
                is_verified: false,
                expires_at: { [Op.gt]: new Date() },
            },
            order: [['createdAt', 'DESC']],
        });
    }

    // Mark an OTP record as verified so it cannot be reused
    async markAsVerified(id) {
        return OtpVerification.update(
            { is_verified: true },
            { where: { id } }
        );
    }

    // Increment the failed attempt counter on an OTP record
    async incrementAttempts(id) {
        return OtpVerification.increment('attempts', { where: { id } });
    }

    // Count how many OTPs have been sent for a mobile+purpose within a time window
    // Used as a DB-level rate limit check (belt-and-suspenders with express-rate-limit)
    async countRecentOtps(mobile, purpose, since) {
        return OtpVerification.count({
            where: {
                mobile,
                purpose,
                createdAt: { [Op.gte]: since },
            },
        });
    }

    // Delete all expired OTP records for a mobile — optional cleanup helper
    async deleteExpiredOtps(mobile) {
        return OtpVerification.destroy({
            where: {
                mobile,
                expires_at: { [Op.lt]: new Date() },
            },
        });
    }
}

module.exports = OtpRepository;
