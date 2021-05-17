const Joi = require('joi'),
      mongoose = require('mongoose'),
      { Session } = require('./session.js'),
      { Charter } = require('./charter.js');


// OBS! to make a nested object required, use a single nested schema


//TODO - what propertes should be included for a file, what are the allowed value type / values for each property?)

const dataFileSchema = new mongoose.Schema({
    file: {
        type: Buffer,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileSize: Number,
    fileType: String

});

const DataFile = mongoose.model("DataFile", dataFileSchema);



module.exports = {
    DataFile
};
