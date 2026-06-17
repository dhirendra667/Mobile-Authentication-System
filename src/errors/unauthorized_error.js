const { StatusCodes, ReasonPhrases } = require('http-status-codes');

class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized, please login to continue') {
        super(message);
        this.statusCode = StatusCodes.UNAUTHORIZED;
        this.reason = ReasonPhrases.UNAUTHORIZED;
        this.errorMessage = message;
        this.name = 'UnauthorizedError';
    }
}

module.exports = UnauthorizedError;
