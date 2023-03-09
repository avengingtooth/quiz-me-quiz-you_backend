module.exports = (req, res, next) => {
    if (req.session.currentUser) {
        res.locals.currentUser = req.session.currentUser;
        res.locals.isLoggedIn = true;
    }
    next();
}
