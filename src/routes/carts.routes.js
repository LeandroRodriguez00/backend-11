const express = require('express');
const { createCart, getCartById, addProductToCart, clearCart, deleteCart } = require('../controllers/cart.controller');
const verifyJWT = require('../middlewares/auth');
const router = express.Router();

router.post('/', verifyJWT, createCart);
router.get('/:id', verifyJWT, getCartById);
router.post('/:id/products', verifyJWT, addProductToCart);
router.delete('/:cid/products', verifyJWT, clearCart);
router.delete('/:cid', verifyJWT, deleteCart);

module.exports = router;
