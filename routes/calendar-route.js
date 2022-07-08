const express = require("express");
const router = express.Router();
const {
    authUser,
    notAuthUser,
    authRole,
    hasPermission,
} = require("../permissions/basicAuth");
const { ROLE, COMMITTEEROLE } = require("../controllers/data");
const ApiError = require("../error/data-errors");
const { getUserBySlug } = require("../controllers/users-api");
const {
    newCalendarItem,
    getCalendarItemBySlug,
    getAllCalendarItems,
    updateCalendarItem,
    emptyCalendarItem,
} = require("../controllers/calendar-api");

module.exports = function (passport) {
    router.route("/").get(async (req, res) => {
        let calendarItems = await getAllCalendarItems();
        res.render("calendar/allCalendarItems", {
            calendarItems: calendarItems,
            signedInUser: req.isAuthenticated(),
        });
    });

    //TODO: add authentication check
    router
        .route("/new")
        .get(authUser, async (req, res, next) => {
            res.render("calendar/newCalendarItem", {
                calendarItem: emptyCalendarItem(),
            });
            return;
        })
        .post(authUser, async (req, res, next) => {
            let calendarItem = await req.body;
            await newCalendarItem(calendarItem, req.user)
                .then((msg) => {
                    res.redirect(`/calendar`);
                    return;
                })
                .catch((err) => {
                    next(err);
                });
        });

    router.route("/:calendarItemSlug/").get(async (req, res, next) => {
        try {
            let calendarItem = await getCalendarItemBySlug(
                req.params.calendarItemSlug
            );
            res.render("calendar/calendarItemOverview", {
                calendarItem: calendarItem,
                user: req.user,
                role: ROLE,
                hasPermission: hasPermission,
                signedInUser: req.isAuthenticated(),
            });
        } catch (error) {
            next(
                ApiError.badRequest(
                    `The calender item ${req.params.committeeSlug} does not exist`,
                    error
                )
            );
        }
    });

    router
        .route("/:calendarItemSlug/edit")
        .get(async (req, res) => {
            let calendarItem = await getCalendarItemBySlug(
                req.params.calendarItemSlug
            );
            res.render("calendar/editCalendarItem", {
                calendarItem: calendarItem,
                deletePermission: true,
            });
        })
        .put(async (req, res, next) => {
            await updateCalendarItem(req.body, req.params.calendarItemSlug)
                .then((msg) => {
                    res.redirect(`/calendar/${req.params.calendarItemSlug}`);
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

    return router;
};
