const { StatusCodes } = require('http-status-codes');

class PaymentFailedError extends Error {
    constructor(message = 'Payment verification failed. Please try again.') {
        super(message);
        this.statusCode = StatusCodes.BAD_REQUEST;
        this.reason = 'Payment Verification Failed';
        this.errorMessage = message;
        this.name = 'PaymentFailedError';
    }
}

module.exports = PaymentFailedError;
