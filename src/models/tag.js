const     Joi = require('joi'),
    mongoose = require('mongoose');


// OBS! to make a nested object required, use a single nested schema

const validTagTypes = ['Reference', 'Label', 'Version', 'Environment'];

const tagSchema = new mongoose.Schema({
    tag: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 150,
        lowercase: true
    },
    type: {
        type: String,
        enum: validTagTypes,
        required: true
    }
});

const Tag = mongoose.model("Tag", tagSchema);

// fix rule for tags



function validateTag(tag) {

    const schema = Joi.object({
        tag: Joi.string().min(2).max(150).lowercase().required().label('Tag'),
        type: Joi.string().required().valid('Reference', 'Label', 'Version', 'Environment')
    })

    return schema.validate(tag);
};

module.exports = {
    Tag,
    validateTag
};
