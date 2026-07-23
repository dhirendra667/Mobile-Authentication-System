const { StatusCodes } = require('http-status-codes');

const { FaceAuthService } = require('../services/index');
const { UserRepository } = require('../repositories/index');

const successResponse = require('../utils/success_response');
const errorResponse = require('../utils/error_response');

const userRepository = new UserRepository();
const faceAuthService = new FaceAuthService(userRepository);

// @ROUTE  PUT /api/v1/users/me/face
// @DESC   Register (or re-register) the logged-in user's face embedding
// @ACCESS Private
async function registerFace(req, res) {
    try {
        const { embedding } = req.body;
        const user = await faceAuthService.registerFace(req.user.id, embedding);
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Face authentication registered successfully', user));
    } catch (error) {
        console.log('registerFace:', error.message);
        return res.status(error.statusCode || 500).json(errorResponse(error.reason, error.errorMessage));
    }
}

// @ROUTE  DELETE /api/v1/users/me/face
// @DESC   Disable face authentication and delete the stored embedding
// @ACCESS Private
async function disableFace(req, res) {
    try {
        const user = await faceAuthService.disableFace(req.user.id);
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Face authentication disabled successfully', user));
    } catch (error) {
        console.log('disableFace:', error.message);
        return res.status(error.statusCode || 500).json(errorResponse(error.reason, error.errorMessage));
    }
}

// @ROUTE  POST /api/v1/auth/face-login
// @DESC   Login by matching a captured face embedding (camera fallback path)
// @ACCESS Public
async function verifyFace(req, res) {
    try {
        const { mobile, embedding } = req.body;
        const result = await faceAuthService.verifyFace(mobile, embedding);
        return res.status(StatusCodes.OK).json(successResponse('Face login successful', result));
    } catch (error) {
        console.log('verifyFace:', error.message);
        return res.status(error.statusCode || 500).json(errorResponse(error.reason, error.errorMessage));
    }
}

module.exports = { registerFace, disableFace, verifyFace };
