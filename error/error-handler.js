const ApiError = require("./data-errors");

//TODO: Log to files instead of command line.
function apiErrorHandler(err, req, res, next) {
    // in prod, don't use console.log or console.err because
    // it is not async
    console.log(req.originalUrl);
    console.log(req.header("Referer"));
    console.error(err);

    var goToUrl = req.header("Referer");
    var path = goToUrl;

    if (err instanceof ApiError) {
        res.status(err.code);
        if (err.url) {
            goToUrl = err.url;
            path = req.hostname + err.url;
        }
        if (err.redirect) {
            return res.redirect(goToUrl);
        }

        res.render("errors/basic-error-page", {
            message: err.message,
            url: goToUrl,
            path: path,
        });
        return;
    }

    res.status(500);
    res.render("errors/basic-error-page", {
        errorMsg: "something went wrong",
        url: goToUrl,
        path: path,
    });
}

module.exports = apiErrorHandler;
