const { StatusCodes, ReasonPhrases } = require('http-status-codes');

class BadRequestError extends Error {
    constructor(property, isInvalid = false, reason = null) {
        const errorMessage = isInvalid
            ? `${property} is invalid in the request`
            : `${property} is missing from the request body`;
        super(errorMessage);
        this.statusCode = StatusCodes.BAD_REQUEST;
        this.reason = reason ? reason : ReasonPhrases.BAD_REQUEST;
        this.errorMessage = errorMessage;
        this.name = 'BadRequestError';
    }
}

module.exports = BadRequestError;
