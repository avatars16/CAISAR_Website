const express = require("express");
const router = express.Router();
const {
    authUser,
    authRole,
    hasPermission,
    getCommitteeMemberPermission,
} = require("../permissions/basicAuth");
const { ROLE, COMMITTEEROLE, COMMITTEETYPE } = require("../controllers/data");
const ApiError = require("../error/data-errors");
const { getUserBySlug } = require("../controllers/users-api");
const {
    getAllCommittees,
    getCommitteeBySlug,
    newCommittee,
    updateCommittee,
    deleteCommittee,
    addMemberToCommittee,
    updateMemberInCommittee,
    deleteMemberInCommittee,
    emptyCommittee,
    getAllCommitteesOfType,
} = require("../controllers/committees-api");
const { getDataFromMultipleTables } = require("../database/db_interaction");

module.exports = function (passport) {
    router.route("/").get(async (req, res) => {
        let committees = await getAllCommitteesOfType(COMMITTEETYPE.COMMITTEE);
        let batches = await getAllCommitteesOfType(COMMITTEETYPE.BATCH);
        res.render("committees/all-committees", {
            committees,
            batches,
            signedInUser: req.isAuthenticated(),
        });
    });

    //TODO: Change view so that sub committees are shown under their parent
    router
        .route("/new")
        .get(authUser, authRole(ROLE.BOARD), async (req, res, next) => {
            res.render("committees/new-committee", {
                committee: emptyCommittee(),
            });
            return;
        })
        .post(authUser, authRole(ROLE.BOARD), async (req, res, next) => {
            let committee = await req.body;
            await newCommittee(committee.committeeName, committee)
                .then((msg) => {
                    res.redirect(`/committees`);
                    return;
                })
                .catch((err) => {
                    next(err);
                });
        });

    router.route("/:committeeSlug/").get(async (req, res, next) => {
        let committee = await getCommitteeBySlug(req.params.committeeSlug);
        if (committee == [])
            return next(
                ApiError.badRequest(
                    `The committee ${req.params.committeeSlug} does not exist`,
                    error
                )
            );
        let committeeMembers = await getDataFromMultipleTables(
            "users",
            "committees",
            "userId",
            "userId",
            { committeeName: committee.committeeName }
        );
        res.render("committees/view-committee", {
            committee: committee,
            committeeMembers: committeeMembers,
            user: req.user,
            hasEditPermission: getCommitteeMemberPermission(
                committee.committeeName,
                req.user
            ),
        });
    });

    router
        .route("/:committeeSlug/edit")
        .get(authUser, authRole(ROLE.BOARD), async (req, res) => {
            let committee = await getCommitteeBySlug(req.params.committeeSlug);
            res.render("committees/edit-committee", {
                committee: committee,
                deletePermission: hasPermission(
                    req.user.websiteRole,
                    ROLE.ADMIN
                ),
            });
        })
        .put(authUser, authRole(ROLE.BOARD), async (req, res, next) => {
            let committee = req.body;
            let oldName = await getCommitteeBySlug(req.params.committeeSlug);
            await updateCommittee(
                committee,
                req.params.committeeSlug,
                oldName.committeeName
            )
                .then((msg) => {
                    res.redirect(`/committees/${req.params.committeeSlug}/`);
                })
                .catch((err) => {
                    next(err);
                });
        })
        .delete(authUser, authRole(ROLE.ADMIN), async (req, res, next) => {
            let committee = await getCommitteeBySlug(req.params.committeeSlug);
            await deleteCommittee(committee.committeeName)
                .then((msg) => {
                    res.redirect(`/committees`);
                })
                .catch((err) => {
                    next(err);
                });
        });

    router
        .route("/:committeeSlug/members/edit")
        .get(authUser, async (req, res, next) => {
            let committee = await getCommitteeBySlug(req.params.committeeSlug);
            let committeeMembers = await getDataFromMultipleTables(
                "users",
                "committees",
                "userId",
                "userId",
                { committeeName: committee.committeeName }
            );
            if (
                !getCommitteeMemberPermission(committee.committeeName, req.user)
            )
                return next(
                    ApiError.forbidden("You do not have acces to this page")
                );
            res.render("committees/edit-committee-members", {
                committee: committee,
                committeeMembers: committeeMembers,
                deletePermission: hasPermission(
                    req.user.websiteRole,
                    ROLE.ADMIN
                ),
            });
        })
        .post(authUser, authRole(ROLE.BOARD), async (req, res, next) => {
            let user = await getUserBySlug(req.body.userSlug);
            if (user == [])
                next(
                    ApiError.badRequest(
                        `User with url: ${req.body.userId} does not exists`,
                        ""
                    )
                );
            let committee = await getCommitteeBySlug(req.params.committeeSlug);
            await addMemberToCommittee(committee, user)
                .then((msg) => {
                    res.redirect(`/committees/${req.params.committeeSlug}/`);
                })
                .catch((err) => {
                    next(err);
                });
        })
        .put(authUser, async (req, res, next) => {
            let committee = await req.body;
            if (
                !getCommitteeMemberPermission(committee.committeeName, req.user)
            )
                next(ApiError.forbidden("You do not have acces to this page"));
            await updateMemberInCommittee(committee, req.user.userId)
                .then((msg) => {
                    res.redirect(`/committees`);
                })
                .catch((err) => {
                    next(err);
                });
        })
        .delete(authUser, authRole(ROLE.ADMIN), async (req, res, next) => {
            let committee = await getCommitteeBySlug(req.params.committeeSlug);
            await deleteMemberInCommittee(
                committee.committeeName,
                req.query.user
            )
                .then((msg) => {
                    res.redirect(`/committees`);
                })
                .catch((err) => {
                    next(err);
                });
        });
    return router;
};
