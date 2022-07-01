const { ROLE } = require("../models/data");

function canViewSpecificUser(currentUser, requestedUserSlug) {
    return (
        currentUser.websiteRole == ROLE.ADMIN ||
        currentUser.websiteRole == ROLE.BOARD ||
        currentUser.slugURL == requestedUserSlug
    );
}

function canDeleteUser(currentUser, requestedUserSlug) {
    return (
        currentUser.websiteRole == ROLE.ADMIN ||
        currentUser.websiteRole == ROLE.BOARD ||
        currentUser.slugURL != requestedUserSlug
    );
}

function hasRole(role, wantedRole) {
    if (wantedRole !== role) {
        return false;
    }
    return true;
}

module.exports = { canViewSpecificUser, hasRole, canDeleteUser };
