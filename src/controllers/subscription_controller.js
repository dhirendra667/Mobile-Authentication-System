const { StatusCodes } = require('http-status-codes');

const { SubscriptionService } = require('../services/index');
const { SubscriptionRepository, UserRepository } = require('../repositories/index');

const successResponse = require('../utils/success_response');
const errorResponse = require('../utils/error_response');

// Wire up dependencies — same Repository → Service → Controller pattern as auth_controller.js
const subscriptionRepository = new SubscriptionRepository();
const userRepository = new UserRepository();
const subscriptionService = new SubscriptionService(subscriptionRepository, userRepository);

// @ROUTE  POST /api/v1/subscription/create-order
// @DESC   Create a Razorpay order for the chosen plan (basic ₹49 / premium ₹99)
// @ACCESS Private (requires JWT — issued right after signup)
async function createOrder(req, res) {
    try {
        const { plan } = req.body;
        const result = await subscriptionService.createOrder(req.user.id, plan);
        return res.status(StatusCodes.OK).json(successResponse('Order created successfully', result));
    } catch (error) {
        console.log('createOrder:', error.message);
        return res.status(error.statusCode || 500).json(errorResponse(error.reason, error.errorMessage));
    }
}

// @ROUTE  POST /api/v1/subscription/verify-payment
// @DESC   Verify Razorpay payment signature and activate the plan on success
// @ACCESS Private
async function verifyPayment(req, res) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const result = await subscriptionService.verifyPayment(req.user.id, {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });
        return res.status(StatusCodes.OK).json(successResponse('Payment verified, plan activated', result));
    } catch (error) {
        console.log('verifyPayment:', error.message);
        return res.status(error.statusCode || 500).json(errorResponse(error.reason, error.errorMessage));
    }
}

// @ROUTE  POST /api/v1/subscription/skip
// @DESC   "Skip for Now" — user proceeds without picking a plan
// @ACCESS Private
async function skip(req, res) {
    try {
        const user = await subscriptionService.skip(req.user.id);
        return res.status(StatusCodes.OK).json(successResponse('Subscription skipped', user));
    } catch (error) {
        console.log('skip:', error.message);
        return res.status(error.statusCode || 500).json(errorResponse(error.reason, error.errorMessage));
    }
}

// @ROUTE  GET /api/v1/subscription/status
// @DESC   Get the logged-in user's current plan, status, and renewal date
// @ACCESS Private
async function getStatus(req, res) {
    try {
        const status = await subscriptionService.getStatus(req.user.id);
        return res.status(StatusCodes.OK).json(successResponse('Subscription status fetched', status));
    } catch (error) {
        console.log('getStatus:', error.message);
        return res.status(error.statusCode || 500).json(errorResponse(error.reason, error.errorMessage));
    }
}

module.exports = { createOrder, verifyPayment, skip, getStatus };
