import CustomError from '../middlewares/customError.js';
import errorDictionary from '../config/errorDictionary.js';

const verifyRole = (rolesPermitidos) => {
  return (req, res, next) => {
    const { role } = req.user;

    if (!rolesPermitidos.includes(role)) {
      throw new CustomError(errorDictionary.AUTH_ERRORS.ROLE_UNAUTHORIZED);
    }

    next();
  };
};

export default verifyRole;
