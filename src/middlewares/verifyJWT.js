const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');
const CustomError = require('../middlewares/customError');
const errorDictionary = require('../config/errorDictionary');
const logger = require('../middlewares/logger');

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

module.exports = verifyJWT;
