function authUser(req, res, next) {
    if (req.isAuthenticated()) return next();
    return res.status(403).send("You need to sign in");
}

function notAuthUser(req, res, next) {
    if (req.isAuthenticated())
        return res
            .status(403)
            .send("You can not acces this page while signed in");
    return next();
}

function authRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(401).send("Not allowed");
        }
        next();
    };
}

module.exports = { authUser, notAuthUser, authRole };
