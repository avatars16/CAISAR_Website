const express = require("express");
const router = express.Router();
const {
    authUser,
    notAuthUser,
    authRole,
    hasPermission,
} = require("../permissions/basicAuth");
const { ROLE, COMMITTEEROLE } = require("../permissions/data");
const ApiError = require("../utils/error/data-errors");
const { getUserBySlug } = require("../controllers/users-api");
const {
    newCalendarItem,
    getCalendarItemBySlug,
    getAllCalendarItems,
    updateCalendarItem,
    emptyCalendarItem,
    deleteCalendaritem,
} = require("../controllers/news-api");

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

router
    .route("/:newsItemSlug/")
    .get(checkIfNewspageExists, async (req, res, next) => {
        res.render("news/view-news-item", {
            calendarItem: req.newsItem,
            user: req.user,
            role: ROLE,
            hasPermission: hasPermission,
            signedInUser: req.isAuthenticated(),
        });
    });

router
    .route("/:newsItemSlug/edit")
    .get(checkIfNewspageExists, async (req, res) => {
        res.render("news/edit-news-item", {
            calendarItem: req.newsItem,
            deletePermission: true,
        });
    })
    .put(checkIfNewspageExists, async (req, res, next) => {
        await updateCalendarItem(req.body, req.params.newsItemSlug)
            .then((msg) => {
                res.redirect(`/news/${req.params.newsItemSlug}`);
            })
            .catch((err) => {
                next(err);
            });
    })
    .delete(
        checkIfNewspageExists,
        authUser,
        authRole(ROLE.ADMIN),
        async (req, res, next) => {
            await deleteCalendaritem(req.newsItem)
                .then((msg) => {
                    res.redirect(`/news`);
                })
                .catch((err) => {
                    next(err);
                });
        }
    );

async function checkIfNewspageExists(req, res, next) {
    req.newsItem = await getCalendarItemBySlug(req.params.newsItemSlug);
    if (req.newsItem == null)
        return next(
            ApiError.badRequest(
                `The news item ${req.params.newsItemSlug} does not exist`
            )
        );
    return next();
}

module.exports = router;
