const { DataTypes } = require('sequelize');

const sequelize = require('../config/db_config');
const User = require('./user');

// Subscription model — maps to the "Subscriptions" table
// One row per payment attempt — keeps a full history even for failed/abandoned
// orders, so we have a paper trail if a payment dispute comes up later.
// The "current" plan a user is on is read off Users.current_plan (fast lookup,
// no join needed) — this table is the source of truth behind that field.
const Subscription = sequelize.define(
    'Subscription',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
        plan: {
            type: DataTypes.ENUM('basic', 'premium'),
            allowNull: false,
        },
        // Amount in rupees (not paise) — kept human-readable for admin/debugging
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        razorpay_order_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Only present once the user actually completes checkout
        razorpay_payment_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        razorpay_signature: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // 'created'  -> order created, payment not attempted/completed yet
        // 'paid'     -> signature verified, plan activated
        // 'failed'   -> signature verification failed or payment was rejected
        status: {
            type: DataTypes.ENUM('created', 'paid', 'failed'),
            allowNull: false,
            defaultValue: 'created',
        },
        // Set only when status becomes 'paid' — createdAt + 30 days (simple, no auto-debit)
        valid_until: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = Subscription;
