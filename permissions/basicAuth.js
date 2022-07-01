const ApiError = require("../error/data-errors");
const { ROLE, COMMITTEEROLE } = require("../models/data");

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

function authRole(neededRole) {
    return (req, res, next) => {
        if (!hasPermission(req.user.websiteRole, neededRole)) {
            next(ApiError.forbidden("You do not have the permissions"));
            return;
        }
        next();
    };
}

function hasPermission(userRole, neededRole) {
    console.log("hasPermission");
    console.log(userRole, neededRole);
    if (userRole == neededRole) return true;
    if (userRole == ROLE.ADMIN) return true;
    if (
        userRole == ROLE.BOARD &&
        (neededRole == ROLE.BASIC ||
            neededRole == COMMITTEEROLE.CHAIR ||
            neededRole == COMMITTEEROLE.MEMBER)
    )
        return true;
    if (userRole == COMMITTEEROLE.CHAIR && neededRole == COMMITTEEROLE.MEMBER)
        return true;
    return false;
}

module.exports = { authUser, notAuthUser, authRole, hasPermission };
