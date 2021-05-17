const Joi = require('joi'),
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose');


// mongoose validation
// OBS! to make a nested object required, use a single nested schema

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, 'Username already taken'],
        required: [true, 'Username is required'],
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        unique: [true, 'Email already in use'],
        required: [true, 'Email is required'],
        minlength: 3,
        maxlength: 255
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 1024
    },
    tokens: [
        {token: {
            type: String,
            required:true
        }}
    ],
    roles: {
        admin: {
            type: Boolean,
            default: false
        },
        read: {
            type: Boolean,
            default: true
        },
        write: {
            type: Boolean,
            default: true
        }
    },
    firstname: {
        type: String,
        maxlength: 50
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

// instance methods for userSchema

//userSchema.statics.staticMethodName = async function(var1, var2) {
//    // find user
//    const something = await User.findOne({username: username, deleted: false });
//
//    return {
//        something
//    };
//};


// object methods for userSchema
// generate auth token
userSchema.methods.generateAuthToken = async function() {
    const user = this;
    let payload = {
        _id: this._id,
        roles: this.roles,
        email: this.email,
        username: this.username
    };
    const secret = process.env.JWT_LOGIN_SECRET;
    if(!secret) throw new Error('FATAL ERROR: JWT_LOGIN_SECRET is not defined.');
    const token = jwt.sign(payload, secret);
    await User.findByIdAndUpdate(user._id, { $push: { tokens: {token} }}, {new: true});

    return token;
};

// setting toJSON to return only the public properties of the user
userSchema.methods.toJSON = function() {
    const user = this;
    const publicProperties = {
        _id: user._id,
        email: user.email,
        username: user.username,
        roles: user.roles,
        firstname: user.firstname,
        lastname: user.lastname
    };
    return publicProperties;
};


// user model

const User = mongoose.model("User", userSchema);


// Joi validation

function validateRegisterInfo(registerInfo) {

    const schema = Joi.object({
        username: Joi.string().trim().min(3).max(20).required().label('Username'),
        email: Joi.string().trim().email().min(3).max(255).required().label('Email'),
        password: Joi.string().trim().min(6).max(20).pattern(/[a-zA-Z0-9]/).required().label('Password'),
        firstname:  Joi.string().trim().max(50).label('First name'),
        lastname:  Joi.string().trim().max(50).label('Last name')
    })

    return schema.validate(registerInfo);
};

function validateUpdateInfo(updateInfo) {

    const schema = Joi.object({
        username: Joi.string().trim().min(3).max(20).required().label('Username'),
        email: Joi.string().trim().email().min(3).max(255).required().label('Email'),
        firstname: Joi.string().trim().label('First name'),
        lastname: Joi.string().trim().label('Last name')
    })

    return schema.validate(updateInfo);
};

function validatePassword(password) {

    const schema = Joi.object({
        password: Joi.string().trim().min(6).max(20).required().label('Password')
    })

    return schema.validate(password);
};

function validateLoginInfo(loginInfo) {

    const schema = Joi.object({
        username: Joi.string().trim().min(3).max(20).required().label('Username'),
        password: Joi.string().trim().min(6).max(20).required().label('Password')
    })

    return schema.validate(loginInfo);
};


// export
module.exports = {
    User,
    validateRegisterInfo,
    validateLoginInfo,
    validatePassword,
    validateUpdateInfo
};
