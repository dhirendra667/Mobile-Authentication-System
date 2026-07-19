const { StatusCodes } = require('http-status-codes');

const { UserRepository } = require('../repositories/index');

const successResponse = require('../utils/success_response');
const errorResponse = require('../utils/error_response');

// @ROUTE  PUT /api/v1/users/me/face
// @DESC   Register (or re-register) the logged-in user's face embedding
// @ACCESS Private
async function registerFace(req, res) {
    try {
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
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Face authentication disabled successfully', user));
    } catch (error) {
        console.log('disableFace:', error.message);
        return res.status(error.statusCode || 500).json(errorResponse(error.reason, error.errorMessage));
    }
}


module.exports = { registerFace, disableFace };
