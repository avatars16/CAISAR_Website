const { ROLE } = require("../models/data");

function canViewSpecificUser(currentUser, requestedUserSlug) {
    return (
        currentUser.websiteRole == ROLE.ADMIN ||
        currentUser.slugURL === requestedUserSlug
    );
}

function hasRole(role, wantedRole) {
    if (wantedRole !== role) {
        return false;
    }
    return true;
}

module.exports = { canViewSpecificUser, hasRole };
