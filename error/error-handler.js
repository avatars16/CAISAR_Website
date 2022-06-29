const ApiError = require("./data-errors");

function apiErrorHandler(err, req, res, next) {
    // in prod, don't use console.log or console.err because
    // it is not async
    console.log(req.originalUrl);
    console.error(err);

    if (err instanceof ApiError) {
        res.status(err.code);
        res.render("errors/basic-error-page", { errorMsg: err.message });
        return;
    }

    res.status(500);
    res.render("errors/basic-error-page", { errorMsg: "something went wrong" });
}

module.exports = apiErrorHandler;
