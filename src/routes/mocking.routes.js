import express from 'express';
import { getMockProducts } from '../controllers/mocking.controller.js';

const router = express.Router();

router.get('/mockingproducts', getMockProducts);

export default router;