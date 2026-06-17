function successResponse(message, data = {}) {
    return {
        success: true,
        data: data,
        message: message,
        error: {},
    };
}

module.exports = successResponse;
