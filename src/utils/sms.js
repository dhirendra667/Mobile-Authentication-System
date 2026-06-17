const {
    SMS_PROVIDER,
    FAST2SMS_API_KEY,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
    MSG91_AUTH_KEY,
    MSG91_SENDER_ID,
    MSG91_TEMPLATE_ID,
    NODE_ENV,
} = require('../config/server_config');

// Sends an OTP SMS via the configured provider.
//
// Provider options (set SMS_PROVIDER in .env):
//   'fast2sms' — FREE for Indian numbers, no credit card needed (default)
//                Sign up → https://www.fast2sms.com → Dev API → copy API Key
//   'twilio'   — Free trial credit (~$15), works globally
//                Sign up → https://www.twilio.com
//   'msg91'    — Free tier for Indian numbers
//                Sign up → https://msg91.com
//   'console'  — Logs OTP to terminal only, useful for testing without any account
//
// In NODE_ENV=development the provider is ignored and OTP is always logged to console.
async function sendOtpSms(mobile, otp) {
    if (NODE_ENV === 'development' || SMS_PROVIDER === 'console') {
        console.log(`\n========================================`);
        console.log(`  [OTP] Mobile : ${mobile}`);
        console.log(`  [OTP] Code   : ${otp}`);
        console.log(`========================================\n`);
        return { success: true, provider: 'console' };
    }

    if (SMS_PROVIDER === 'fast2sms') {
        return sendViaFast2SMS(mobile, otp);
    }

    if (SMS_PROVIDER === 'twilio') {
        return sendViaTwilio(mobile, otp);
    }

    if (SMS_PROVIDER === 'msg91') {
        return sendViaMSG91(mobile, otp);
    }

    throw new Error(`Unknown SMS_PROVIDER: "${SMS_PROVIDER}". Use fast2sms, twilio, msg91, or console.`);
}

// ─── Fast2SMS (FREE — India only) ─────────────────────────────────────────────
// Steps to get API key (completely free, no credit card):
//   1. Go to https://www.fast2sms.com and create a free account
//   2. Verify your mobile number
//   3. Dashboard → Dev API → copy your API Key
//   4. Set FAST2SMS_API_KEY=<your_key> in .env
async function sendViaFast2SMS(mobile, otp) {
    // Fast2SMS expects 10-digit Indian number without country code
    // Input is E.164 e.g. +919876543210 → strip to 9876543210
    const tenDigitNumber = mobile.replace(/^\+91/, '').replace(/^\+/, '');

    const url = new URL('https://www.fast2sms.com/dev/bulkV2');
    url.searchParams.set('authorization', FAST2SMS_API_KEY);
    url.searchParams.set('variables_values', otp);
    url.searchParams.set('route', 'otp');
    url.searchParams.set('numbers', tenDigitNumber);

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'cache-control': 'no-cache' },
    });

    const data = await response.json();

    if (!response.ok || data.return !== true) {
        throw new Error(`Fast2SMS error: ${JSON.stringify(data.message || data)}`);
    }

    console.log(`Fast2SMS OTP sent to ${mobile}. Request ID: ${data.request_id}`);
    return { success: true, provider: 'fast2sms', request_id: data.request_id };
}

// ─── Twilio ────────────────────────────────────────────────────────────────────
// Steps to get credentials (free trial, ~$15 credit):
//   1. Sign up at https://www.twilio.com
//   2. Console Dashboard → Account SID + Auth Token
//   3. Get a free trial phone number from the console
//   4. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env
//   Note: Trial accounts can only SMS to verified numbers. Upgrade to send to any number.
async function sendViaTwilio(mobile, otp) {
    const twilio = require('twilio'); // loaded lazily — only if provider is twilio
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    const message = await client.messages.create({
        body: `Your verification code is ${otp}. It expires in 10 minutes. Do not share it with anyone.`,
        from: TWILIO_PHONE_NUMBER,
        to: mobile,
    });

    console.log(`Twilio SMS sent to ${mobile}. SID: ${message.sid}`);
    return { success: true, provider: 'twilio', sid: message.sid };
}

// ─── MSG91 ─────────────────────────────────────────────────────────────────────
// Steps to get credentials (free tier for India):
//   1. Sign up at https://msg91.com
//   2. API → Auth Key
//   3. Create an OTP template and get its Template ID
//   4. Set MSG91_AUTH_KEY, MSG91_SENDER_ID, MSG91_TEMPLATE_ID in .env
async function sendViaMSG91(mobile, otp) {
    // MSG91 expects number with country code but without leading +
    const normalizedMobile = mobile.replace(/^\+/, '');

    const payload = {
        template_id: MSG91_TEMPLATE_ID,
        sender: MSG91_SENDER_ID,
        short_url: '0',
        mobiles: normalizedMobile,
        otp: otp,
    };

    const response = await fetch('https://api.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authkey: MSG91_AUTH_KEY,
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.type === 'error') {
        throw new Error(`MSG91 error: ${data.message || 'Unknown error'}`);
    }

    console.log(`MSG91 OTP sent to ${mobile}`);
    return { success: true, provider: 'msg91' };
}

module.exports = { sendOtpSms };
