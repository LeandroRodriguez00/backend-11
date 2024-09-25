const CustomError = require('./customError');
const logger = require('./logger');  

const errorHandler = (err, req, res, next) => {
  if (err instanceof CustomError) {
  
    return res.status(err.status).json({ message: err.message });
  }
  
  logger.error('Error no controlado: %o', err);  
  return res.status(500).json({ message: 'Error interno del servidor' });
};

module.exports = errorHandler;
