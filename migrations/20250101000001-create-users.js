'use strict';

// Migration: create-users
// Creates the Users table with mobile-auth specific fields
// Run with:  npm run db:migrate
// Undo with: npm run db:migrate:undo

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Users', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            age: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            gender: {
                type: Sequelize.ENUM('male', 'female', 'other'),
                allowNull: false,
            },
            date_of_birth: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
            mobile: {
                type: Sequelize.STRING(20),
                allowNull: false,
                unique: true,
            },
            // Biometric settings — we never store biometric images
            // Actual data stays in Android Keystore / Apple Secure Enclave
            biometric_enabled: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            biometric_type: {
                type: Sequelize.ENUM('fingerprint', 'face_id', 'none'),
                allowNull: false,
                defaultValue: 'none',
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
    },

    async down(queryInterface) {
        await queryInterface.dropTable('Users');
        // Drop ENUMs manually for PostgreSQL
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_gender";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_biometric_type";');
    },
};
