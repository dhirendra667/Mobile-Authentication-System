const { StatusCodes } = require('http-status-codes');

const errorResponse = require('../utils/error_response');
const { isValidEmbedding } = require('../utils/face_crypto');
const { FACE_EMBEDDING_DIMENSIONS } = require('../config/server_config');

// Same mobile format used across auth_validator.js — kept local to avoid
// a circular import between the two validator files.
function isValidMobile(mobile) {
    return /^\+[1-9]\d{7,14}$/.test(mobile);
}

// POST /users/me/face — registering/updating a face embedding
function validateRegisterFace(req, res, next) {
    const { embedding } = req.body;

    if (!embedding) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'embedding is missing from the request body')
        );
    }

    if (!isValidEmbedding(embedding)) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse(
                'Bad Request',
                `embedding must be an array of ${FACE_EMBEDDING_DIMENSIONS} finite numbers`
            )
        );
    }

    next();
}

// POST /auth/face-login — verifying a face against the stored embedding
function validateFaceLogin(req, res, next) {
    const { mobile, embedding } = req.body;

    if (!mobile || !isValidMobile(mobile)) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse('Bad Request', 'valid mobile number is required')
        );
    }

    if (!embedding || !isValidEmbedding(embedding)) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            errorResponse(
                'Bad Request',
                `embedding must be an array of ${FACE_EMBEDDING_DIMENSIONS} finite numbers`
            )
        );
    }

    next();
}

module.exports = { validateRegisterFace, validateFaceLogin };
