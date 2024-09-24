const CustomError = require('../middlewares/customError'); 
const errorDictionary = require('../config/errorDictionary'); 

module.exports = (rolesPermitidos) => {
  return (req, res, next) => {
    const { role } = req.user; 

    if (!rolesPermitidos.includes(role)) {
      throw new CustomError(errorDictionary.AUTH_ERRORS.ROLE_UNAUTHORIZED);
    }
    
    next();
  };
};
