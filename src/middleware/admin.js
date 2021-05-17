// should follow the auth middleware

module.exports = function (req, res, next) {
    if (!req.user.roles.admin) return res.status(403).send('Access denied!')
    next();
}
