const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Database
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT || 5432,

    // JWT
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',

    // OTP
    OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES) || 10,
    OTP_LENGTH: parseInt(process.env.OTP_LENGTH) || 6,
    OTP_RATE_LIMIT_MAX: parseInt(process.env.OTP_RATE_LIMIT_MAX) || 5,
    OTP_RATE_LIMIT_WINDOW_MINUTES: parseInt(process.env.OTP_RATE_LIMIT_WINDOW_MINUTES) || 15,

    // SMS
    // Providers: 'fast2sms' (free, India) | 'twilio' (trial) | 'msg91' (free tier) | 'console' (dev/test only)
    SMS_PROVIDER: process.env.SMS_PROVIDER || 'fast2sms',

    // Fast2SMS — completely free for Indian numbers, no credit card needed
    // Sign up at https://www.fast2sms.com → Dashboard → Dev API → API Key
    FAST2SMS_API_KEY: process.env.FAST2SMS_API_KEY,

    // Twilio — free trial credit (~$15), trial numbers only send to verified numbers
    // Sign up at https://www.twilio.com
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,

    // MSG91 — free tier for Indian numbers
    // Sign up at https://msg91.com
    MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY,
    MSG91_SENDER_ID: process.env.MSG91_SENDER_ID || 'MAUTH',
    MSG91_TEMPLATE_ID: process.env.MSG91_TEMPLATE_ID,

    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};
