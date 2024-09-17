const Cart = require('../../dao/models/Cart');
const Product = require('../../dao/models/Product');


exports.createCart = async (req, res) => {
  try {
    const nuevoCarrito = new Cart({ products: [] });
    await nuevoCarrito.save();
    res.status(201).json(nuevoCarrito);
  } catch (error) {
    console.error('Error al crear carrito:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.getCartById = async (req, res) => {
  try {
    const carrito = await Cart.findById(req.params.id).populate('products.product');
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
    const carrito = await Cart.findById(req.params.id);
    const producto = await Product.findById(req.body.productId);
    if (!carrito || !producto) {
      return res.status(404).send('Carrito o Producto no encontrado');
    }

    const existingProductIndex = carrito.products.findIndex(item => item.product.toString() === req.body.productId);
    if (existingProductIndex >= 0) {
      carrito.products[existingProductIndex].quantity += req.body.quantity;
    } else {
      carrito.products.push({ product: req.body.productId, quantity: req.body.quantity });
    }

    await carrito.save();
    res.json(carrito);
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.clearCart = async (req, res) => {
  try {
    const carrito = await Cart.findById(req.params.cid);
    carrito.products = [];
    await carrito.save();
    res.status(200).json({ message: 'Productos eliminados del carrito' });
  } catch (error) {
    console.error('Error al eliminar productos del carrito:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.deleteCart = async (req, res) => {
  try {
    const carritoEliminado = await Cart.findByIdAndDelete(req.params.cid);
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
