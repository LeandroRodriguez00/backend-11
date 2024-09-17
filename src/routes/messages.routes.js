const express = require('express');
const { createMessage, getAllMessages } = require('../controllers/message.controller');
const verifyJWT = require('../middlewares/auth');
const router = express.Router();

router.post('/', verifyJWT, createMessage);
router.get('/', verifyJWT, getAllMessages);

module.exports = router;
