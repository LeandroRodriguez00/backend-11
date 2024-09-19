const mongoose = require('mongoose');
const Product = require('../models/Product');  

class ProductMongoDAO {
  async getAllProducts(filter = {}, options = {}) {
    try {
      return await Product.paginate(filter, options);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw new Error('Error al obtener productos');
    }
  }

  async getProductById(id) {
    try {
    
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID de producto inválido');
      }
      
      const product = await Product.findById(id);
      
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      return product;
    } catch (error) {
      console.error(`Error al obtener el producto con ID ${id}:`, error);
      throw new Error('Error al obtener el producto');
    }
  }

  async createProduct(productData) {
    try {
      const newProduct = new Product(productData);
      return await newProduct.save();
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw new Error('Error al crear producto');
    }
  }

  async updateProduct(id, productData) {
    try {
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID de producto inválido');
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, productData, { new: true });

      if (!updatedProduct) {
        throw new Error('Producto no encontrado para actualizar');
      }

      return updatedProduct;
    } catch (error) {
      console.error(`Error al actualizar el producto con ID ${id}:`, error);
      throw new Error('Error al actualizar producto');
    }
  }

  async deleteProduct(id) {
    try {

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID de producto inválido');
      }

      const deletedProduct = await Product.findByIdAndDelete(id);

      if (!deletedProduct) {
        throw new Error('Producto no encontrado para eliminar');
      }

      return deletedProduct;
    } catch (error) {
      console.error(`Error al eliminar el producto con ID ${id}:`, error);
      throw new Error('Error al eliminar producto');
    }
  }
}

module.exports = new ProductMongoDAO();
