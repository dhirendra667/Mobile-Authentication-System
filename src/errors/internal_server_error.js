const { StatusCodes, ReasonPhrases } = require('http-status-codes');

class InternalServerError extends Error {
    constructor(message = 'Something went wrong, please try again') {
        super(message);
        this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        this.reason = ReasonPhrases.INTERNAL_SERVER_ERROR;
        this.errorMessage = message;
        this.name = 'InternalServerError';
    }
}

module.exports = InternalServerError;
