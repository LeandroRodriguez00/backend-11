const mongoose = require('mongoose');
const Product = require('../models/Product');  
const CustomError = require('../../src/middlewares/customError');
const errorDictionary = require('../../src/config/errorDictionary');
const logger = require('../../src/middlewares/logger'); 

class ProductMongoDAO {
  async getAllProducts(filter = {}, options = {}) {
    try {
      return await Product.paginate(filter, options);
    } catch (error) {
      logger.error('Error al obtener productos:', { error });
      throw new CustomError(errorDictionary.PRODUCT_ERRORS.PRODUCT_RETRIEVAL_FAILED); 
    }
  }

  async getProductById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(errorDictionary.PRODUCT_ERRORS.INVALID_PRODUCT_ID); 
      }
      
      const product = await Product.findById(id);
      
      if (!product) {
        throw new CustomError(errorDictionary.PRODUCT_ERRORS.PRODUCT_NOT_FOUND); 
      }

      return product;
    } catch (error) {
      logger.error(`Error al obtener el producto con ID ${id}:`, { error });
      throw new CustomError(errorDictionary.PRODUCT_ERRORS.PRODUCT_RETRIEVAL_FAILED); 
    }
  }

  async createProduct(productData) {
    try {
      const newProduct = new Product(productData);
      return await newProduct.save();
    } catch (error) {
      logger.error('Error al crear producto:', { error });
      throw new CustomError(errorDictionary.PRODUCT_ERRORS.PRODUCT_CREATION_FAILED); 
    }
  }

  async updateProduct(id, productData) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(errorDictionary.PRODUCT_ERRORS.INVALID_PRODUCT_ID); 
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, productData, { new: true });

      if (!updatedProduct) {
        throw new CustomError(errorDictionary.PRODUCT_ERRORS.PRODUCT_NOT_FOUND); 
      }

      return updatedProduct;
    } catch (error) {
      logger.error(`Error al actualizar el producto con ID ${id}:`, { error });
      throw new CustomError(errorDictionary.PRODUCT_ERRORS.PRODUCT_UPDATE_FAILED); 
    }
  }

  async deleteProduct(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(errorDictionary.PRODUCT_ERRORS.INVALID_PRODUCT_ID); 
      }

      const deletedProduct = await Product.findByIdAndDelete(id);

      if (!deletedProduct) {
        throw new CustomError(errorDictionary.PRODUCT_ERRORS.PRODUCT_NOT_FOUND); 
      }

      return deletedProduct;
    } catch (error) {
      logger.error(`Error al eliminar el producto con ID ${id}:`, { error });
      throw new CustomError(errorDictionary.PRODUCT_ERRORS.PRODUCT_DELETE_FAILED); 
    }
  }
}

module.exports = new ProductMongoDAO();
