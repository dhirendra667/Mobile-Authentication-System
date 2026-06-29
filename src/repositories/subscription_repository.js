const { Subscription } = require('../models/index');

// SubscriptionRepository handles all direct DB operations for the Subscriptions table
class SubscriptionRepository {

    // Create a new subscription row — called every time a Razorpay order is created
    // (status starts as 'created', updated to 'paid'/'failed' after checkout)
    async createSubscription(data) {
        return Subscription.create(data);
    }

    // Find a subscription row by its Razorpay order id — used during payment verification
    async findByOrderId(razorpay_order_id) {
        return Subscription.findOne({ where: { razorpay_order_id } });
    }

    // Find the most recent subscription row for a user, regardless of status
    async findLatestByUserId(user_id) {
        return Subscription.findOne({
            where: { user_id },
            order: [['createdAt', 'DESC']],
        });
    }

    // Update a subscription row by its primary key
    async updateSubscription(id, data) {
        const [updatedCount, updatedRows] = await Subscription.update(data, {
            where: { id },
            returning: true,
        });
        if (updatedCount === 0) return null;
        return updatedRows[0];
    }
}

module.exports = SubscriptionRepository;
