const express = require("express");
const router = express.Router();
const { authUser, notAuthUser, authRole } = require("../permissions/basicAuth");
const { ROLE } = require("../models/data");
const ApiError = require("../error/data-errors");
const {
    getUserByMail,
    getUserBySlug,
    updateUser,
    deleteUser,
    getAllUsers,
    searchUser,
} = require("../models/users-api");
const {
    canViewSpecificUser,
    hasRole,
} = require("../permissions/users-permissions");
const {
    getAllRows,
    getDataFromMultipleTables,
} = require("../database/db_interaction");
const { getCommitteeByName } = require("../models/committees-api");

module.exports = function (passport) {
    router.route("/").get(authUser, async (req, res) => {
        let allUsers = await getAllUsers();
        res.render("users/allUsers", { users: allUsers });
    });

    router.post("/search", async (req, res, next) => {
        let payload = req.body.payload;
        await searchUser(payload)
            .then((result) => {
                console.log(result);
                res.json({ payload: result });
            })
            .catch((err) => {
                next(err);
            });
    });

    router
        .route("/:userSlug/edit")
        .get(authUser, async (req, res, next) => {
            if (canViewSpecificUser(req.user, req.params.userSlug)) {
                let currentUser = await getUserBySlug(req.params.userSlug);
                res.render("users/userEdit", {
                    user: currentUser,
                    checkAuth: hasRole,
                    role: ROLE,
                });
                return;
            }
            next(ApiError.forbidden("You don't have acces to this page"));
        })
        .put(authUser, async (req, res, next) => {
            updateUser(req.body, req.user.userId, req.user.email)
                .then((msg) => {
                    res.redirect(`/users/${req.params.userSlug}`);
                })
                .catch((err) => {
                    next(err);
                });
        })
        .delete(authUser, authRole(ROLE.ADMIN), async (req, res, next) => {
            let deleteThisUser = await getUserBySlug(req.params.userSlug);
            if (deleteThisUser.userId == req.user.userId)
                return next(
                    ApiError.badRequest(
                        "It is not possible to delete your own account"
                    )
                );
            deleteUser(deleteThisUser)
                .then((msg) => {
                    res.redirect(`/users/`);
                })
                .catch((err) => next(err));
        });

    router.route("/:userSlug").get(authUser, async (req, res, next) => {
        if (canViewSpecificUser(req.user, req.params.userSlug)) {
            let committees = await getDataFromMultipleTables(
                "users",
                "committees",
                "userId",
                "userId",
                { "users.userId": req.user.userId }
            );
            let list = [];
            for (let committee of committees) {
                list.push(await getCommitteeByName(committee.committeeName));
            }
            res.render("users/userProfile", {
                user: req.user,
                committees: list,
            });
            return;
        }
        next(ApiError.forbidden("You don't have acces to this page"));
    });

    return router;
};
