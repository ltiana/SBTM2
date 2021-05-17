require('dotenv').config();
require('express-async-errors');

const express = require('express'),
      logger = require('./startup/logger.js'),
      morgan = require('morgan');

// express config
const app = express();

console.log('MODE: ' + process.env.NODE_ENV);


if(process.env.NODE_ENV === 'development') {
    app.use(morgan('combined'));
    logger.debug('Morgan enabled ...');
}

require('./startup/validation.js')();
require('./startup/routes.js')(app);
require('./startup/db.js')();
require('./startup/prod.js')(app);

const PORT = process.env.PORT_DEV || process.env.PORT || 3000;

const server = app.listen(PORT, () => {
      logger.debug('App listening on port ' + PORT)
});

module.exports = server;
