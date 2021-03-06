const logger = require("../logger");
const ApiError = require("./data-errors");

//  FIXME: The path shown to user is not correct, linking is correct tho
function apiErrorHandler(err, req, res, next) {
    // in prod, don't use console.log or console.err because
    // it is not async
    err.referer = req.header("Referer");
    err.reqUrl = req.originalUrl;
    logger.error(err);

    var goToUrl = req.header("Referer");
    var path = goToUrl;

    if (err instanceof ApiError) {
        res.status(err.code);
        if (err.url) {
            goToUrl = err.url;
            path = req.hostname;
        }
        if (err.redirect) {
            return res.redirect(goToUrl);
        }

        res.render("errors/basic-error-page", {
            errorMsg: err.message,
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
