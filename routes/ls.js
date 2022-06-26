const express = require("express");
const router = express.Router();
const { authUser, notAuthUser, authRole } = require("../permissions/basicAuth");
const { ROLE } = require("../models/data");
const canViewSpecificUser = require("../permissions/users");

module.exports = function (passport) {
    router.get("/", authUser, (req, res) => {
        res.render("./loginSystem/home", { user: req.user });
    });

    router
        .route("/login")
        .get(notAuthUser, (req, res) => {
            res.render("loginSystem/login");
        })
        .post(
            passport.authenticate("login", {
                successRedirect: "/ls",
                failureRedirect: "/ls/login",
                failureFlash: true,
            })
        );

    router
        .route("/register")
        .get(notAuthUser, (req, res) => {
            res.render("loginSystem/register");
        })
        .post(
            passport.authenticate("signup", {
                successRedirect: "/ls/login",
                failureRedirect: "/ls/register",
                failureFlash: true,
            })
        );

    router.delete("/logout", authUser, (req, res) => {
        req.logout(function (err) {
            if (err) {
                return next(err);
            }
            res.redirect("/");
        });
    });

    router.get("/users", authUser, authRole(ROLE.ADMIN), (req, res) => {
        res.send("you are an admit yeay");
    });

    router.get("/users/:userSlug", authUser, (req, res) => {
        if (canViewSpecificUser(req.user, req.params.userSlug))
            res.send("you are the correct user");
        res.status(401).send("you dont have the right permissions");
    });

    return router;
};
