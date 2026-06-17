const { StatusCodes, ReasonPhrases } = require('http-status-codes');

class ConflictError extends Error {
    constructor(resource, reason = null) {
        const errorMessage = `${resource} already exists`;
        super(errorMessage);
        this.statusCode = StatusCodes.CONFLICT;
        this.reason = reason ? reason : ReasonPhrases.CONFLICT;
        this.errorMessage = errorMessage;
        this.name = 'ConflictError';
    }
}

module.exports = ConflictError;
