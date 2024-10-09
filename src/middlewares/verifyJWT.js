import config from '../config/config.js'; 
import CustomError from '../middlewares/customError.js';
import errorDictionary from '../config/errorDictionary.js';
import jwt from 'jsonwebtoken';
import logger from '../middlewares/logger.js';

const { jwtSecret } = config; 

function verifyJWT(req, res, next) {
  if (!jwtSecret) {
    logger.error('El valor de jwtSecret es undefined en verifyJWT.');
    return res.status(500).send('Error interno del servidor: jwtSecret no está definido');
  }

  const token = req.cookies.jwt;

  if (!token) {
    logger.warn('Token no encontrado en las cookies');
    return next(new CustomError(errorDictionary.AUTH_ERRORS.TOKEN_INVALID));
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        logger.warn('Token expirado');
        return next(new CustomError(errorDictionary.AUTH_ERRORS.TOKEN_EXPIRED));
      } else {
        logger.error('Error al verificar el token JWT', { error: err.message });
        return next(new CustomError(errorDictionary.AUTH_ERRORS.TOKEN_INVALID));
      }
    }

    req.user = decoded; 
    next(); 
  });
}

export default verifyJWT;
