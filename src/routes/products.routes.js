const express = require('express');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const verifyJWT = require('../middlewares/verifyJWT');
const verifyRole = require('../middlewares/verifyRole'); 
const router = express.Router();


router.get('/', verifyJWT, getAllProducts);
router.get('/:id', verifyJWT, getProductById);


router.post('/', verifyJWT, verifyRole(['admin']), createProduct);
router.put('/:id', verifyJWT, verifyRole(['admin']), updateProduct);
router.delete('/:id', verifyJWT, verifyRole(['admin']), deleteProduct);

module.exports = router;
