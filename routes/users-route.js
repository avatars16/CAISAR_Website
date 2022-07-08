const express = require("express");
const router = express.Router();
const {
    authUser,
    notAuthUser,
    authRole,
    hasPermission,
} = require("../permissions/basicAuth");
const { ROLE, COMMITTEETYPE } = require("../controllers/data");
const ApiError = require("../error/data-errors");
const {
    getUserBySlug,
    updateUser,
    deleteUser,
    getAllUsers,
    searchUserByName,
} = require("../controllers/users-api");
const { getDataFromMultipleTables } = require("../database/db_interaction");
const { getCommitteeByName } = require("../controllers/committees-api");

module.exports = function (passport) {
    router.route("/").get(authUser, async (req, res) => {
        let allUsers = await getAllUsers();
        res.render("users/all-users", { users: allUsers });
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
        .get(authUser, checkIfUserPageExists, async (req, res, next) => {
            if (
                req.user.userSlug == req.params.userSlug ||
                hasPermission(req.user.websiteRole, ROLE.BOARD)
            ) {
                res.render("users/edit-user", {
                    user: req.requestedUser,
                    canDelete: hasPermission(req.user.websiteRole, ROLE.ADMIN),
                    changeWebsiteRole: true,
                    /*TODO: change back to this: hasPermission(req.user.websiteRole,ROLE.BOARD),*/
                });
                return;
            }
            next(ApiError.forbidden("You don't have acces to this page"));
        })
        .put(authUser, checkIfUserPageExists, async (req, res, next) => {
            if (
                req.user.userSlug == req.params.userSlug ||
                hasPermission(req.user.websiteRole, ROLE.BOARD)
            ) {
                updateUser(
                    req.body,
                    req.requestedUser.userId,
                    req.requestedUser.email
                )
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
            console.info(committees);
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

    return router;
};
