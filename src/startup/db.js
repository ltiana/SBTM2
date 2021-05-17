const mongoose = require('mongoose'),
      logger = require('./logger.js');


module.exports = function() {

    // mongod version: 3.6.9 (MMAPv1)
    let dbUrl;

    if (process.env.NODE_ENV === 'development') {
        dbUrl = process.env.DB_URL_DEV;
    } else if (process.env.NODE_ENV === 'production') {
        dbUrl = process.env.DB_URL_PROD;
    } else {
        dbUrl = process.env.DB_URL_TEST;
    }

    if(!dbUrl) throw new Error('FATAL ERROR: dbUrl is not defined.');

    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);

    mongoose.connect(dbUrl, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => logger.debug(`Connected to Mongodb ...`))

}
