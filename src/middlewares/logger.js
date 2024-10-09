import { createLogger, transports, format } from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: 'magenta',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'cyan',
    debug: 'blue',
  },
};

import winston from 'winston';
winston.addColors(customLevels.colors);

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
    ),
  }),

  new transports.File({
    filename: path.join(__dirname, 'logs/errors.log'),
    level: 'error',
    format: logFormat,
  }),

  new transports.File({
    filename: path.join(__dirname, 'logs/combined.log'),
    level: 'info',
    format: logFormat,
  }),
];

const logger = createLogger({
  levels: customLevels.levels,
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  transports: loggerTransports,
});

logger.info(`Configuración del logger: Entorno -> ${process.env.NODE_ENV}, Nivel de log -> ${logger.level}`);

export default logger;
