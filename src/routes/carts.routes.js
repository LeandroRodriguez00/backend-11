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
const router = express.Router();


router.post('/', verifyJWT, createCart);
router.get('/:id', verifyJWT, getCartById);

router.post('/:id/products', verifyJWT, verifyRole(['user']), addProductToCart);


router.delete('/:cid/products', verifyJWT, verifyRole(['admin']), clearCart);
router.delete('/:cid', verifyJWT, verifyRole(['admin']), deleteCart);

router.delete('/:cid/products/:pid', verifyJWT, verifyRole(['user']), removeProductFromCart);
router.put('/:id/products/:pid', verifyJWT, verifyRole(['user']), updateProductQuantityInCart);
router.put('/:cid/products', verifyJWT, verifyRole(['user']), updateCartProducts);


router.post('/:cid/purchase', verifyJWT, verifyRole(['user']), purchaseCart);

module.exports = router;
