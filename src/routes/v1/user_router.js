const express = require('express');

const { userController, faceAuthController } = require('../../controllers/index');
const { isLoggedIn } = require('../../middlewares/auth_middleware');
const { validateUpdateBiometric } = require('../../validators/auth_validator');
const { validateRegisterFace } = require('../../validators/face_auth_validator');

const router = express.Router();

// All user routes require a valid JWT
router.use(isLoggedIn);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the logged-in user's profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', userController.getMe);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update the logged-in user's profile (name, age, gender, dob)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               age: { type: integer }
 *               gender: { type: string, enum: [male, female, other] }
 *               date_of_birth: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Updated profile
 *       401:
 *         description: Unauthorized
 */
router.put('/me', userController.updateMe);

/**
 * @swagger
 * /users/me/biometric:
 *   put:
 *     summary: Enable or disable biometric authentication
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnableBiometricRequest'
 *     responses:
 *       200:
 *         description: Biometric settings updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/me/biometric', validateUpdateBiometric, userController.updateBiometric);

/**
 * @swagger
 * /users/me/face:
 *   put:
 *     summary: Register (or re-register) camera-based face authentication
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterFaceRequest'
 *     responses:
 *       200:
 *         description: Face registered
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/me/face', validateRegisterFace, faceAuthController.registerFace);

/**
 * @swagger
 * /users/me/face:
 *   delete:
 *     summary: Disable face authentication and delete the stored embedding
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Face authentication disabled
 *       401:
 *         description: Unauthorized
 */
router.delete('/me/face', faceAuthController.disableFace);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete the logged-in user's account
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted
 *       401:
 *         description: Unauthorized
 */
router.delete('/me', userController.deleteMe);

module.exports = router;