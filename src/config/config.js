require('dotenv').config();
const logger = require('../middlewares/logger');

const jwtSecret = process.env.JWT_SECRET;
const mongoUri = process.env.MONGO_URI;
const googleClientID = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const sessionSecret = process.env.SESSION_SECRET;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const port = process.env.PORT || 3000;


const requiredEnvVars = [
  { key: 'JWT_SECRET', value: jwtSecret },
  { key: 'MONGO_URI', value: mongoUri },
  { key: 'GOOGLE_CLIENT_ID', value: googleClientID },
  { key: 'GOOGLE_CLIENT_SECRET', value: googleClientSecret },
  { key: 'SESSION_SECRET', value: sessionSecret },
  { key: 'EMAIL_USER', value: emailUser },
  { key: 'EMAIL_PASS', value: emailPass },
  { key: 'PORT', value: port }
];

requiredEnvVars.forEach(({ key, value }) => {
  if (!value) {
    logger.error(`Variable de entorno faltante: ${key}. Verifica el archivo .env.`);
    throw new Error(`Variable de entorno faltante: ${key}`);
  }
});

module.exports = {
  port,
  mongoUri,
  jwtSecret,
  googleClientID,
  googleClientSecret,
  sessionSecret,
  emailUser,
  emailPass
};
