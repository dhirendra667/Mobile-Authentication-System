'use strict';

const bcrypt = require('bcryptjs');

// Seeder: demo-otp
// Creates a pre-verified OTP record AND a fresh usable signin OTP for the demo user.
//
// ┌─────────────────────────────────────────────────────────────┐
// │  To test SIGNIN without SMS:                                │
// │    Mobile : +919999900000                                   │
// │    OTP    : 123456                                          │
// │    Route  : POST /api/v1/auth/signin/verify-otp             │
// │                                                             │
// │  This OTP is valid for 30 minutes from seeding time.        │
// │  After use, re-run: npm run db:seed:undo && npm run db:seed │
// └─────────────────────────────────────────────────────────────┘
//
// Run with:  npm run db:seed
// Undo with: npm run db:seed:undo

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        // Hash the demo OTP "123456"
        const demoOtpHash = await bcrypt.hash('123456', 10);

        // 30-minute expiry from now — gives plenty of time to test
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        await queryInterface.bulkInsert('OtpVerifications', [
            {
                // Record 1: A fresh, usable signin OTP — use this to test signin
                mobile: '+919999900000',
                otp_hash: demoOtpHash,
                purpose: 'signin',
                expires_at: expiresAt,
                is_verified: false,
                attempts: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                // Record 2: A fresh, usable signup OTP — use this to test the
                // signup/verify-otp step with mobile +919999911111 (not yet registered)
                mobile: '+919999911111',
                otp_hash: demoOtpHash,
                purpose: 'signup',
                expires_at: expiresAt,
                is_verified: false,
                attempts: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        console.log('\n=== SEEDER: Demo OTPs ===');
        console.log('Signin  → mobile: +919999900000 | OTP: 123456 | valid 30 min');
        console.log('Signup  → mobile: +919999911111 | OTP: 123456 | valid 30 min');
        console.log('========================\n');
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('OtpVerifications', {
            mobile: ['+919999900000', '+919999911111'],
        });
    },
};
