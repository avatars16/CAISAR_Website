class ApiError {
    constructor(code, message) {
        this.code = code;
        this.message = message;
    }

    // Client error: e.g., malformed request syntax, invalid request message framing, or deceptive request routing
    static badRequest(msg) {
        return new ApiError(400, msg);
    }

    // Client is not authenticated
    static unautharized(msg) {
        return new ApiError(401, msg);
    }

    //Client is authenticated, but has not acces to this page
    static forbidden(msg) {
        return new ApiError(403, msg);
    }

    //URL is not recognized
    static notFound(msg) {
        return new ApiError(404, msg);
    }

    //Internal server error
    static internal(msg) {
        return new ApiError(500, msg);
    }
}

module.exports = ApiError;
