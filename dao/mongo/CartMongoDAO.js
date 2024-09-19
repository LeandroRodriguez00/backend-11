const Cart = require('../models/Cart');

class CartMongoDAO {
  async getCartById(id) {
    return await Cart.findById(id).populate('products.product');
  }

  async createCart(cartData) {
    const newCart = new Cart(cartData);
    return await newCart.save();
  }

  async updateCart(id, cartData) {
    return await Cart.findByIdAndUpdate(id, cartData, { new: true });
  }

  async deleteCart(id) {
    return await Cart.findByIdAndDelete(id);
  }


  async addProductToCart(cartId, productId, quantity) {
    const cart = await this.getCartById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    const productIndex = cart.products.findIndex(p => p.product.equals(productId));

    if (productIndex >= 0) {
    
      cart.products[productIndex].quantity += quantity;
    } else {
  
      cart.products.push({ product: productId, quantity });
    }

    return await cart.save(); 
  }

  async updateCartProducts(id, products) {

    return await Cart.findByIdAndUpdate(id, { products }, { new: true });
  }


  async clearCart(id) {
    return await Cart.findByIdAndUpdate(id, { products: [] }, { new: true });
  }
}

module.exports = new CartMongoDAO();
