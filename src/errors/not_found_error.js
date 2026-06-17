const { StatusCodes, ReasonPhrases } = require('http-status-codes');

class NotFoundError extends Error {
    constructor(resource, field, value) {
        const errorMessage = `${resource} with ${field} '${value}' not found`;
        super(errorMessage);
        this.statusCode = StatusCodes.NOT_FOUND;
        this.reason = ReasonPhrases.NOT_FOUND;
        this.errorMessage = errorMessage;
        this.name = 'NotFoundError';
    }
}

module.exports = NotFoundError;
