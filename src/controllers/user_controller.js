const { StatusCodes } = require('http-status-codes');

const { UserService } = require('../services/index');
const { UserRepository } = require('../repositories/index');

const successResponse = require('../utils/success_response');
const errorResponse = require('../utils/error_response');

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

// @ROUTE  GET /api/v1/users/me
// @DESC   Get the currently logged-in user's profile
// @ACCESS Private
async function getMe(req, res) {
    try {
        const user = await userService.getUserById(req.user.id);
        return res.status(StatusCodes.OK).json(successResponse('Profile fetched successfully', user));
    } catch (error) {
        return res.status(error.statusCode || 500).json(errorResponse(error.reason, error.errorMessage));
    }
}

// @ROUTE  PUT /api/v1/users/me
// @DESC   Update the currently logged-in user's profile
// @ACCESS Private
async function updateMe(req, res) {
    try {
        // Prevent mobile number from being changed via this endpoint
        const { mobile, biometric_enabled, biometric_type, ...allowedFields } = req.body;
        const user = await userService.updateUser(req.user.id, allowedFields);
        return res.status(StatusCodes.OK).json(successResponse('Profile updated successfully', user));
    } catch (error) {
        return res.status(error.statusCode || 500).json(errorResponse(error.reason, error.errorMessage));
    }
}

// @ROUTE  PUT /api/v1/users/me/biometric
// @DESC   Enable or disable biometric authentication
// @ACCESS Private
async function updateBiometric(req, res) {
    try {
        const { biometric_enabled, biometric_type } = req.body;
        const user = await userService.updateBiometric(req.user.id, biometric_enabled, biometric_type);
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Biometric settings updated successfully', user));
    } catch (error) {
        return res.status(error.statusCode || 500).json(errorResponse(error.reason, error.errorMessage));
    }
}

// @ROUTE  DELETE /api/v1/users/me
// @DESC   Delete the currently logged-in user's account
// @ACCESS Private
async function deleteMe(req, res) {
    try {
        await userService.deleteUser(req.user.id);
        return res.status(StatusCodes.OK).json(successResponse('Account deleted successfully'));
    } catch (error) {
        return res.status(error.statusCode || 500).json(errorResponse(error.reason, error.errorMessage));
    }
}

module.exports = { getMe, updateMe, updateBiometric, deleteMe };
