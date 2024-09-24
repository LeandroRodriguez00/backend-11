const CustomError = require('./customError'); 

const errorHandler = (err, req, res, next) => {
  if (err instanceof CustomError) {
  
    return res.status(err.status).json({ message: err.message });
  }
  
  console.error('Error no controlado:', err);
  return res.status(500).json({ message: 'Error interno del servidor' });
};

module.exports = errorHandler;
