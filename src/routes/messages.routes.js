import express from 'express';
import { createMessage, getAllMessages } from '../controllers/message.controller.js';
import verifyJWT from '../middlewares/verifyJWT.js';
import verifyRole from '../middlewares/verifyRole.js';

const router = express.Router();

router.post('/', verifyJWT, verifyRole(['user']), createMessage);

router.get('/', verifyJWT, getAllMessages);

export default router;
