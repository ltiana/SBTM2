const bcrypt = require('bcrypt'),
      auth = require('../middleware/auth.js'),
      admin = require('../middleware/admin.js'),
      express = require('express'),
      router = express.Router(),
      { User, validateRegisterInfo, validatePassword, validateUpdateInfo } = require('../models/user.js'),
      mongoose = require('mongoose');

// create
router.post('/', async (req, res) => {
    // validate input
    const { error } = validateRegisterInfo(req.body.user);
    if (error) {
        console.log('JOI: ', error);
        return res.status(400).send(error);
    }

    // check for username existance
    let usernameExists = await User.findOne({username: req.body.user.username });
    if (usernameExists) {
        return res.status(400).send('This username is already taken')
    }

    //check for email existance
    let emailExists = await User.findOne({email: req.body.user.email });
    if (emailExists) {
        return res.status(400).send('This email is already taken')
    }

    // create a new user with a hashed password
    let newUser = req.body.user;
    let salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);

    let createdUser = await User.create(newUser);
    console.log(createdUser);
    // send header with login token and response body the public properties of the user
    res.status(201).send(createdUser);

});


// get current user
router.get('/me', auth, async (req, res) => {

    let foundUser = await User.findOne({_id: req.user._id, deleted: false});
    if(!foundUser) return res.status(404).send('No such user!');
    res.status(200).send(foundUser);
})

// get user by ID
router.get('/:id', [auth, admin], async (req, res) => {

    let foundUser = await User.findOne({_id: req.uparams.id, deleted: false});
    if(!foundUser) return res.status(404).send('No such user!');
    res.status(200).send(foundUser);
})


// read all users (Admin)
// TODO add search
router.get('/', [auth, admin], async (req, res) => {
    let allUsers = await User.find().select('-loginInfo.password');
    if(!allUsers) return res.status(500).send('Could not fetch users');
    res.status(200).send(allUsers);
});

// update the email and / or username of the current user
router.patch('/me', auth, async (req, res) => {

    const { error } = validateUpdateInfo(req.body);
    if (error) {
        console.log('JOI: ', error);
        return res.status(400).send(error);
    }

    let updates = req.body;

    // if the user is trying to change username, check for username existance
    if (req.body.username !== req.user.username ) {
        let usernameExists = await User.findOne({username: req.body.username });
        if (usernameExists) {
            return res.status(400).send('This username is already taken')
        }
        updates.username = req.body.username;
    }

    //if the user is trying to change email, check for email existance
    if(req.body.email !== req.user.email) {
        let emailExists = await User.findOne({email: req.body.email });
        if (emailExists) {
            return res.status(400).send('This email is already taken')
        }
         updates.email = req.body.email;
    }
    console.log('request: ', req.body);
    console.log(updates);
    if(!updates) return res.status(400).send('No changes made');

    let updatedUser = await User.findOneAndUpdate({ _id: req.user._id, deleted: false }, {$set: updates}, {new: true});
    if(!updatedUser) return res.status(404).send('No such user!');
    res.status(200).send(updatedUser);
});

// TODO update the email and / or username of the current user
router.patch('/:id', [auth, admin], async (req, res) => {

    const { error } = validateRegisterInfo(req.body);
    if (error) {
        console.log('JOI: ', error);
        return res.status(400).send(error);
    }

    // if the user is trying to change username, check for username existance
    if (!req.body.user.username === req.user.username ) {
        let usernameExists = await User.findOne({username: req.params.id });
        if (usernameExists) {
            return res.status(400).send('This username is already taken')
        }
    }

    //if the user is trying to changeemail, check for email existance
    if(!req.body.user.email === req.user.email) {
        let emailExists = await User.findOne({email: req.body.new.email });
        if (emailExists) {
            return res.status(400).send('This email is already taken')
        }
    }

    let updatedUser = await User.findOneAndUpdate({ _id: req.params.id, deleted: false }, {$set: req.body.user}, {new: true});
    if(!updatedUser) return res.status(404).send('No such user!');
    res.status(200).send(updatedUser);
});


// TODO update password
router.patch('/me/resetpassword', auth, async (req, res) => {

    const { error } = validatePassword(req.body.user);
    if (error) {
        console.log('JOI: ', error);
        return res.status(400).send(error);
    }

    // hash the new pasword
    let salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(req.body.user.password, salt);

//TO DO - check that password is not included in the response
    let updatedUser = await User.findOneAndUpdate({ _id: req.user._id, deleted: false }, {$set: {password: hashedPassword}}, {new: true});
    if(!updatedUser) return res.status(404).send('No such user!');
    res.status(200).send(updatedUser);
});


// delete current user
router.delete('/me', auth, async (req, res) => {

    let deletedUser = await User.findByIdAndUpdate(req.user._id, {$set: {deleted: true, tokens: []}}, {new: true});
    if(!deletedUser) return res.status(404).send('No such user!');
    res.status(200).send('User was deleted');

});

//delete any user (Admin)
router.delete('/:id', [auth, admin], async (req, res) => {

    let deletedUser = await User.findByIdAndUpdate(req.params.id, {$set: {deleted: true, tokens: []}}, {new: true});
    if(!deletedUser) return res.status(404).send('No such user!');
    res.status(200).send('User was deleted');

});



module.exports = router;
