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
    },
    {
        timestamps: true,
    }
);

module.exports = User;
