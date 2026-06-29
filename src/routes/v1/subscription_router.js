const express = require('express');

const { createOrder, verifyPayment, skip, getStatus } = require('../../controllers/subscription_controller');
const { isLoggedIn } = require('../../middlewares/auth_middleware');
const { validateCreateOrder, validateVerifyPayment } = require('../../validators/subscription_validator');

const router = express.Router();

// All subscription routes require a valid JWT — user already has one
// from completeSignup, so this screen sits right after signup, before
// (or instead of) BiometricSetup, depending on the app's nav order.
router.use(isLoggedIn);

/**
 * @swagger
 * /subscription/create-order:
 *   post:
 *     summary: Create a Razorpay order for the selected plan
 *     tags: [Subscription]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       200:
 *         description: Razorpay order created — pass order_id, amount, currency to the checkout SDK
 *       400:
 *         description: plan must be basic or premium
 *       401:
 *         description: Unauthorized
 */
router.post('/create-order', validateCreateOrder, createOrder);

/**
 * @swagger
 * /subscription/verify-payment:
 *   post:
 *     summary: Verify Razorpay payment signature and activate the plan
 *     tags: [Subscription]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyPaymentRequest'
 *     responses:
 *       200:
 *         description: Payment verified — plan activated, next_renewal_date set
 *       400:
 *         description: Payment signature mismatch — payment could not be verified
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No matching order found for this user
 */
router.post('/verify-payment', validateVerifyPayment, verifyPayment);

/**
 * @swagger
 * /subscription/skip:
 *   post:
 *     summary: 'Skip for Now — proceed without selecting a plan'
 *     tags: [Subscription]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User remains on the default no-plan state
 *       401:
 *         description: Unauthorized
 */
router.post('/skip', skip);

/**
 * @swagger
 * /subscription/status:
 *   get:
 *     summary: Get the logged-in user's current plan, status, and renewal date
 *     tags: [Subscription]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current subscription status — used by Home/Profile screens
 *       401:
 *         description: Unauthorized
 */
router.get('/status', getStatus);

module.exports = router;