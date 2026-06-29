const { createRazorpayOrder, verifyPaymentSignature } = require('../utils/razorpay_helper');
const { SUBSCRIPTION_VALIDITY_DAYS } = require('../config/server_config');

const BadRequestError = require('../errors/bad_request_error');
const NotFoundError = require('../errors/not_found_error');
const PaymentFailedError = require('../errors/payment_failed_error');
const InternalServerError = require('../errors/internal_server_error');

// Plan catalog — single source of truth for plan names and prices
// If pricing ever changes, this is the only place to touch
const PLAN_CATALOG = {
    basic: { plan: 'basic', amount: 49 },
    premium: { plan: 'premium', amount: 99 },
};

// SubscriptionService orchestrates the Razorpay order → payment → plan activation flow
// Repository handles DB work, razorpay_helper handles all Razorpay SDK/crypto work
class SubscriptionService {

    constructor(subscriptionRepository, userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
    }

    // Step 1: Create a Razorpay order for the chosen plan
    // Returns everything the app needs to open the Razorpay checkout screen
    async createOrder(userId, planKey) {
        try {
            const planDetails = PLAN_CATALOG[planKey];
            if (!planDetails) {
                throw new BadRequestError('plan', true, 'plan must be either basic or premium');
            }

            // receipt is just a traceable reference string, not used for logic
            const receipt = `user_${userId}_${Date.now()}`;
            const order = await createRazorpayOrder(planDetails.amount, receipt);

            // Log the order attempt immediately — status 'created'
            // If the user abandons checkout, we still have a record of it
            await this.subscriptionRepository.createSubscription({
                user_id: userId,
                plan: planDetails.plan,
                amount: planDetails.amount,
                razorpay_order_id: order.id,
                status: 'created',
            });

            return {
                order_id: order.id,
                amount: order.amount, // in paise — frontend passes this straight to Razorpay checkout
                currency: order.currency,
                plan: planDetails.plan,
            };
        } catch (error) {
            if (error.name === 'BadRequestError') throw error;
            console.log('SubscriptionService: createOrder', error);
            throw new InternalServerError();
        }
    }

    // Step 2: Verify the payment Razorpay sent back after checkout
    // On success, activates the plan on the user's account
    async verifyPayment(userId, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
        try {
            const subscription = await this.subscriptionRepository.findByOrderId(razorpay_order_id);

            if (!subscription || subscription.user_id !== userId) {
                throw new NotFoundError('Subscription order', 'razorpay_order_id', razorpay_order_id);
            }

            const isSignatureValid = verifyPaymentSignature(
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            );

            if (!isSignatureValid) {
                await this.subscriptionRepository.updateSubscription(subscription.id, { status: 'failed' });
                throw new PaymentFailedError('Payment signature mismatch. This payment could not be verified.');
            }

            // Signature checks out — activate the plan
            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + SUBSCRIPTION_VALIDITY_DAYS);

            const updatedSubscription = await this.subscriptionRepository.updateSubscription(subscription.id, {
                razorpay_payment_id,
                razorpay_signature,
                status: 'paid',
                valid_until: validUntil,
            });

            const updatedUser = await this.userRepository.updateUser(userId, {
                current_plan: subscription.plan,
                plan_status: 'active',
                next_renewal_date: validUntil,
            });

            return { user: updatedUser, subscription: updatedSubscription };
        } catch (error) {
            if (
                error.name === 'NotFoundError' ||
                error.name === 'PaymentFailedError'
            ) throw error;
            console.log('SubscriptionService: verifyPayment', error);
            throw new InternalServerError();
        }
    }

    // "Skip for Now" — user moves on without picking a plan
    // Just confirms the user stays on the default free/no-plan state
    async skip(userId) {
        try {
            const updatedUser = await this.userRepository.updateUser(userId, {
                current_plan: 'none',
                plan_status: 'inactive',
                next_renewal_date: null,
            });
            if (!updatedUser) throw new NotFoundError('User', 'id', userId);
            return updatedUser;
        } catch (error) {
            if (error.name === 'NotFoundError') throw error;
            console.log('SubscriptionService: skip', error);
            throw new InternalServerError();
        }
    }

    // Used by Home/Profile screens to show current plan + renewal date
    async getStatus(userId) {
        try {
            const user = await this.userRepository.getUserById(userId);
            if (!user) throw new NotFoundError('User', 'id', userId);

            // Renewal date in the past means the plan has lapsed —
            // app should treat this as "needs renewal" even if plan_status
            // in the DB still says active (we don't run a background job for this)
            const hasLapsed =
                user.next_renewal_date && new Date(user.next_renewal_date) < new Date();

            return {
                current_plan: user.current_plan,
                plan_status: hasLapsed ? 'inactive' : user.plan_status,
                next_renewal_date: user.next_renewal_date,
                needs_renewal: Boolean(hasLapsed),
            };
        } catch (error) {
            if (error.name === 'NotFoundError') throw error;
            console.log('SubscriptionService: getStatus', error);
            throw new InternalServerError();
        }
    }
}

module.exports = SubscriptionService;
