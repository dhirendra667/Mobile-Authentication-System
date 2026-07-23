const { DataTypes } = require('sequelize');

const sequelize = require('../config/db_config');

// User model — maps to the "Users" table in PostgreSQL
// Stores profile info, mobile number, and biometric settings
// No passwords — auth is purely OTP-based
const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Name cannot be empty' },
            },
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isInt: { msg: 'Age must be a number' },
                min: { args: [1], msg: 'Age must be at least 1' },
                max: { args: [120], msg: 'Age must be realistic' },
            },
        },
        gender: {
            type: DataTypes.ENUM('male', 'female', 'other'),
            allowNull: false,
            validate: {
                isIn: { args: [['male', 'female', 'other']], msg: 'Gender must be male, female, or other' },
            },
        },
        date_of_birth: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                isDate: { msg: 'Date of birth must be a valid date' },
            },
        },
        mobile: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: { msg: 'Mobile number already registered' },
            validate: {
                notEmpty: { msg: 'Mobile number cannot be empty' },
            },
        },
        // We store only the status and type — never biometric images or raw data
        // Actual biometric verification happens on-device via Android Keystore / Apple Secure Enclave
        biometric_enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        biometric_type: {
            type: DataTypes.ENUM('fingerprint', 'face_id', 'none'),
            allowNull: false,
            defaultValue: 'none',
        },
        // ─── Camera-based Face Authentication ──────────────────────────────
        // Separate from biometric_enabled/biometric_type above, which is
        // strictly for OS-level BiometricPrompt (fingerprint / device Face
        // ID). This is the fallback path for devices with no biometric
        // hardware: a camera captures the face, an on-device model turns it
        // into an embedding, and ONLY that embedding is sent here — never a
        // photo. face_embedding is application-layer encrypted (AES-256-GCM,
        // see src/utils/face_crypto.js) before it reaches Sequelize, so a DB
        // dump alone is not enough to recover it.
        face_auth_enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        face_embedding: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        face_embedding_updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        // ─── Subscription fields ───────────────────────────────────────────
        // Quick-lookup copy of the user's latest plan — Subscriptions table
        // holds the full payment history, this is just so Profile/Home
        // screens don't need a join on every request.
        current_plan: {
            type: DataTypes.ENUM('none', 'basic', 'premium'),
            allowNull: false,
            defaultValue: 'none',
        },
        plan_status: {
            type: DataTypes.ENUM('inactive', 'active'),
            allowNull: false,
            defaultValue: 'inactive',
        },
        // Simple (non-recurring) model — set to paidAt + 30 days on successful
        // payment. Once this date passes, app shows "renew" and user pays again
        // manually. No auto-debit for now.
        next_renewal_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = User;
