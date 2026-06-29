'use strict';

// Migration: add-subscription-fields-to-users
// Adds quick-lookup subscription fields to the existing Users table.
// Full payment history lives in the Subscriptions table (see next migration) —
// these three fields just let Home/Profile screens read current plan status
// without a join on every request.
// Run with:  npm run db:migrate
// Undo with: npm run db:migrate:undo

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Users', 'current_plan', {
            type: Sequelize.ENUM('none', 'basic', 'premium'),
            allowNull: false,
            defaultValue: 'none',
        });

        await queryInterface.addColumn('Users', 'plan_status', {
            type: Sequelize.ENUM('inactive', 'active'),
            allowNull: false,
            defaultValue: 'inactive',
        });

        // Simple (non-recurring) model — set to paidAt + 30 days on successful
        // payment. No auto-debit, user renews manually once this date passes.
        await queryInterface.addColumn('Users', 'next_renewal_date', {
            type: Sequelize.DATE,
            allowNull: true,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Users', 'current_plan');
        await queryInterface.removeColumn('Users', 'plan_status');
        await queryInterface.removeColumn('Users', 'next_renewal_date');

        // Drop ENUMs manually for PostgreSQL
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_current_plan";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_plan_status";');
    },
};
