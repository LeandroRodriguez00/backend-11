import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/config.js';
import CustomError from '../middlewares/customError.js';
import errorDictionary from '../config/errorDictionary.js';
import logger from '../middlewares/logger.js';

export function verifyJWT(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    logger.warn('Token JWT no proporcionado.');
    return next(new CustomError(errorDictionary.AUTH_ERRORS.TOKEN_INVALID));
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        logger.error('El token ha expirado.', { error: err });
        return next(new CustomError(errorDictionary.AUTH_ERRORS.TOKEN_EXPIRED));
      } else {
        logger.error('Token inválido.', { error: err });
        return next(new CustomError(errorDictionary.AUTH_ERRORS.TOKEN_INVALID));
      }
    }

    req.user = decoded;
    next();
  });
}
