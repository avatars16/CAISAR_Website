if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");

const passport = require("passport");
const apiErrorHandler = require("./error/error-handler");

const initiliazePassport = require("./passport-config");
initiliazePassport(passport);

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
//app.use(express.json());
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());

const lsRouter = require("./routes/ls")(passport);
const userRouter = require("./routes/users-route")(passport);
const committeesRouter = require("./routes/committees-route")(passport);
const databaseRouter = require("./routes/database");
const indexRouter = require("./routes/index");

app.use("/db", databaseRouter);
app.use("/ls", lsRouter);
app.use("/users", userRouter);
app.use("/committees", committeesRouter);
app.use("/", indexRouter);

app.use(apiErrorHandler);
app.use((req, res, next) => {
    res.status(404);
    res.render("errors/basic-error-page", {
        errorMsg: `The page ${req.originalUrl} does not exists`,
        url: req.header("Referer"),
        path: req.header("Referer"),
    });
});

app.listen(3000);
