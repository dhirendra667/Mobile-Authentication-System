'use strict';

const bcrypt = require('bcryptjs');

// Seeder: demo-user
// Creates one ready-to-use demo user so you can test protected endpoints
// immediately without going through the full signup flow.
//
// Demo user credentials:
//   Mobile : +919999900000
//   JWT    : run `npm run db:seed` then check console OR use /api/v1/auth/signin/send-otp
//
// Run with:  npm run db:seed
// Undo with: npm run db:seed:undo

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('Users', [
            {
                name: 'Demo User',
                age: 25,
                gender: 'male',
                date_of_birth: '1999-01-15',
                mobile: '+919999900000',
                biometric_enabled: false,
                biometric_type: 'none',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('Users', { mobile: '+919999900000' });
    },
};
