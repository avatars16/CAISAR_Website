const express = require("express");
const router = express.Router();
const {
    authUser,
    notAuthUser,
    authRole,
    hasPermission,
} = require("../permissions/basicAuth");
const { ROLE, COMMITTEETYPE } = require("../permissions/data");
const ApiError = require("../utils/error/data-errors");
const {
    getUserBySlug,
    updateUser,
    deleteUser,
    getAllUsers,
    updateProfileViews,
} = require("../controllers/users-api");
const { getDataFromMultipleTables } = require("../database/db_interaction");
const { getCommitteeByName } = require("../controllers/committees-api");
const { searchUserByName } = require("../controllers/search-api");

router.route("/").get(authUser, async (req, res) => {
    let allUsers = await getAllUsers();
    res.render("users/all-users", { users: allUsers });
});

router.post("/search", authUser, searchUserByName);

router
    .route("/:userSlug/edit")
    .get(authUser, checkIfUserPageExists, async (req, res, next) => {
        if (
            !(
                req.user.userSlug == req.params.userSlug ||
                hasPermission(req.user.websiteRole, ROLE.BOARD)
            )
        )
            return next(
                ApiError.forbidden("You don't have acces to this page")
            );
        res.render("users/edit-user", {
            user: req.requestedUser,
            canDelete: hasPermission(req.user.websiteRole, ROLE.BOARD),
            changeWebsiteRole: true,
        });
    })
    .put(authUser, checkIfUserPageExists, async (req, res, next) => {
        if (
            !(
                req.user.userSlug == req.params.userSlug ||
                hasPermission(req.user.websiteRole, ROLE.BOARD)
            )
        )
            return next(
                ApiError.forbidden("You don't have acces to this page")
            );
        updateUser(req.body, req.requestedUser.userId, req.requestedUser.email)
            .then((msg) => {
                res.redirect(`/users/${req.params.userSlug}/`);
            })
            .catch((err) => {
                next(err);
            });
    })
    .delete(
        authUser,
        authRole(ROLE.ADMIN),
        checkIfUserPageExists,
        async (req, res, next) => {
            if (req.requestedUser.userId == req.user.userId)
                return next(
                    ApiError.badRequest(
                        "It is not possible to delete your own account"
                    )
                );
            if (hasPermission(req.requestedUser.websiteRole, ROLE.BOARD))
                return next(
                    ApiError.badRequest(
                        `It is not possible to delete a ${req.requestedUser.websiteRole} account`
                    )
                );
            deleteUser(req.requestedUser)
                .then((msg) => {
                    res.redirect(`/users/`);
                })
                .catch((err) => next(err));
        }
    );

router
    .route("/:userSlug/")
    .get(authUser, checkIfUserPageExists, async (req, res, next) => {
        let committees = await getDataFromMultipleTables(
            "users",
            "committees",
            "userId",
            "userId",
            {
                "users.userId": req.requestedUser.userId,
                committeeType: COMMITTEETYPE.COMMITTEE,
            }
        );
        let userBatch = await getDataFromMultipleTables(
            "users",
            "committees",
            "userId",
            "userId",
            { committeeType: COMMITTEETYPE.BATCH }
        );
        let list = [];
        for (let committee of committees) {
            list.push(await getCommitteeByName(committee.committeeName));
        }
        updateProfileViews(
            req.requestedUser.profileViews,
            req.requestedUser.userId
        );
        res.render("users/view-user", {
            user: req.requestedUser,
            committees: list,
            batch: userBatch,
            private: req.user.private,
            hasEditPermission:
                req.user.userSlug == req.params.userSlug ||
                hasPermission(req.user.websiteRole, ROLE.BOARD),
        });
    });

async function checkIfUserPageExists(req, res, next) {
    req.requestedUser = await getUserBySlug(req.params.userSlug);
    if (req.requestedUser == null)
        return next(
            ApiError.internal(
                `User with url: ${req.params.userSlug} does not exist`
            )
        );
    return next();
}

module.exports = router;
