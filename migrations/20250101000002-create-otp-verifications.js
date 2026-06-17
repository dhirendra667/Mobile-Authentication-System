'use strict';

// Migration: create-otp-verifications
// Creates the OtpVerifications table for storing hashed OTP records
// Each row tracks a single OTP send event with its purpose, expiry, and verification status
// Run with:  npm run db:migrate
// Undo with: npm run db:migrate:undo

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('OtpVerifications', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            mobile: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },
            // OTP is never stored in plain text — only a bcrypt hash
            otp_hash: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            // Purpose distinguishes signup flow from signin flow
            purpose: {
                type: Sequelize.ENUM('signup', 'signin'),
                allowNull: false,
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            // Tracks whether this OTP was already successfully used
            is_verified: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            // Tracks how many wrong guesses have been made against this OTP
            attempts: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
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

        // Index on mobile + purpose for fast lookups when verifying OTP
        await queryInterface.addIndex('OtpVerifications', ['mobile', 'purpose'], {
            name: 'otp_verifications_mobile_purpose_idx',
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('OtpVerifications');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_OtpVerifications_purpose";');
    },
};
