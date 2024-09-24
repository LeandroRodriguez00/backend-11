const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');
const CustomError = require('../middlewares/customError'); // Importamos el manejador de errores
const errorDictionary = require('../config/errorDictionary'); // Importamos el diccionario de errores

function verifyJWT(req, res, next) {
  console.log("Cookies recibidas:", req.cookies);

  const token = req.cookies.jwt;

  if (!token) {
    throw new CustomError(errorDictionary.AUTH_ERRORS.TOKEN_INVALID);
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        throw new CustomError(errorDictionary.AUTH_ERRORS.TOKEN_EXPIRED);
      } else {
        throw new CustomError(errorDictionary.AUTH_ERRORS.TOKEN_INVALID);
      }
    }
    req.user = decoded;
    next();
  });
}

module.exports = verifyJWT;
