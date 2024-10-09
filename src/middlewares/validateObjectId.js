import { isValidObjectId } from 'mongoose';
import CustomError from '../middlewares/customError.js';
import errorDictionary from '../config/errorDictionary.js';

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

export default validateObjectId;
