const mongoose = require('mongoose');
const CartDao = require('../../dao/mongo/CartMongoDAO');
const ProductDao = require('../../dao/mongo/ProductMongoDAO');
const TicketDao = require('../../dao/mongo/TicketMongoDAO');
const { v4: uuidv4 } = require('uuid');
const CustomError = require('../middlewares/customError');
const errorDictionary = require('../config/errorDictionary');

exports.createCart = async (req, res) => {
  try {
    const nuevoCarrito = await CartDao.createCart();
    res.status(201).json(nuevoCarrito);
  } catch (error) {
    console.error('Error al crear carrito:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.getCartById = async (req, res) => {
  try {
    const carrito = await CartDao.getCartById(req.params.id);
    if (!carrito) {
      throw new CustomError(errorDictionary.CART_ERRORS.CART_NOT_FOUND);
    }
    res.json(carrito);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('Error al obtener carrito:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.addProductToCart = async (req, res) => {
  try {
    const carrito = await CartDao.getCartById(req.params.id);
    const producto = await ProductDao.getProductById(req.body.productId);
    if (!carrito) {
      throw new CustomError(errorDictionary.CART_ERRORS.CART_NOT_FOUND);
    }
    if (!producto) {
      throw new CustomError(errorDictionary.CART_ERRORS.PRODUCT_NOT_FOUND_IN_CART);
    }

    const updatedCart = await CartDao.addProductToCart(req.params.id, req.body.productId, req.body.quantity);
    res.json(updatedCart);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.clearCart = async (req, res) => {
  try {
    await CartDao.clearCart(req.params.cid);
    res.status(200).json({ message: 'Productos eliminados del carrito' });
  } catch (error) {
    console.error('Error al eliminar productos del carrito:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.deleteCart = async (req, res) => {
  try {
    const carritoEliminado = await CartDao.deleteCart(req.params.cid);
    if (!carritoEliminado) {
      throw new CustomError(errorDictionary.CART_ERRORS.CART_NOT_FOUND);
    }
    res.status(200).json({ message: 'Carrito eliminado correctamente' });
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('Error al eliminar el carrito:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.updateProductQuantityInCart = async (req, res) => {
  try {
    const { id, pid } = req.params;
    const { quantity } = req.body;

    const updatedCart = await CartDao.updateProductQuantityInCart(id, pid, quantity);
    if (!updatedCart) {
      throw new CustomError(errorDictionary.CART_ERRORS.PRODUCT_NOT_FOUND_IN_CART);
    }
    res.json(updatedCart);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('Error al actualizar cantidad de producto en carrito:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.removeProductFromCart = async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const updatedCart = await CartDao.removeProductFromCart(cid, pid);
    if (!updatedCart) {
      throw new CustomError(errorDictionary.CART_ERRORS.PRODUCT_NOT_FOUND_IN_CART);
    }
    res.status(200).json({ message: 'Producto eliminado del carrito', updatedCart });
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('Error al eliminar producto del carrito:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.updateCartProducts = async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    const updatedCart = await CartDao.updateCartProducts(cid, products);
    if (!updatedCart) {
      throw new CustomError(errorDictionary.CART_ERRORS.CART_NOT_FOUND);
    }
    res.json(updatedCart);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('Error al actualizar productos del carrito:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.purchaseCart = async (req, res) => {
  try {
    const { cid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cid)) {
      throw new CustomError({ message: 'ID de carrito inválido', type: 'ValidationError', status: 400 });
    }

    const carrito = await CartDao.getCartById(cid);
    if (!carrito) {
      throw new CustomError(errorDictionary.CART_ERRORS.CART_NOT_FOUND);
    }

    let totalAmount = 0;
    const unavailableProducts = [];
    const availableProducts = [];

    for (let item of carrito.products) {
      const product = await ProductDao.getProductById(item.product);

      if (!product) {
        unavailableProducts.push(item.product);
        continue;
      }

      if (product.stock >= item.quantity) {
        totalAmount += product.price * item.quantity;
        availableProducts.push(item);
        product.stock -= item.quantity;
        await ProductDao.updateProduct(product._id, product);
      } else {
        unavailableProducts.push(product);
      }
    }

    if (availableProducts.length === 0) {
      throw new CustomError({ message: 'No hay productos suficientes para realizar la compra', type: 'StockError', status: 400 });
    }

    if (totalAmount > 0) {
      await TicketDao.createTicket({
        code: uuidv4(),
        amount: totalAmount,
        purchaser: req.user.email,
      });
    }

    await CartDao.updateCartProducts(cid, availableProducts);

    res.json({
      message: unavailableProducts.length ? 'Compra realizada parcialmente' : 'Compra realizada con éxito',
      unavailableProducts,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('Error al finalizar la compra:', error);
    res.status(500).send(`Error al finalizar la compra: ${error.message}`);
  }
};
