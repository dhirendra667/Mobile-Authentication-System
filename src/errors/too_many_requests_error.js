const { StatusCodes, ReasonPhrases } = require('http-status-codes');

class TooManyRequestsError extends Error {
    constructor(message = 'Too many requests, please try again later') {
        super(message);
        this.statusCode = StatusCodes.TOO_MANY_REQUESTS;
        this.reason = ReasonPhrases.TOO_MANY_REQUESTS;
        this.errorMessage = message;
        this.name = 'TooManyRequestsError';
    }
}

module.exports = TooManyRequestsError;
