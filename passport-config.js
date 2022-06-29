const LocalStrategy = require("passport-local").Strategy;
const userApi = require("./models/users-api");
const bcrypt = require("bcrypt");

function initiliaze(passport) {
    const loginUser = async (userEmail, password, done) => {
        if (!(await userApi.checkIfUserExists(userEmail))) {
            // return done(err, user, {message: "No user with that email"})
            return done(null, false, { message: "No user with that email" });
        }
        const user = await userApi.getUser({ email: userEmail });
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
        let newUser = await userApi.createUser(req.body);
        if (await userApi.checkIfUserExists(newUser.email)) {
            return done(null, false, { message: "user already exists" });
        }
        if (await userApi.saveUser(newUser)) {
            var reqNewUser = await userApi.getUserByMail(userEmail);
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
    passport.serializeUser((user, done) => done(null, user.userId));
    passport.deserializeUser(async (userId, done) => {
        var userById = await userApi.getUser({ userId: userId });
        return done(null, userById);
    });
}

module.exports = initiliaze;
