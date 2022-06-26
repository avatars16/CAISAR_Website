const ApiError = require("./data-errors");

function apiErrorHandler(err, req, res, next) {
    // in prod, don't use console.log or console.err because
    // it is not async
    console.error(err);

    if (err instanceof ApiError) {
        console.log(req.originalUrl);
        res.status(err.code).send(err.message);
        return;
    }

    res.status(500).send("something went wrong");
}

module.exports = apiErrorHandler;
