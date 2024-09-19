const mongoose = require('mongoose');
const CartDao = require('../../dao/mongo/CartMongoDAO');
const ProductDao = require('../../dao/mongo/ProductMongoDAO');
const TicketDao = require('../../dao/mongo/TicketMongoDAO');
const { v4: uuidv4 } = require('uuid'); 

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
    if (carrito) {
      res.json(carrito);
    } else {
      res.status(404).send('Carrito no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.addProductToCart = async (req, res) => {
  try {
    const carrito = await CartDao.getCartById(req.params.id);
    const producto = await ProductDao.getProductById(req.body.productId);
    if (!carrito || !producto) {
      return res.status(404).send('Carrito o Producto no encontrado');
    }

    const updatedCart = await CartDao.addProductToCart(req.params.id, req.body.productId, req.body.quantity);
    res.json(updatedCart);
  } catch (error) {
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
    if (carritoEliminado) {
      res.status(200).json({ message: 'Carrito eliminado correctamente' });
    } else {
      res.status(404).send('Carrito no encontrado');
    }
  } catch (error) {
    console.error('Error al eliminar el carrito:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.updateProductQuantityInCart = async (req, res) => {
  try {
    const { id, pid } = req.params;
    const { quantity } = req.body;

    const updatedCart = await CartDao.updateProductQuantityInCart(id, pid, quantity);
    if (updatedCart) {
      res.json(updatedCart);
    } else {
      res.status(404).send('Carrito o producto no encontrado');
    }
  } catch (error) {
    console.error('Error al actualizar cantidad de producto en carrito:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.removeProductFromCart = async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const updatedCart = await CartDao.removeProductFromCart(cid, pid);
    if (updatedCart) {
      res.status(200).json({ message: 'Producto eliminado del carrito', updatedCart });
    } else {
      res.status(404).send('Carrito o producto no encontrado');
    }
  } catch (error) {
    console.error('Error al eliminar producto del carrito:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.updateCartProducts = async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    const updatedCart = await CartDao.updateCartProducts(cid, products);
    if (updatedCart) {
      res.json(updatedCart);
    } else {
      res.status(404).send('Carrito no encontrado');
    }
  } catch (error) {
    console.error('Error al actualizar productos del carrito:', error);
    res.status(500).send('Error en el servidor');
  }
};


exports.purchaseCart = async (req, res) => {
  try {
    const { cid } = req.params;

   
    if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res.status(400).json({ message: 'ID de carrito inválido' });
    }

    const carrito = await CartDao.getCartById(cid);
    if (!carrito) {
      return res.status(404).send('Carrito no encontrado');
    }

    let totalAmount = 0;
    const unavailableProducts = [];
    const availableProducts = [];


    for (let item of carrito.products) {
      const product = await ProductDao.getProductById(item.product);

      if (!product) {
        console.log(`Producto no encontrado: ${item.product}`);
        unavailableProducts.push(item.product);
        continue;
      }

      console.log(`Producto encontrado: ${JSON.stringify(product)}`);
      const productStock = product.stock;

      if (typeof productStock === 'number' && productStock >= item.quantity) {
        console.log(`Stock actual del producto ${product._id}: ${productStock}`);
        product.stock -= item.quantity;
        totalAmount += product.price * item.quantity;
        availableProducts.push(item);
        await ProductDao.updateProduct(product._id, product); 
      } else {
        console.log(`Stock insuficiente para el producto: ${product._id}`);
        unavailableProducts.push(product);
      }
    }

    if (availableProducts.length === 0) {
      return res.status(400).json({
        message: 'No hay productos suficientes para realizar la compra',
        unavailableProducts
      });
    }

    if (totalAmount > 0) {
      const ticket = await TicketDao.createTicket({
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
    console.error('Error al finalizar la compra:', error);
    res.status(500).send(`Error al finalizar la compra: ${error.message}`);
  }
};
