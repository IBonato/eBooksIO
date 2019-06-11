// Check if user is authenticaded
module.exports = {
    loggedin: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        req.session.returnTo = req.originalUrl
        req.flash("error_msg", "Você precisa estar logado para acessar essa página!")
        res.redirect("/")
    }
}