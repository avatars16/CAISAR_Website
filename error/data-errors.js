class ApiError {
    constructor(code, message, error, redirect, url) {
        this.code = code;
        this.message = message;
        this.url = url;
        this.redirect = redirect;
        this.error = error;
    }

    // Client error: e.g., malformed request syntax, invalid request message framing, or deceptive request routing
    static badRequest(msg, error, redirect = false, url) {
        return new ApiError(400, msg, error, redirect, url);
    }

    // Client is not authenticated
    static unautharized(msg, error, redirect = false, url) {
        return new ApiError(401, msg, error, redirect, url);
    }

    //Client is authenticated, but has not acces to this page
    static forbidden(msg, error, redirect = false, url) {
        return new ApiError(403, msg, error, redirect, url);
    }

    //URL is not recognized
    static notFound(msg, error, redirect = false, url) {
        return new ApiError(404, msg, error, redirect, url);
    }

    //Internal server error
    static internal(msg, error, redirect = false, url) {
        return new ApiError(500, msg, error, redirect, url);
    }
}

module.exports = ApiError;
