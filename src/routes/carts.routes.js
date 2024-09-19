
const express = require('express');
const { createCart, getCartById, addProductToCart, clearCart, deleteCart, updateProductQuantityInCart, removeProductFromCart, updateCartProducts } = require('../controllers/cart.controller');
const verifyJWT = require('../middlewares/verifyJWT'); 
const router = express.Router();

router.post('/', verifyJWT, createCart);
router.get('/:id', verifyJWT, getCartById);
router.post('/:id/products', verifyJWT, addProductToCart);
router.delete('/:cid/products', verifyJWT, clearCart);
router.delete('/:cid', verifyJWT, deleteCart);
router.delete('/:cid/products/:pid', verifyJWT, removeProductFromCart);
router.put('/:id/products/:pid', verifyJWT, updateProductQuantityInCart);
router.put('/:cid/products', verifyJWT, updateCartProducts);

module.exports = router;
