const express = require("express");
const router = express.Router();
const { authUser, notAuthUser, authRole } = require("../permissions/basicAuth");
const { ROLE } = require("../models/data");
const ApiError = require("../error/data-errors");
const { getUserByMail, getUserBySlug, updateUser } = require("../models/users");
const canViewSpecificUser = require("../permissions/users");

module.exports = function (passport) {
    router.route("/").get(authUser, authRole(ROLE.ADMIN), (req, res) => {
        res.send("you are an admit yeay");
    });

    router
        .route("/:userSlug")
        .get(authUser, async (req, res, next) => {
            if (canViewSpecificUser(req.user, req.params.userSlug)) {
                let currentUser = await getUserBySlug(req.params.userSlug);
                res.render("users/userOverview", { user: currentUser });
                return;
            }
            next(ApiError.forbidden("You don't have acces to this page"));
        })
        .put(authUser, async (req, res, next) => {
            data = await updateUser(req.body);
            if (data) res.redirect(`/users/${req.params.userSlug}`);
        });

    return router;
};
