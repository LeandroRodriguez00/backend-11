const express = require('express');
const { getAllProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const verifyJWT = require('../middlewares/auth');
const router = express.Router();


router.get('/', verifyJWT, getAllProducts);
router.post('/', verifyJWT, createProduct);
router.put('/:id', verifyJWT, updateProduct);
router.delete('/:id', verifyJWT, deleteProduct);

module.exports = router;
