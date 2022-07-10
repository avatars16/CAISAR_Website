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
const {
    newPage,
    updatePage,
    deletePage,
    getAllPages,
    emptyPage,
    getPageByURL,
} = require("../controllers/pages-api");

router.route("/").get(async (req, res) => {
    let newsPages = await getAllPages();
    if (newsPages instanceof ApiError) return next(newsPages);
    res.render("news/all-news-items", {
        newsPages: newsPages,
        signedInUser: req.isAuthenticated(),
    });
});

//TODO: add authentication check
router
    .route("/new")
    .get(authUser, async (req, res, next) => {
        res.render("news/new-news-item", {
            newsPage: emptyPage(),
        });
        return;
    })
    .post(authUser, async (req, res, next) => {
        let newsPage = await req.body;
        await newPage(newsPage, req.user)
            .then((msg) => {
                res.redirect(`/news`);
                return;
            })
            .catch((err) => {
                next(err);
            });
    });

router
    .route("/:newsPageURL/")
    .get(checkIfNewspageExists, async (req, res, next) => {
        let role;
        if (req.isAuthenticated()) role = req.user.websiteRole;
        res.render("news/view-news-item", {
            newsPage: req.newsPage,
            user: req.user,
            role: ROLE,
            hasPermission: hasPermission(role, ROLE.BOARD),
        });
    });

router
    .route("/:newsPageURL/edit")
    .get(checkIfNewspageExists, async (req, res) => {
        res.render("news/edit-news-item", {
            newsPage: req.newsPage,
            deletePermission: true,
        });
    })
    .put(checkIfNewspageExists, async (req, res, next) => {
        await updatePage(req.body, req.params.newsPageURL)
            .then((msg) => {
                res.redirect(`/news/${req.params.newsPageURL}`);
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
            await deletePage(req.newsPage)
                .then((msg) => {
                    res.redirect(`/news`);
                })
                .catch((err) => {
                    next(err);
                });
        }
    );

async function checkIfNewspageExists(req, res, next) {
    req.newsPage = await getPageByURL(req.params.newsPageURL);
    if (req.newsPage == null)
        return next(
            ApiError.badRequest(
                `The news item ${req.params.newsPageURL} does not exist`
            )
        );
    return next();
}

module.exports = router;
