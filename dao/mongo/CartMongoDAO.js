import Cart from '../models/Cart.js';
import CustomError from '../../src/middlewares/customError.js';
import errorDictionary from '../../src/config/errorDictionary.js';

class CartMongoDAO {
  async getCartById(id) {
    const cart = await Cart.findById(id).populate('products.product');
    if (!cart) {
      throw new CustomError(errorDictionary.CART_ERRORS.CART_NOT_FOUND);
    }
    return cart;
  }

  async createCart(cartData) {
    const newCart = new Cart(cartData);
    return await newCart.save();
  }

  async updateCart(id, cartData) {
    const updatedCart = await Cart.findByIdAndUpdate(id, cartData, { new: true });
    if (!updatedCart) {
      throw new CustomError(errorDictionary.CART_ERRORS.CART_NOT_FOUND);
    }
    return updatedCart;
  }

  async deleteCart(id) {
    const deletedCart = await Cart.findByIdAndDelete(id);
    if (!deletedCart) {
      throw new CustomError(errorDictionary.CART_ERRORS.CART_NOT_FOUND);
    }
    return deletedCart;
  }

  async addProductToCart(cartId, productId, quantity) {
    const cart = await this.getCartById(cartId);
    
    const productIndex = cart.products.findIndex(p => p.product.equals(productId));

    if (productIndex >= 0) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    return await cart.save();
  }

  async updateCartProducts(id, products) {
    const updatedCart = await Cart.findByIdAndUpdate(id, { products }, { new: true });
    if (!updatedCart) {
      throw new CustomError(errorDictionary.CART_ERRORS.CART_NOT_FOUND);
    }
    return updatedCart;
  }

  async clearCart(id) {
    const clearedCart = await Cart.findByIdAndUpdate(id, { products: [] }, { new: true });
    if (!clearedCart) {
      throw new CustomError(errorDictionary.CART_ERRORS.CART_NOT_FOUND);
    }
    return clearedCart;
  }

  async updateProductQuantityInCart(cartId, productId, quantity) {
    const cart = await this.getCartById(cartId);
    
    const productIndex = cart.products.findIndex(p => p.product.equals(productId));
    if (productIndex === -1) {
      throw new CustomError(errorDictionary.CART_ERRORS.PRODUCT_NOT_FOUND_IN_CART);
    }

    cart.products[productIndex].quantity = quantity;

    return await cart.save();
  }

  async removeProductFromCart(cartId, productId) {
    const cart = await this.getCartById(cartId);
    
    const productIndex = cart.products.findIndex(p => p.product.equals(productId));
    if (productIndex === -1) {
      throw new CustomError(errorDictionary.CART_ERRORS.PRODUCT_NOT_FOUND_IN_CART);
    }

    cart.products.splice(productIndex, 1);

    return await cart.save();
  }
}

export default new CartMongoDAO();
