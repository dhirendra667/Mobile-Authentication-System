const swaggerJsdoc = require('swagger-jsdoc');

const { PORT } = require('./server_config');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Mobile Authentication API',
            version: '1.0.0',
            description:
                'REST API for mobile authentication — OTP-based Signup/Signin, JWT, and Biometric login support.',
        },
        servers: [{ url: `http://localhost:${PORT}/api/v1` }],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                // ─── Request Bodies ────────────────────────────────────────────
                SignupSendOtpRequest: {
                    type: 'object',
                    required: ['mobile'],
                    properties: {
                        mobile: { type: 'string', example: '+919876543210' },
                    },
                },
                SignupVerifyOtpRequest: {
                    type: 'object',
                    required: ['mobile', 'otp'],
                    properties: {
                        mobile: { type: 'string', example: '+919876543210' },
                        otp: { type: 'string', example: '483921' },
                    },
                },
                CompleteSignupRequest: {
                    type: 'object',
                    required: ['mobile', 'signup_token', 'name', 'age', 'gender', 'date_of_birth'],
                    properties: {
                        mobile: { type: 'string', example: '+919876543210' },
                        signup_token: { type: 'string', example: '<short_lived_jwt>' },
                        name: { type: 'string', example: 'Ravi Kumar' },
                        age: { type: 'integer', example: 28 },
                        gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
                        date_of_birth: { type: 'string', format: 'date', example: '1996-03-15' },
                        biometric_enabled: { type: 'boolean', example: false },
                        biometric_type: {
                            type: 'string',
                            enum: ['fingerprint', 'face_id', 'none'],
                            example: 'none',
                        },
                    },
                },
                SigninSendOtpRequest: {
                    type: 'object',
                    required: ['mobile'],
                    properties: {
                        mobile: { type: 'string', example: '+919876543210' },
                    },
                },
                SigninVerifyOtpRequest: {
                    type: 'object',
                    required: ['mobile', 'otp'],
                    properties: {
                        mobile: { type: 'string', example: '+919876543210' },
                        otp: { type: 'string', example: '374821' },
                    },
                },
                BiometricLoginRequest: {
                    type: 'object',
                    required: ['mobile', 'biometric_type'],
                    properties: {
                        mobile: { type: 'string', example: '+919876543210' },
                        biometric_type: {
                            type: 'string',
                            enum: ['fingerprint', 'face_id'],
                            example: 'face_id',
                        },
                    },
                },
                EnableBiometricRequest: {
                    type: 'object',
                    required: ['biometric_enabled', 'biometric_type'],
                    properties: {
                        biometric_enabled: { type: 'boolean', example: true },
                        biometric_type: {
                            type: 'string',
                            enum: ['fingerprint', 'face_id', 'none'],
                            example: 'fingerprint',
                        },
                    },
                },
                // ─── Response Bodies ───────────────────────────────────────────
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string' },
                        data: { type: 'object' },
                        error: { type: 'object' },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        data: { type: 'object' },
                        error: { type: 'object' },
                    },
                },
            },
        },
    },
    // Scan all route files for JSDoc @swagger annotations
    apis: ['./src/routes/v1/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
