const express = require("express");
const router = express.Router();
const { authUser, notAuthUser, authRole } = require("../permissions/basicAuth");
const { ROLE } = require("../models/data");
const canViewSpecificUser = require("../permissions/users");
const ApiError = require("../error/data-errors");

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
                successRedirect: "/ls/",
                failureRedirect: "/ls/register",
                failureFlash: true,
            })
        );

    router.delete("/logout", authUser, (req, res) => {
        req.logout(function (err) {
            if (err) {
                return next(ApiError.internal("User could not be logged out"));
            }
            res.redirect("/");
        });
    });

    return router;
};
