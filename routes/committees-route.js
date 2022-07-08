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
            console.info("voor");
            authRole(ROLE.BOARD);
            console.info("na");
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

    router
        .route("/:committeeSlug/")
        .get(checkIfCommitteePageExists, async (req, res, next) => {
            let committeeMembers = await getDataFromMultipleTables(
                "users",
                "committees",
                "userId",
                "userId",
                { committeeName: req.committee.committeeName }
            );
            res.render("committees/view-committee", {
                committee: req.committee,
                committeeMembers: committeeMembers,
                user: req.user,
                hasEditPermission: getCommitteeMemberPermission(
                    req.committee.committeeName,
                    req.user
                ),
            });
        });

    router
        .route("/:committeeSlug/edit")
        .get(
            authUser,
            authRole(ROLE.BOARD),
            checkIfCommitteePageExists,
            async (req, res) => {
                res.render("committees/edit-committee", {
                    committee: req.committee,
                    deletePermission: hasPermission(
                        req.user.websiteRole,
                        ROLE.ADMIN
                    ),
                });
            }
        )
        .put(
            authUser,
            authRole(ROLE.BOARD),
            checkIfCommitteePageExists,
            async (req, res, next) => {
                let committee = req.body;
                let oldName = req.committee.committeeName;
                await updateCommittee(
                    committee,
                    req.params.committeeSlug,
                    oldName
                )
                    .then((msg) => {
                        res.redirect(
                            `/committees/${req.params.committeeSlug}/`
                        );
                    })
                    .catch((err) => {
                        next(err);
                    });
            }
        )
        .delete(
            authUser,
            authRole(ROLE.ADMIN),
            checkIfCommitteePageExists,
            async (req, res, next) => {
                await deleteCommittee(req.committee.committeeName)
                    .then((msg) => {
                        res.redirect(`/committees`);
                    })
                    .catch((err) => {
                        next(err);
                    });
            }
        );

    router
        .route("/:committeeSlug/members/edit")
        .get(authUser, checkIfCommitteePageExists, async (req, res, next) => {
            let committeeMembers = await getDataFromMultipleTables(
                "users",
                "committees",
                "userId",
                "userId",
                { committeeName: req.committee.committeeName }
            );
            if (
                !getCommitteeMemberPermission(committee.committeeName, req.user)
            )
                return next(
                    ApiError.forbidden("You do not have acces to this page")
                );
            res.render("committees/edit-committee-members", {
                committee: req.committee,
                committeeMembers: committeeMembers,
                deletePermission: hasPermission(
                    req.user.websiteRole,
                    ROLE.ADMIN
                ),
            });
        })
        .post(
            authUser,
            authRole(ROLE.BOARD),
            checkIfCommitteePageExists,
            async (req, res, next) => {
                let user = await getUserBySlug(req.body.userSlug);
                if (user == [])
                    return next(
                        ApiError.badRequest(
                            `User with url: ${req.body.userId} does not exists`
                        )
                    );
                await addMemberToCommittee(req.committee, user)
                    .then((msg) => {
                        res.redirect(
                            `/committees/${req.params.committeeSlug}/`
                        );
                    })
                    .catch((err) => {
                        next(err);
                    });
            }
        )
        .put(authUser, checkIfCommitteePageExists, async (req, res, next) => {
            let committee = await req.body;
            if (
                !getCommitteeMemberPermission(committee.committeeName, req.user)
            )
                return next(
                    ApiError.forbidden("You do not have acces to this page")
                );
            await updateMemberInCommittee(committee, req.user.userId)
                .then((msg) => {
                    res.redirect(`/committees`);
                })
                .catch((err) => {
                    next(err);
                });
        })
        .delete(
            authUser,
            authRole(ROLE.ADMIN),
            checkIfCommitteePageExists,
            async (req, res, next) => {
                if (
                    !getCommitteeMemberPermission(
                        committee.committeeName,
                        req.user
                    )
                )
                    return next(
                        ApiError.forbidden("You do not have acces to this page")
                    );
                await deleteMemberInCommittee(
                    req.committee.committeeName,
                    req.query.user
                )
                    .then((msg) => {
                        res.redirect(`/committees`);
                    })
                    .catch((err) => {
                        next(err);
                    });
            }
        );

    async function checkIfCommitteePageExists(req, res, next) {
        req.committee = await getCommitteeBySlug(req.params.committeeSlug);
        if (req.committee == null)
            return next(
                ApiError.badRequest(
                    `The committee ${req.params.committeeSlug} does not exist`
                )
            );
        return next();
    }
    return router;
};
