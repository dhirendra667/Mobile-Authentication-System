const { OTP_EXPIRY_MINUTES, OTP_RATE_LIMIT_MAX, OTP_RATE_LIMIT_WINDOW_MINUTES } = require('../config/server_config');
const { generateOTP, hashOTP, compareOTP } = require('../utils/otp');
const { sendOtpSms } = require('../utils/sms');

const BadRequestError = require('../errors/bad_request_error');
const TooManyRequestsError = require('../errors/too_many_requests_error');
const InternalServerError = require('../errors/internal_server_error');

// Max wrong attempts allowed before an OTP is invalidated
const MAX_OTP_ATTEMPTS = 3;

class OtpService {

    constructor(otpRepository) {
        this.otpRepository = otpRepository;
    }

    // Generates a fresh OTP, hashes it, stores it, and sends it via SMS
    // Also enforces a DB-level rate limit (belt-and-suspenders with the HTTP middleware)
    async sendOtp(mobile, purpose) {
        try {
            // DB-level rate limit check — max N sends per window per mobile+purpose
            const windowStart = new Date(
                Date.now() - OTP_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
            );
            const recentCount = await this.otpRepository.countRecentOtps(mobile, purpose, windowStart);

            if (recentCount >= OTP_RATE_LIMIT_MAX) {
                throw new TooManyRequestsError(
                    `Too many OTP requests. Please wait ${OTP_RATE_LIMIT_WINDOW_MINUTES} minutes before retrying.`
                );
            }

            // Generate OTP and calculate expiry
            const otp = generateOTP();
            const otp_hash = await hashOTP(otp);
            const expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

            // Persist hashed OTP record
            await this.otpRepository.createOtp(mobile, otp_hash, purpose, expires_at);

            // Send plain OTP via SMS (dev mode logs to console)
            await sendOtpSms(mobile, otp);

            return {
                message: `OTP sent to ${mobile}`,
                expires_in_minutes: OTP_EXPIRY_MINUTES,
            };
        } catch (error) {
            if (error.name === 'TooManyRequestsError') throw error;
            console.log('OtpService: sendOtp', error);
            throw new InternalServerError();
        }
    }

    // Verifies the OTP entered by the user against the latest active DB record
    // Returns the verified OTP record id on success (used to flag is_verified)
    async verifyOtp(mobile, plainOtp, purpose) {
        // Find latest unexpired, unverified OTP for this mobile + purpose
        const otpRecord = await this.otpRepository.findLatestActiveOtp(mobile, purpose);

        if (!otpRecord) {
            throw new BadRequestError('OTP', true, 'OTP has expired or does not exist. Please request a new one.');
        }

        // Guard against brute force — lock after MAX_OTP_ATTEMPTS wrong guesses
        if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
            throw new BadRequestError('OTP', true, 'OTP has been locked after too many failed attempts. Please request a new one.');
        }

        // Compare plain OTP with stored hash
        const isMatch = await compareOTP(plainOtp, otpRecord.otp_hash);

        if (!isMatch) {
            // Increment attempt counter before throwing
            await this.otpRepository.incrementAttempts(otpRecord.id);
            const remainingAttempts = MAX_OTP_ATTEMPTS - (otpRecord.attempts + 1);
            throw new BadRequestError('OTP', true, `Incorrect OTP. ${remainingAttempts} attempt(s) remaining.`);
        }

        // Mark OTP as verified so it cannot be reused
        await this.otpRepository.markAsVerified(otpRecord.id);

        return { verified: true, otpId: otpRecord.id };
    }
}

module.exports = OtpService;
