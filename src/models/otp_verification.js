const { DataTypes } = require('sequelize');

const sequelize = require('../config/db_config');

// OtpVerification model — maps to "OtpVerifications" table
// Each row represents one OTP send event
// OTP is stored as a bcrypt hash — never in plain text
const OtpVerification = sequelize.define(
    'OtpVerification',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        mobile: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        // Hashed OTP — plain text OTP is never persisted
        otp_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // 'signup' OTPs are used during registration
        // 'signin' OTPs are used during login
        purpose: {
            type: DataTypes.ENUM('signup', 'signin'),
            allowNull: false,
        },
        // Hard expiry timestamp — checked on every verify attempt
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        // Once verified this flag is set to prevent OTP reuse
        is_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        // Number of wrong verify attempts — capped to prevent brute force
        attempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = OtpVerification;
