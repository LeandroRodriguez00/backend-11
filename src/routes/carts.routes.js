const express = require('express');
const { 
    createCart, 
    getCartById, 
    addProductToCart, 
    clearCart, 
    deleteCart, 
    updateProductQuantityInCart, 
    removeProductFromCart, 
    updateCartProducts, 
    purchaseCart
} = require('../controllers/cart.controller');
const verifyJWT = require('../middlewares/verifyJWT'); 
const verifyRole = require('../middlewares/verifyRole'); 
const validateObjectId = require('../middlewares/validateObjectId'); 
const router = express.Router();


router.post('/', verifyJWT, createCart);


router.get('/:id', verifyJWT, validateObjectId, getCartById);


router.post('/:id/products', verifyJWT, verifyRole(['user']), validateObjectId, addProductToCart);


router.delete('/:cid/products', verifyJWT, verifyRole(['admin']), validateObjectId, clearCart);


router.delete('/:cid', verifyJWT, verifyRole(['admin']), validateObjectId, deleteCart);


router.delete('/:cid/products/:pid', verifyJWT, verifyRole(['user']), validateObjectId, removeProductFromCart);


router.put('/:id/products/:pid', verifyJWT, verifyRole(['user']), validateObjectId, updateProductQuantityInCart);


router.put('/:cid/products', verifyJWT, verifyRole(['user']), validateObjectId, updateCartProducts);


router.post('/:cid/purchase', verifyJWT, verifyRole(['user']), validateObjectId, purchaseCart);

module.exports = router;
