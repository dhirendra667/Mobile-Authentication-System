const crypto = require('crypto');

const razorpayInstance = require('../config/razorpay_config');
const { RAZORPAY_KEY_SECRET } = require('../config/server_config');

// Creates a Razorpay order — amountInRupees is converted to paise here
// since Razorpay's API always expects the smallest currency unit
async function createRazorpayOrder(amountInRupees, receipt) {
    return razorpayInstance.orders.create({
        amount: amountInRupees * 100, // paise
        currency: 'INR',
        receipt,
        payment_capture: 1, // auto-capture — no manual capture step needed
    });
}

// Verifies that a payment actually came from Razorpay and was not tampered with
// Razorpay's official recipe: HMAC-SHA256 of "order_id|payment_id" using key_secret
// must match the signature Razorpay sent back to the client after checkout
function verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature) {
    const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    return expectedSignature === razorpay_signature;
}

module.exports = { createRazorpayOrder, verifyPaymentSignature };
