const ApiError = require("../error/data-errors");

function authUser(req, res, next) {
    if (req.isAuthenticated()) return next();
    next(ApiError.unautharized("You need to be signed in"));
    return;
}

function notAuthUser(req, res, next) {
    if (req.isAuthenticated()) {
        next(
            ApiError.unautharized("You can not acces this page while signed in")
        );
        return;
    }
    return next();
}

function authRole(role) {
    return (req, res, next) => {
        if (req.user.websiteRole !== role) {
            next(ApiError.forbidden("You need to be signed in"));
            return;
        }
        next();
    };
}

module.exports = { authUser, notAuthUser, authRole };
