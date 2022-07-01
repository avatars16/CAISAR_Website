class ApiError {
    constructor(code, message, redirect, url) {
        this.code = code;
        this.message = message;
        this.url = url;
        this.redirect = redirect;
    }

    // Client error: e.g., malformed request syntax, invalid request message framing, or deceptive request routing
    static badRequest(msg, redirect = false, url) {
        return new ApiError(400, msg, redirect, url);
    }

    // Client is not authenticated
    static unautharized(msg, redirect = false, url) {
        return new ApiError(401, msg, redirect, url);
    }

    //Client is authenticated, but has not acces to this page
    static forbidden(msg, redirect = false, url) {
        return new ApiError(403, msg, redirect, url);
    }

    //URL is not recognized
    static notFound(msg, redirect = false, url) {
        return new ApiError(404, msg, redirect, url);
    }

    //Internal server error
    static internal(msg, redirect = false, url) {
        return new ApiError(500, msg, redirect, url);
    }
}

module.exports = ApiError;
