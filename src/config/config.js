import dotenv from 'dotenv';
import logger from '../middlewares/logger.js';

dotenv.config();

const config = {
  jwtSecret: process.env.JWT_SECRET,
  mongoUri: process.env.MONGO_URI,
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  sessionSecret: process.env.SESSION_SECRET,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  port: process.env.PORT || 3000,
};

const requiredEnvVars = [
  { key: 'JWT_SECRET', value: config.jwtSecret },
  { key: 'MONGO_URI', value: config.mongoUri },
  { key: 'GOOGLE_CLIENT_ID', value: config.googleClientID },
  { key: 'GOOGLE_CLIENT_SECRET', value: config.googleClientSecret },
  { key: 'SESSION_SECRET', value: config.sessionSecret },
  { key: 'EMAIL_USER', value: config.emailUser },
  { key: 'EMAIL_PASS', value: config.emailPass },
  { key: 'PORT', value: config.port }
];

requiredEnvVars.forEach(({ key, value }) => {
  if (!value) {
    logger.error(`Variable de entorno faltante: ${key}. Verifica el archivo .env.`);
    throw new Error(`Variable de entorno faltante: ${key}`);
  }
});

export default config;
