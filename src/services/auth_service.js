const { generateJWT } = require('../utils/auth');

const BadRequestError = require('../errors/bad_request_error');
const ConflictError = require('../errors/conflict_error');
const NotFoundError = require('../errors/not_found_error');
const UnauthorizedError = require('../errors/unauthorized_error');
const InternalServerError = require('../errors/internal_server_error');

// AuthService orchestrates the full signup and signin flows
// It delegates OTP work to OtpService and DB work to UserRepository
class AuthService {

    constructor(userRepository, otpService) {
        this.userRepository = userRepository;
        this.otpService = otpService;
    }

    // ─── SIGNUP FLOW ──────────────────────────────────────────────────────────

    // Step 1: Send OTP to mobile during signup
    // Rejects if mobile is already registered
    async signupSendOtp(mobile) {
        try {
            const existingUser = await this.userRepository.getUserByMobile(mobile);
            if (existingUser) {
                throw new ConflictError('Mobile number', 'This mobile number is already registered. Please sign in instead.');
            }

            return this.otpService.sendOtp(mobile, 'signup');
        } catch (error) {
            if (error.name === 'ConflictError' || error.name === 'TooManyRequestsError') throw error;
            console.log('AuthService: signupSendOtp', error);
            throw new InternalServerError();
        }
    }

    // Step 2: Verify OTP entered by user during signup
    // On success issues a short-lived signup_token (5 min) used in Step 3
    async signupVerifyOtp(mobile, otp) {
        try {
            await this.otpService.verifyOtp(mobile, otp, 'signup');

            // Issue a short-lived token that authorises the complete-signup call
            // This prevents someone from calling completeSignup without verifying OTP first
            const signupToken = generateJWT({ mobile, purpose: 'signup' }, '5m');

            return { signup_token: signupToken };
        } catch (error) {
            if (error.name === 'BadRequestError') throw error;
            console.log('AuthService: signupVerifyOtp', error);
            throw new InternalServerError();
        }
    }

    // Step 3: Complete signup — save user profile after OTP verified
    // Expects the signup_token issued in Step 2 to be present in the request
    async completeSignup(signupToken, profileData) {
        try {
            const { mobile, purpose } = require('../utils/auth').verifyToken(signupToken);

            if (purpose !== 'signup') {
                throw new UnauthorizedError('Invalid signup token.');
            }

            // Double check the mobile in the token matches the request body
            if (mobile !== profileData.mobile) {
                throw new UnauthorizedError('Mobile number in token does not match request.');
            }

            // Guard against replaying a signup token for an already registered mobile
            const existingUser = await this.userRepository.getUserByMobile(mobile);
            if (existingUser) {
                throw new ConflictError('Mobile number', 'This mobile number is already registered.');
            }

            const user = await this.userRepository.createUser({
                name: profileData.name,
                age: profileData.age,
                gender: profileData.gender,
                date_of_birth: profileData.date_of_birth,
                mobile: mobile,
                biometric_enabled: profileData.biometric_enabled || false,
                biometric_type: profileData.biometric_type || 'none',
            });

            // Issue the main long-lived JWT after account creation
            const token = generateJWT({ id: user.id, mobile: user.mobile });

            return { user, token };
        } catch (error) {
            if (
                error.name === 'UnauthorizedError' ||
                error.name === 'ConflictError' ||
                error.name === 'BadRequestError'
            ) throw error;

            if (error.name === 'SequelizeValidationError') {
                const reason = error.errors.map((e) => e.message);
                throw new BadRequestError(error.errors[0].path, true, reason);
            }

            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new ConflictError('Mobile number', error.errors[0].message);
            }

            console.log('AuthService: completeSignup', error);
            throw new InternalServerError();
        }
    }

    // ─── SIGNIN FLOW ──────────────────────────────────────────────────────────

    // Step 1: Send OTP to mobile during signin
    // Rejects if mobile is not registered
    async signinSendOtp(mobile) {
        try {
            const user = await this.userRepository.getUserByMobile(mobile);
            if (!user) {
                throw new NotFoundError('User', 'mobile', mobile);
            }

            return this.otpService.sendOtp(mobile, 'signin');
        } catch (error) {
            if (error.name === 'NotFoundError' || error.name === 'TooManyRequestsError') throw error;
            console.log('AuthService: signinSendOtp', error);
            throw new InternalServerError();
        }
    }

    // Step 2: Verify OTP and return JWT on success
    async signinVerifyOtp(mobile, otp) {
        try {
            await this.otpService.verifyOtp(mobile, otp, 'signin');

            const user = await this.userRepository.getUserByMobile(mobile);
            if (!user) {
                throw new NotFoundError('User', 'mobile', mobile);
            }

            const token = generateJWT({ id: user.id, mobile: user.mobile });
            return { user, token };
        } catch (error) {
            if (
                error.name === 'BadRequestError' ||
                error.name === 'NotFoundError'
            ) throw error;
            console.log('AuthService: signinVerifyOtp', error);
            throw new InternalServerError();
        }
    }

    // ─── BIOMETRIC LOGIN ──────────────────────────────────────────────────────

    // Biometric login — the mobile app handles actual biometric verification
    // on-device (Android Keystore / Apple Secure Enclave).
    // The app calls this endpoint only AFTER successful local biometric check.
    // We validate: user exists, biometrics are enabled for that type, then issue JWT.
    async biometricLogin(mobile, biometric_type) {
        try {
            const user = await this.userRepository.getUserByMobile(mobile);

            if (!user) {
                throw new NotFoundError('User', 'mobile', mobile);
            }

            if (!user.biometric_enabled) {
                throw new UnauthorizedError('Biometric authentication is not enabled for this account.');
            }

            if (user.biometric_type !== biometric_type) {
                throw new UnauthorizedError(
                    `Biometric type mismatch. Account uses ${user.biometric_type}, but ${biometric_type} was provided.`
                );
            }

            const token = generateJWT({ id: user.id, mobile: user.mobile });
            return { user, token };
        } catch (error) {
            if (
                error.name === 'NotFoundError' ||
                error.name === 'UnauthorizedError'
            ) throw error;
            console.log('AuthService: biometricLogin', error);
            throw new InternalServerError();
        }
    }
}

module.exports = AuthService;
