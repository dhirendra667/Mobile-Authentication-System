const jwt = require('jsonwebtoken');

const { JWT_SECRET, JWT_EXPIRY } = require('../config/server_config');
const UnauthorizedError = require('../errors/unauthorized_error');

// Generates a signed JWT with the given payload
function generateJWT(payload, expiresIn = JWT_EXPIRY) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// Verifies a JWT and returns the decoded payload
// Throws UnauthorizedError if the token is invalid or expired
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new UnauthorizedError();
    }
}

module.exports = { generateJWT, verifyToken };
