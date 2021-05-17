const jwt = require('jsonwebtoken'),
      { User } = require('../models/user.js');

module.exports = async function (req, res, next) {

    const token = req.header('X-Auth-Token');
    if(!token) return res.status(401).send('Access denied. No token provided.');

    try {
        const decoded = jwt.verify(token, process.env.JWT_LOGIN_SECRET);
        const user = await User.findOne({_id: decoded._id, deleted: false, tokens: { $elemMatch: { token: token} }});
        if(!user) return res.status(401).send('Access denied.');

        req.user = user;
        next();

    } catch(e) {
        res.status(400).send('Bad token');
    }

};
