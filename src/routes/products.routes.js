
const express = require('express');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const verifyJWT = require('../middlewares/verifyJWT');
const router = express.Router();


router.get('/', verifyJWT, getAllProducts);
router.get('/:id', verifyJWT, getProductById);  
router.post('/', verifyJWT, createProduct);
router.put('/:id', verifyJWT, updateProduct);
router.delete('/:id', verifyJWT, deleteProduct);

module.exports = router;
