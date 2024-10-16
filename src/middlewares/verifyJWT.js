import config from '../config/config.js'; 
import CustomError from '../middlewares/customError.js';
import errorDictionary from '../config/errorDictionary.js';
import jwt from 'jsonwebtoken';
import UserDao from '../../dao/mongo/UserMongoDAO.js';  // Importar el DAO para buscar al usuario en la base de datos

const { jwtSecret } = config; 

async function verifyJWT(req, res, next) {
  if (!jwtSecret) {
    return res.status(500).send('Error interno del servidor: jwtSecret no está definido');
  }

  const token = req.cookies.jwt;

  if (!token) {
    return next(new CustomError(errorDictionary.AUTH_ERRORS.TOKEN_INVALID));
  }

  jwt.verify(token, jwtSecret, async (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new CustomError(errorDictionary.AUTH_ERRORS.TOKEN_EXPIRED));
      } else {
        return next(new CustomError(errorDictionary.AUTH_ERRORS.TOKEN_INVALID));
      }
    }

    try {
      if (!decoded.id) {
        return next(new CustomError(errorDictionary.USER_ERRORS.USER_NOT_FOUND));
      }

      const user = await UserDao.getUserById(decoded.id);

      if (!user) {
        return next(new CustomError(errorDictionary.USER_ERRORS.USER_NOT_FOUND));
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(500).send('Error interno del servidor al verificar el usuario.');
    }
  });
}

export default verifyJWT;
