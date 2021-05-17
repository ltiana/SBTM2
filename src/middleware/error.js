const logger = require('../startup/logger.js');

module.exports = function(err, req, res, next) {

      // log error
      logger.error(err.stack.toString());

      // send response
      let errorMessage = err.name + ': ' + err.message;
      return res.status(500).send(errorMessage);
};
