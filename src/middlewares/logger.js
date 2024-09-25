const { createLogger, transports, format } = require('winston');
const path = require('path');

const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    http: 4,
    debug: 5
  },
  colors: {
    fatal: 'magenta',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'cyan',
    debug: 'blue'
  }
};


require('winston').addColors(customLevels.colors);


const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
);


const loggerTransports = [
  new transports.Console({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info', 
    format: format.combine(
      format.colorize({ all: true }), 
      logFormat
    )
  }),
  new transports.File({ filename: path.join(__dirname, 'logs/errors.log'), level: 'error' }),
  new transports.File({ filename: path.join(__dirname, 'logs/combined.log'), level: 'info' })
];


const logger = createLogger({
  levels: customLevels.levels,
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info', 
  transports: loggerTransports,
});


console.log(`Configuración del logger: Entorno -> ${process.env.NODE_ENV}, Nivel de log -> ${logger.level}`);

module.exports = logger;
