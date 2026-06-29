'use strict';

// Migration: create-subscriptions
// Creates the Subscriptions table — one row per Razorpay order/payment attempt.
// Keeps a full history (created/paid/failed) even for abandoned checkouts,
// so there's a paper trail if a payment dispute comes up later.
// Run with:  npm run db:migrate
// Undo with: npm run db:migrate:undo

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Subscriptions', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            plan: {
                type: Sequelize.ENUM('basic', 'premium'),
                allowNull: false,
            },
            // Amount in rupees (not paise) — kept human-readable for admin/debugging
            amount: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            razorpay_order_id: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            // Only present once the user actually completes checkout
            razorpay_payment_id: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            razorpay_signature: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            // 'created' -> order created, payment not attempted/completed yet
            // 'paid'    -> signature verified, plan activated
            // 'failed'  -> signature verification failed or payment was rejected
            status: {
                type: Sequelize.ENUM('created', 'paid', 'failed'),
                allowNull: false,
                defaultValue: 'created',
            },
            // Set only when status becomes 'paid' — createdAt + 30 days (simple, no auto-debit)
            valid_until: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        // Index for fast lookup during payment verification (find order by id)
        await queryInterface.addIndex('Subscriptions', ['razorpay_order_id'], {
            name: 'subscriptions_razorpay_order_id_idx',
        });

        // Index for fast lookup of a user's latest subscription
        await queryInterface.addIndex('Subscriptions', ['user_id'], {
            name: 'subscriptions_user_id_idx',
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('Subscriptions');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Subscriptions_plan";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Subscriptions_status";');
    },
};
