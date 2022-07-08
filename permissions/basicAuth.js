const ApiError = require("../error/data-errors");
const { ROLE, COMMITTEEROLE } = require("../controllers/data");
const { getMemberRoleInCommittee } = require("../controllers/committees-api");

function authUser(req, res, next) {
    if (req.isAuthenticated()) return next();
    next(ApiError.unautharized("You need to be signed in", false, "/ls/login"));
    return;
}

function notAuthUser(req, res, next) {
    if (req.isAuthenticated()) {
        next(
            ApiError.unautharized(
                "You can not acces this page while signed in",
                true,
                "/ls/"
            )
        );
        return;
    }
    return next();
}

function authRole(neededRole) {
    return (req, res, next) => {
        console.log("test");
        if (!hasPermission(req.user.websiteRole, neededRole)) {
            next(ApiError.forbidden("You do not have the permissions"));
            return;
        }
        next();
    };
}

function hasPermission(userRole, neededRole) {
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

async function getCommitteeMemberPermission(committeeName, user) {
    if (user == null) return false;
    let memberRole = COMMITTEEROLE.MEMBER;
    possibleMemberRole = await getMemberRoleInCommittee(
        committeeName,
        user.userId
    );
    if (possibleMemberRole) memberRole = possibleMemberRole;
    return (
        hasPermission(user.websiteRole, COMMITTEEROLE.CHAIR) ||
        hasPermission(memberRole, COMMITTEEROLE.CHAIR)
    );
}

module.exports = {
    authUser,
    notAuthUser,
    authRole,
    hasPermission,
    getCommitteeMemberPermission,
};
