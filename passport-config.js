const LocalStrategy = require("passport-local").Strategy;
const userApi = require("./controllers/users-api");
const bcrypt = require("bcrypt");
const { deleteEmptyFields } = require("./controllers/helper-functions");
const logger = require("./utils/logger");
const ApiError = require("./utils/error/data-errors");

function initiliaze(passport) {
    const loginUser = async (userEmail, password, done) => {
        if (!(await userApi.checkIfUserExists(userEmail))) {
            return done(null, false, { message: "No user with that email" });
        }
        const user = await userApi.getUser({ email: userEmail });
        try {
            if (await bcrypt.compare(password, user.password)) {
                result = await userApi.userLoginStatisticsUpdate(
                    user.numberOfLogins,
                    user.userId
                );
                if (result === true) return done(null, user);
                return done(null, false, {
                    message: "could not update inlog count",
                });
            } else {
                return done(null, false, { message: "Password incorrect" });
            }
        } catch (e) {
            return done(e);
        }
    };

    const registerUser = async (req, userEmail, password, done) => {
        if (
            req.body.firstName == null &&
            req.body.lastName == null &&
            req.body.postalcode == null &&
            req.body.adress == null &&
            req.body.houseNumber == null &&
            req.body.phone == null &&
            req.body.email == null &&
            password == null
        )
            return done(null, false, { message: "Fill in required fields" });
        let newUser = await userApi.createUser(req.body);
        if (await userApi.checkIfUserExists(newUser.email)) {
            return done(null, false, { message: "user already exists" });
        }
        if (await userApi.saveUser(newUser)) {
            var data = await userApi.getUserByMail(userEmail);
            if (data instanceof ApiError) {
                return done(null, false, {
                    message: "user could not be added to the database",
                });
            }
            return done(null, data);
        }
        return done(null, false, {
            message: "user could not be added to database",
        });
    };

    passport.use(
        "login",
        new LocalStrategy({ usernameField: "email" }, loginUser)
    );
    passport.use(
        "signup",
        new LocalStrategy(
            { passReqToCallback: true, usernameField: "email" },
            registerUser
        )
    );
    passport.serializeUser((user, done) => done(null, user.userId));
    passport.deserializeUser(async (userId, done) => {
        var userById = await userApi.getUser({ userId: userId });
        return done(null, userById);
    });
}

module.exports = initiliaze;
