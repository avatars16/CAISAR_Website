const express = require("express");
const router = express.Router();
const {
    authUser,
    notAuthUser,
    authRole,
    hasPermission,
} = require("../permissions/basicAuth");
const { ROLE } = require("../controllers/data");
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
            if (
                req.user.userSlug == req.params.userSlug ||
                hasPermission(req.user.websiteRole, ROLE.BOARD)
            ) {
                let reqUser = await getUserBySlug(req.params.userSlug);
                res.render("users/userEdit", {
                    user: reqUser,
                    canDelete: hasPermission(req.user.websiteRole, ROLE.ADMIN),
                    changeWebsiteRole: true,
                    /*TODO: change back to this: hasPermission(req.user.websiteRole,ROLE.BOARD),*/
                });
                return;
            }
            next(ApiError.forbidden("You don't have acces to this page"));
        })
        .put(authUser, async (req, res, next) => {
            if (
                req.user.userSlug == req.params.userSlug ||
                hasPermission(req.user.websiteRole, ROLE.BOARD)
            ) {
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
        .delete(authUser, authRole(ROLE.ADMIN), async (req, res, next) => {
            let deleteThisUser = await getUserBySlug(req.params.userSlug);
            if (deleteThisUser.userId == req.user.userId)
                return next(
                    ApiError.badRequest(
                        "It is not possible to delete your own account"
                    )
                );
            if (hasPermission(deleteThisUser.websiteRole, ROLE.BOARD))
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
                list.push(await getCommitteeByName(committee.committeeName));
            }
            res.render("users/userProfile", {
                user: requestedUser,
                committees: list,
                editPermission:
                    req.user.userSlug == req.params.userSlug ||
                    hasPermission(req.user.websiteRole, ROLE.BOARD),
            });
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
