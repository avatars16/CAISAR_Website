const express = require("express");
const router = express.Router();
const {
    authUser,
    notAuthUser,
    authRole,
    hasPermission,
} = require("../permissions/basicAuth");
const { ROLE, COMMITTEEROLE } = require("../models/data");
const ApiError = require("../error/data-errors");
const {
    canViewSpecificUser,
    hasRole,
} = require("../permissions/users-permissions");
const { getUserBySlug } = require("../models/users-api");
const {
    getAllCommittees,
    getCommitteeBySlug,
    getMemberRoleInCommittee,
    newCommittee,
    updateCommittee,
    deleteCommittee,
    addMemberToCommittee,
    updateMemberInCommittee,
    deleteMemberInCommittee,
} = require("../models/committees-api");
const { getDataFromMultipleTables } = require("../database/db_interaction");

module.exports = function (passport) {
    router.route("/").get(async (req, res) => {
        let committees = await getAllCommittees();
        res.render("committees/allCommittees", {
            committees,
            signedInUser: req.isAuthenticated(),
        });
    });

    //TODO: Change view so that sub committees are shown under their parent
    router
        .route("/new")
        .get(authUser, authRole(ROLE.BOARD), async (req, res, next) => {
            res.render("committees/newCommittee");
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
        try {
            let committee = await getCommitteeBySlug(req.params.committeeSlug);
            let committeeMembers = await getDataFromMultipleTables(
                "users",
                "committees",
                "userId",
                "userId",
                { committeeName: committee.committeeName }
            );
            memberRole = COMMITTEEROLE.MEMBER;
            if (req.user) {
                possibleMemberRole = await getMemberRoleInCommittee(
                    committee.committeeName,
                    req.user.userId
                );
                if (possibleMemberRole) memberRole = possibleMemberRole;
            }

            res.render("committees/committeeOverview", {
                committee: committee,
                committeeMembers: committeeMembers,
                user: req.user,
                role: ROLE,
                hasPermission: hasPermission,
                memberRole: memberRole.memberRole,
                role: COMMITTEEROLE,
                signedInUser: req.isAuthenticated(),
            });
        } catch (error) {
            next(
                ApiError.badRequest(
                    `The committee ${req.params.committeeSlug} does not exist`,
                    error
                )
            );
        }
    });

    router
        .route("/:committeeSlug/edit")
        .get(authUser, authRole(ROLE.BOARD), async (req, res) => {
            let committee = await getCommitteeBySlug(req.params.committeeSlug);
            let currentUser = await req.user;
            res.render("committees/committeeEdit", {
                committee: committee,
                checkAuth: hasRole,
                role: ROLE,
                user: currentUser,
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
                    res.redirect(`/committees`);
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
            let member = await getMemberRoleInCommittee(
                committee.committeeName,
                req.user.userId
            );
            if (member)
                if (
                    !(
                        hasPermission(member.memberRole, COMMITTEEROLE.CHAIR) ||
                        hasPermission(req.user.websiteRole, COMMITTEEROLE.CHAIR)
                    )
                )
                    return next(
                        ApiError.forbidden("You do not have acces to this page")
                    );
            res.render("committees/committeeMembersEdit", {
                committee: committee,
                committeeMembers: committeeMembers,
                checkAuth: hasPermission,
                user: req.user,
                role: ROLE,
            });
        })
        .post(authUser, authRole(ROLE.BOARD), async (req, res, next) => {
            let user = await getUserBySlug(req.body.userSlug);
            if (!user)
                next(
                    ApiError.badRequest(
                        `User with url: ${req.body.userId} does not exists`,
                        ""
                    )
                );
            let committee = await getCommitteeBySlug(req.params.committeeSlug);
            await addMemberToCommittee(committee.committeeSlug, user)
                .then((msg) => {
                    res.redirect(`/committees`);
                })
                .catch((err) => {
                    next(err);
                });
        })
        .put(authUser, async (req, res, next) => {
            let committee = await req.body;
            let memberRole = await getMemberRoleInCommittee(
                committee.committeeName,
                req.user.userId
            );
            if (
                !(
                    hasPermission(memberRole, COMMITTEEROLE.CHAIR) ||
                    hasPermission(req.user.websiteRole, COMMITTEEROLE.CHAIR)
                )
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
            console.log(req.query, req.query.user);
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
