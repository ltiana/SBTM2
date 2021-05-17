const     Joi = require('joi'),
    mongoose = require('mongoose'),
    { User } = require('./user.js'),
    { Tag } = require('./tag.js');

// OBS! to make a nested object required, use a single nested schema

// SHEMA

const validSessionStatuses = ['To Do', 'Started', 'Paused', 'Completed'];

// username for tester, createdBy and updatedBy are copied/duplicated
// tag names are duplcated

const sessionSchema = new mongoose.Schema({
    formOpen: {
       type: Boolean,
       default: false
    },
    started: {
        type: Date
    },
    completed: {
        type: Date
    },
    status: {
        statusName: {
            type: String,
            enum: validSessionStatuses,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    tester: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        username: {
            type: String,
            required: [true, 'Username is required'],
            minlength: 3,
            maxlength: 20
        }
    },
    version: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Tag"
                },
            tag: {
                type: String,
                required: true,
                minlength: 2,
                maxlength: 150,
                lowercase: true
            }
        }
    ],
    environment: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Tag"
                },
            tag: {
                type: String,
                required: true,
                minlength: 2,
                maxlength: 150,
                lowercase: true
            }
        }
    ],
    notes: {
        type: String
    },
    bugs: {
        type: String
    },
    issues: {
        type: String
    },
    references: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Tag"
                },
            tag: {
                type: String,
                required: true,
                minlength: 2,
                maxlength: 150,
                lowercase: true
            }
        }
    ],
    dataFiles: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "DataFile"
            },
            fileName: {
                type: String,
                required: true
            }
        }
    ],
    created: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        username: {
            type: String,
            required: [true, 'Username is required'],
            minlength: 3,
            maxlength: 20
        }
    },
    taskBreakdown: {
        duration: {
            type: Number,
            min: [0, 'Approximate number of hours used - between 0 and 8'],
            max: [8, 'Approximate number of hours used - between 0 and 8'],
            default: 0
        },
        designExecution: {
            type: Number,
            min: [0, 'Percent of time used, must be between 0 and 100'],
            max: [100, 'Percent of time used, must be between 0 and 100'],
            default: 0
        },
        sessionSetup: {
            type: Number,
            min: [0, 'Percent of time used, must be between 0 and 100'],
            max: [100, 'Percent of time used, must be between 0 and 100'],
            default: 0
        },
        bugReporting: {
            type: Number,
            min: [0, 'Percent of time used, must be between 0 and 100'],
            max: [100, 'Percent of time used, must be between 0 and 100'],
            default: 0
        },
        onCharter: {
            type: Number,
            min: [0, 'Percent of time used, must be between 0 and 100'],
            max: [100, 'Percent of time used, must be between 0 and 100'],
            default: 0
        }
    },
});


// CHARTER

const validStatuses = ['Draft', 'To Do', 'In Progress', 'Done'];

const charterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 150
    },
    description: String,
    stakeholders: String,
    sessions: [ sessionSchema ],
    triggers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tag"
        }
    ],
    areas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tag"
        }
    ],
    datafiles: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "DataFile"
            },
            fileName: {
                type: String,
                required: true
            }
        }
    ],
    status: {
        type: String,
        enum: validStatuses,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    updated: {
        type: Date
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

const Charter = mongoose.model("Charter", charterSchema);


//data that are registered automatically are not validated: tester, created, createdBy, updated, UpdatedBy, started, deleted

// Joi validation
function validateCharter(charter) {

    const schema = Joi.object({
        title: Joi.string().required().min(2).max(150),
        description: Joi.string(),
        status: Joi.string().required().valid('Draft', 'To Do', 'In Progress', 'Done'),
        stakeholders: Joi.string(),
        triggers: Joi.array().items(Joi.string()),
        areas: Joi.array().items(Joi.string()),
        datafiles: Joi.array().items(Joi.string())
    })

    return schema.validate(charter);
};

// Joi validation
function validateSession(session) {

 //data that are registered automatically are not validated: tester, created, createdBy, updated, UpdatedBy, started, deleted

    const schema = Joi.object({
        status: Joi.object({
            statusName: Joi.string().required().valid('To Do', 'Started', 'Paused', 'Completed'),
            date: Joi.date()
        }),
        started: Joi.date().required(),
        completed: Joi.date(),
        bugs: Joi.string(),
        version: Joi.array().items(Joi.string()),
        environment: Joi.array().items(Joi.string()),
        issues: Joi.string(),
        notes: Joi.string(),
        references: Joi.array().items(Joi.string()),
        datafiles: Joi.array().items(Joi.string()),
        taskBreakdown: Joi.object({
            duration: Joi.number().min(0).max(8).label('Duration').required(),
            designExecution: Joi.number().min(1).max(100).label('Design and execution'),
            sessionSetup: Joi.number().min(1).max(100).label('Session setup'),
            bugReporting: Joi.number().min(1).max(100).label('Bug reporting'),
            onCharter: Joi.number().min(0).max(100).label('Time spent on charter')
        })

    });

    return schema.validate(session);
};

module.exports = {
    Charter,
    validateCharter,
    validateSession
};
