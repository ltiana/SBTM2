const winston = require('winston');
require('winston-mongodb');
const { createLogger, format, transports } = winston;
const { combine, timestamp, label, prettyPrint, colorize, align } = format;

const errorStackTraceFormat = format(info => {
    if (info.meta && info.meta instanceof Error) {
        info.message = `${info.message} ${info.meta.stack}`;
    }
    return info;
});


//TODO define more approriate formats for the different environments, levels and transports
const developmentConsoleFormat = format.combine(timestamp(),format.splat(), format.simple(), errorStackTraceFormat() );
const productionConsoleFormat = format.combine(timestamp(),format.splat(), format.simple(), errorStackTraceFormat());
const developmentDBFormat = format.combine(timestamp(),format.splat(), format.simple(), errorStackTraceFormat(), format.json() );
const productionDBFormat = format.combine(timestamp(),format.splat(), format.simple(), errorStackTraceFormat(), format.json());

const logger = createLogger({
      transports: [
            // - Write to all logs to `combined.log`
            // - Write all logs error (and below) to `error.log`.//
            new transports.File({ filename: 'error.log', level: 'error', format: developmentConsoleFormat }),
            new transports.File({ filename: 'combined.log', level: 'error', format: developmentConsoleFormat})
      ]
});

let dbUrl = process.env.DB_URL_PROD;
if (process.env.NODE_ENV == 'development') { dbUrl = process.env.DB_URL_DEV;}
if (process.env.NODE_ENV == 'test') {dbUrl = process.env.DB_URL_TEST;}
console.log(dbUrl);
if(!dbUrl) throw new Error('FATAL ERROR: DB_URL is not defined.');


if (process.env.NODE_ENV == 'production') {
      logger.format = productionConsoleFormat;
      logger.add(new transports.Console({level: 'info', format: productionConsoleFormat }));
      logger.add(new transports.MongoDB({
            db: dbUrl,
            level: 'info',
            format: developmentDBFormat,
            tryReconnect:true,
            collection: 'log',
            capped: true,
            cappedMax: 500000
      }));

} else {
      logger.format = developmentConsoleFormat;
      logger.add(new transports.Console({level: 'debug', format: developmentConsoleFormat }));
      logger.add(new transports.MongoDB({
            db: dbUrl,
            level: 'info',
            format: developmentDBFormat,
            tryReconnect:true,
            collection: 'log',
            capped: true,
            cappedSize: 500000
      }));
}

// handle exceptions and unhandled rejections
logger.exceptions.handle(
      new transports.File({ filename: 'exceptions.log' }),
      new transports.Console()
);

process.on('unhandledRejection', (ex) => {
      throw ex;
});


module.exports = logger;
