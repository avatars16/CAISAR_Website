const express = require("express");
const router = express.Router();
const {
    authUser,
    notAuthUser,
    authRole,
    hasPermission,
} = require("../permissions/basicAuth");
const { ROLE } = require("../models/data");
const ApiError = require("../error/data-errors");
const {
    getUserByMail,
    getUserBySlug,
    updateUser,
    deleteUser,
    getAllUsers,
    searchUser,
    searchUserByName,
} = require("../models/users-api");
const {
    canViewSpecificUser,
    hasRole,
    canDeleteUser,
} = require("../permissions/users-permissions");
const { getDataFromMultipleTables } = require("../database/db_interaction");
const { getCommitteeByName } = require("../models/committees-api");

module.exports = function (passport) {
    router.route("/").get(authUser, async (req, res) => {
        let allUsers = await getAllUsers();
        res.render("users/allUsers", { users: allUsers });
    });

    router.post("/search", authUser, async (req, res, next) => {
        let payload = req.body.payload;
        console.log(payload);
        await searchUserByName(payload)
            .then((result) => {
                if (result instanceof ApiError) return next(result);
                res.send({ payload: result });
            })
            .catch((err) => {
                next(err);
            });
    });

    router
        .route("/:userSlug/edit")
        .get(authUser, async (req, res, next) => {
            if (canViewSpecificUser(req.user, req.params.userSlug)) {
                let reqUser = await getUserBySlug(req.params.userSlug);
                res.render("users/userEdit", {
                    reqUser: reqUser,
                    currentUser: req.user,
                    hasPermission: hasPermission,
                    role: ROLE,
                });
                return;
            }
            next(ApiError.forbidden("You don't have acces to this page"));
        })
        .put(authUser, async (req, res, next) => {
            if (canViewSpecificUser(req.user, req.params.userSlug)) {
                updateUser(req.body, req.user.userId, req.user.email)
                    .then((msg) => {
                        res.redirect(`/users/${req.params.userSlug}/`);
                    })
                    .catch((err) => {
                        next(err);
                    });
                return;
            }
            next(ApiError.forbidden("You don't have acces to this page"));
        })
        .delete(authUser, authRole(ROLE.BOARD), async (req, res, next) => {
            let deleteThisUser = await getUserBySlug(req.params.userSlug);
            if (deleteThisUser.userId == req.user.userId)
                return next(
                    ApiError.badRequest(
                        "It is not possible to delete your own account"
                    )
                );
            if (
                deleteThisUser.websiteRole == ROLE.BOARD ||
                deleteThisUser.websiteRole == ROLE.ADMIN
            )
                return next(
                    ApiError.badRequest(
                        `It is not possible to delete a ${deleteThisUser.websiteRole} account`
                    )
                );
            deleteUser(deleteThisUser)
                .then((msg) => {
                    res.redirect(`/users/`);
                })
                .catch((err) => next(err));
        });

    router.route("/:userSlug/").get(authUser, async (req, res, next) => {
        try {
            if (canViewSpecificUser(req.user, req.params.userSlug)) {
                requestedUser = await getUserBySlug(req.params.userSlug);
                let committees = await getDataFromMultipleTables(
                    "users",
                    "committees",
                    "userId",
                    "userId",
                    { "users.userId": requestedUser.userId }
                );
                let list = [];
                for (let committee of committees) {
                    list.push(
                        await getCommitteeByName(committee.committeeName)
                    );
                }
                res.render("users/userProfile", {
                    reqUser: requestedUser,
                    currentUser: req.user,
                    committees: list,
                    checkAuth: canViewSpecificUser,
                    role: ROLE,
                });
                return;
            }
            next(ApiError.forbidden("You do not have acces to this page"));
        } catch (error) {
            next(
                ApiError.internal(
                    `User with url: ${req.params.userSlug} does not exist`
                )
            );
        }
    });

    return router;
};
