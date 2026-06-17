const { StatusCodes, ReasonPhrases } = require('http-status-codes');

const { verifyToken } = require('../utils/auth');
const errorResponse = require('../utils/error_response');

// Middleware: verifies the Bearer JWT in the Authorization header
// On success attaches decoded payload to req.user and calls next()
function isLoggedIn(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

        if (!token) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json(errorResponse(ReasonPhrases.UNAUTHORIZED, 'No token provided, please login to continue'));
        }

        // verifyToken throws UnauthorizedError if invalid or expired
        const decoded = verifyToken(token);
        req.user = decoded;

        next();
    } catch (error) {
        console.log('auth_middleware: isLoggedIn', error.message);
        return res
            .status(error.statusCode || StatusCodes.UNAUTHORIZED)
            .json(errorResponse(ReasonPhrases.UNAUTHORIZED, error.errorMessage || 'Unauthorized'));
    }
}

module.exports = { isLoggedIn };
