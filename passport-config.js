const LocalStrategy = require("passport-local").Strategy;
const userMiddleware = require("./models/users");
const bcrypt = require("bcrypt");
const { insertNewRow } = require("./database/db_interaction");

function initiliaze(passport) {
    const loginUser = async (userEmail, password, done) => {
        if (!(await userMiddleware.checkIfUserExists(userEmail))) {
            // return done(err, user, {message: "No user with that email"})
            return done(null, false, { message: "No user with that email" });
        }
        const user = await userMiddleware.getUser({ email: userEmail });
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: "Password incorrect" });
            }
        } catch (e) {
            return done(e);
        }
    };

    const registerUser = async (req, userEmail, password, done) => {
        let newUser = await userMiddleware.createUser(req.body);
        if (await userMiddleware.checkIfUserExists(newUser.email)) {
            console.log("user already exists");
            return done(null, false, { message: "user already exists" });
        }
        if (await insertNewRow("users", newUser)) {
            var reqNewUser = await userMiddleware.getUser({ email: userEmail });
            return done(null, reqNewUser);
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
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (userId, done) => {
        var userById = await userMiddleware.getUser({ id: userId });
        return done(null, userById);
    });
}

module.exports = initiliaze;
