const express = require('express');
const router = express.Router();
const { getMockProducts } = require('../controllers/mocking.controller');


router.get('/mockingproducts', getMockProducts);  

module.exports = router;
