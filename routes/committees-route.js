const express = require("express");
const router = express.Router();
const {
    authUser,
    authRole,
    hasPermission,
    getCommitteeMemberPermission,
} = require("../permissions/basicAuth");
const { ROLE, COMMITTEEROLE, COMMITTEETYPE } = require("../permissions/data");
const ApiError = require("../utils/error/data-errors");
const { getUserBySlug, getUserByURL } = require("../controllers/users-api");
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

router.route("/").get(async (req, res) => {
    let committees = await getAllCommitteesOfType(COMMITTEETYPE.COMMITTEE);
    let batches = await getAllCommitteesOfType(COMMITTEETYPE.BATCH);
    let role;
    if (req.isAuthenticated()) role = req.user.websiteRole;
    res.render("committees/all-committees", {
        committees,
        batches,
        signedInUser: req.isAuthenticated(),
        hasEditPermission: hasPermission(role, ROLE.BOARD),
    });
});

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

router
    .route("/:committeeURL/")
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
            hasEditPermission: await getCommitteeMemberPermission(
                req.committee.committeeName,
                req.user
            ),
        });
    });

router
    .route("/:committeeURL/edit")
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
            await updateCommittee(committee, req.params.committeeURL, oldName)
                .then((msg) => {
                    res.redirect(`/committees/${req.params.committeeURL}/`);
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
    .route("/:committeeURL/members/edit")
    .get(authUser, checkIfCommitteePageExists, async (req, res, next) => {
        let committeeMembers = await getDataFromMultipleTables(
            "users",
            "committees",
            "userId",
            "userId",
            { committeeName: req.committee.committeeName }
        );
        if (
            !(await getCommitteeMemberPermission(
                req.committee.committeeName,
                req.user
            ))
        )
            return next(
                ApiError.forbidden("You do not have acces to this page")
            );
        res.render("committees/edit-committee-members", {
            committee: req.committee,
            committeeMembers: committeeMembers,
            deletePermission: hasPermission(req.user.websiteRole, ROLE.ADMIN),
        });
    })
    .post(
        authUser,
        authRole(ROLE.BOARD),
        checkIfCommitteePageExists,
        async (req, res, next) => {
            let user = await getUserByURL(req.body.userURL);
            if (user == [])
                return next(
                    ApiError.badRequest(
                        `User with url: ${req.body.userId} does not exists`
                    )
                );
            await addMemberToCommittee(req.committee, user)
                .then((msg) => {
                    res.redirect(`/committees/${req.params.committeeURL}/`);
                })
                .catch((err) => {
                    next(err);
                });
        }
    )
    .put(authUser, checkIfCommitteePageExists, async (req, res, next) => {
        let committee = await req.body;
        if (
            !(await getCommitteeMemberPermission(
                committee.committeeName,
                req.user
            ))
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
                !(await getCommitteeMemberPermission(
                    req.committee.committeeName,
                    req.user
                ))
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
    req.committee = await getCommitteeBySlug(req.params.committeeURL);
    if (req.committee == null)
        return next(
            ApiError.badRequest(
                `The committee ${req.params.committeeURL} does not exist`
            )
        );
    return next();
}

module.exports = router;
