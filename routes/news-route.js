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
    deleteCalendaritem,
} = require("../controllers/news-api");

module.exports = function (passport) {
    router.route("/").get(async (req, res) => {
        let newsItems = await getAllCalendarItems();
        res.render("news/all-news-items", {
            calendarItems: newsItems,
            signedInUser: req.isAuthenticated(),
        });
    });

    //TODO: add authentication check
    router
        .route("/new")
        .get(authUser, async (req, res, next) => {
            res.render("news/new-news-item", {
                calendarItem: emptyCalendarItem(),
            });
            return;
        })
        .post(authUser, async (req, res, next) => {
            let newsItem = await req.body;
            await newCalendarItem(newsItem, req.user)
                .then((msg) => {
                    res.redirect(`/news`);
                    return;
                })
                .catch((err) => {
                    next(err);
                });
        });

    router.route("/:newsItemSlug/").get(async (req, res, next) => {
        try {
            let newsItem = await getCalendarItemBySlug(req.params.newsItemSlug);
            res.render("news/view-news-item", {
                calendarItem: newsItem,
                user: req.user,
                role: ROLE,
                hasPermission: hasPermission,
                signedInUser: req.isAuthenticated(),
            });
        } catch (error) {
            next(
                ApiError.badRequest(
                    `The calender item ${req.params.newsItemSlug} does not exist`,
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
            res.render("news/edit-news-item", {
                calendarItem: calendarItem,
                deletePermission: true,
            });
        })
        .put(async (req, res, next) => {
            await updateCalendarItem(req.body, req.params.calendarItemSlug)
                .then((msg) => {
                    res.redirect(`/news/${req.params.calendarItemSlug}`);
                })
                .catch((err) => {
                    next(err);
                });
        })
        .delete(authUser, authRole(ROLE.ADMIN), async (req, res, next) => {
            let calendarItem = await getCalendarItemBySlug(
                req.params.calendarItemSlug
            );
            await deleteCalendaritem(calendarItem)
                .then((msg) => {
                    res.redirect(`/news`);
                })
                .catch((err) => {
                    next(err);
                });
        });

    return router;
};
