const express = require('express');
const { createMessage, getAllMessages } = require('../controllers/message.controller');
const verifyJWT = require('../middlewares/verifyJWT'); 
const verifyRole = require('../middlewares/verifyRole'); 
const router = express.Router();


router.post('/', verifyJWT, verifyRole(['user']), createMessage);


router.get('/', verifyJWT, getAllMessages);

module.exports = router;
