const express = require('express'),
      router = express.Router(),
      { User, validateLoginInfo, generateAuthToken } = require('../models/user.js'),
      mongoose = require('mongoose'),
      bcrypt = require('bcrypt'),
      auth = require('../middleware/auth.js');


// login
router.post('/login', async (req, res) => {
    // validate input
    const { error } = validateLoginInfo(req.body.loginInfo);
    if (error) {
        console.log('JOI: ', error);
        return res.status(400).send(error);
    }
    const foundUser = await User.findOne({username: req.body.loginInfo.username, deleted: false });
        console.log(foundUser);
    if (!foundUser) return res.status(400).send('Invalid username or password')


    // compare password
    let validPassword = await bcrypt.compare(req.body.loginInfo.password, foundUser.password)
    console.log(validPassword);
    if (!validPassword) return res.status(400).send('Invalid username or password')

    const token = await foundUser.generateAuthToken();
    //res.status(200).header('X-Auth-Token', token).send(foundUser);
    res.status(200).send({user: foundUser, token: token});

});


// logout
router.post('/logout', auth, async (req, res) => {
    const logoutAll = req.body.logoutAll;

    if(req.body.logoutAll) {
        await User.findByIdAndUpdate(req.user._id, {$set: {tokens: []}});
        res.status(200).send('User was logged out from all devices');

    } else {
        const token = req.header('X-Auth-Token');
        await User.findByIdAndUpdate(req.user._id, {$pull: {tokens: {token}}});
        res.status(200).send('User was logged out from this device');
    }
});


module.exports = router;
