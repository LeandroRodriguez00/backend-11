const { isValidObjectId } = require('mongoose');
const CustomError = require('../middlewares/customError'); 
const errorDictionary = require('../config/errorDictionary'); 

const validateObjectId = (req, res, next) => {
  const { id, cid, pid } = req.params;


  if (id && !isValidObjectId(id)) {
    throw new CustomError(errorDictionary.CART_ERRORS.INVALID_CART_ID); 
  }
  if (cid && !isValidObjectId(cid)) {
    throw new CustomError(errorDictionary.CART_ERRORS.INVALID_CART_ID); 
  }
  if (pid && !isValidObjectId(pid)) {
    throw new CustomError(errorDictionary.PRODUCT_ERRORS.INVALID_PRODUCT_ID); 
  }

  next();
};

module.exports = validateObjectId;
