const { StatusCodes } = require('http-status-codes');
const errorResponse = require('../utils/error_response');

// Same lightweight, dependency-free validation style as auth_validator.js

function validateCreateOrder(req, res, next) {
    const { plan } = req.body;

    if (!plan) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'plan is missing from the request body')
        );
    }
    if (!['basic', 'premium'].includes(plan)) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'plan must be either basic or premium')
        );
    }
    next();
}

function validateVerifyPayment(req, res, next) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse(
                'Bad Request',
                'razorpay_order_id, razorpay_payment_id, and razorpay_signature are all required'
            )
        );
    }
    next();
}

module.exports = { validateCreateOrder, validateVerifyPayment };
