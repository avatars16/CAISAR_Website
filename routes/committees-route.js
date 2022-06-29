const express = require("express");
const router = express.Router();
const { authUser, notAuthUser, authRole } = require("../permissions/basicAuth");
const { ROLE } = require("../models/data");
const ApiError = require("../error/data-errors");
const {
    canViewSpecificUser,
    hasRole,
} = require("../permissions/users-permissions");
const { getUserBySlug } = require("../models/users-api");
const {
    getAllCommittees,
    newCommittee,
    getCommitteeBySlug,
    updateCommittee,
    deleteCommittee,
    getCommitteeMembers,
    addMemberToCommittee,
} = require("../models/committees-api");
const { getDataFromMultipleTables } = require("../database/db_interaction");

module.exports = function (passport) {
    router.route("/").get(async (req, res) => {
        let committees = await getAllCommittees();
        res.render("committees/allCommittees", { committees });
    });

    //Add auth check!
    router
        .route("/new")
        .get(async (req, res, next) => {
            let committees = await getAllCommittees();
            res.render("committees/newCommittee");
            next();
        })
        .post(async (req, res, next) => {
            let committee = await req.body;
            await newCommittee(committee.committeeName, committee)
                .then((msg) => {
                    res.redirect(`/committees`);
                    next();
                })
                .catch((err) => {
                    next(err);
                });
        });

    router
        .route("/:committeeSlug/edit")
        .get(authUser, async (req, res) => {
            let committee = await getCommitteeBySlug(req.params.committeeSlug);
            let currentUser = await req.user;
            res.render("committees/committeeEdit", {
                committee: committee,
                checkAuth: hasRole,
                role: ROLE,
                user: currentUser,
            });
        })
        .put(authUser, async (req, res, next) => {
            let committee = req.body;
            await updateCommittee(committee, req.params.committeeSlug)
                .then((msg) => {
                    res.redirect(`/committees`);
                })
                .catch((err) => {
                    next(err);
                });
        })
        .post(authUser, async (req, res, next) => {
            let user = await getUserBySlug(req.body.slugURL);
            let committee = await getCommitteeBySlug(req.params.committeeSlug);
            await addMemberToCommittee(committee.committeeName, user)
                .then((msg) => {
                    res.redirect(`/committees`);
                })
                .catch((err) => {
                    next(err);
                });
        });

    router
        .route("/:committeeSlug/view")
        .get(async (req, res) => {
            let committee = await getCommitteeBySlug(req.params.committeeSlug);
            //Get committee members should also give the columns of users back.
            let committeeMembers = await getDataFromMultipleTables(
                "users",
                "committees",
                "userId",
                "userId",
                { committeeName: committee.committeeName }
            );
            res.render("committees/committeeOverview", {
                committee: committee,
                committeeMembers: committeeMembers,
            });
        })
        .post(async (req, res, next) => {
            let committee = await req.body;
            await newCommittee(committee.committeeName, committee)
                .then((msg) => {
                    res.redirect(`/committees`);
                })
                .catch((err) => {
                    next(err);
                });
        });

    router.route("/:committeeSlug/members").get(async (req, res) => {
        let committee = await getCommitteeBySlug(req.params.committeeSlug);
        //Get committee members should also give the columns of users back.
        let committeeMembers = await getDataFromMultipleTables(
            "users",
            "committees",
            "userId",
            "userId",
            { committeeName: committee.committeeName }
        );
        res.render("committees/committeeOverview", {
            committee: committee,
            committeeMembers: committeeMembers,
        });
    });
    router
        .route("/:committeeSlug/members/edit")
        .get(async (req, res) => {
            let committee = await getCommitteeBySlug(req.params.committeeSlug);
            let committeeMembers = await getDataFromMultipleTables(
                "users",
                "committees",
                "userId",
                "userId",
                { committeeName: committee.committeeName }
            );
            res.render("committees/committeeMembersEdit", {
                committee: committee,
                committeeMembers: committeeMembers,
            });
        })
        .put(async (req, res, next) => {
            let committee = await req.body;
            await newCommittee(committee.committeeName, committee)
                .then((msg) => {
                    res.redirect(`/committees`);
                })
                .catch((err) => {
                    next(err);
                });
        })
        .delete(authUser, async (req, res, next) => {
            let committee = await getCommitteeBySlug(req.params.committeeSlug);
            await deleteCommittee(committee.committeeName)
                .then((msg) => {
                    res.redirect(`/committees`);
                })
                .catch((err) => {
                    next(err);
                });
        });
    return router;
};
