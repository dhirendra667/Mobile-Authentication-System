const Razorpay = require('razorpay');

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = require('./server_config');

// Single shared Razorpay SDK instance, used for order creation
// Payment signature verification does NOT need this instance — it only needs
// the key_secret, and is done manually with crypto in utils/razorpay_helper.js
const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

module.exports = razorpayInstance;
