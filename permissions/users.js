const { ROLE } = require("../models/data");

function canViewSpecificUser(currentUser, requestedUserSlug) {
    console.log(currentUser.websiteRole);
    console.log(requestedUserSlug);

    return (
        currentUser.websiteRole == ROLE.ADMIN ||
        currentUser.slugURL === requestedUserSlug
    );
}

module.exports = canViewSpecificUser;
