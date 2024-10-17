import express from 'express';
import { 
  createCart, 
  getCartById, 
  addProductToCart, 
  clearCart, 
  deleteCart, 
  updateProductQuantityInCart, 
  removeProductFromCart, 
  updateCartProducts, 
  purchaseCart 
} from '../controllers/cart.controller.js';
import verifyJWT from '../middlewares/verifyJWT.js';
import verifyRole from '../middlewares/verifyRole.js';
import validateObjectId from '../middlewares/validateObjectId.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Carrito
 *   description: API para gestionar carritos de compras
 */

/**
 * @swagger
 * /carts:
 *   post:
 *     summary: Crear un nuevo carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Carrito creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: No autorizado
 */
router.post('/', verifyJWT, createCart);

/**
 * @swagger
 * /carts/{id}:
 *   get:
 *     summary: Obtener un carrito por ID
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del carrito
 *     responses:
 *       200:
 *         description: Carrito obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: Carrito no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/:id', verifyJWT, validateObjectId, getCartById);

/**
 * @swagger
 * /carts/{id}/products:
 *   post:
 *     summary: Agregar un producto al carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del carrito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID del producto a agregar
 *               quantity:
 *                 type: integer
 *                 description: Cantidad del producto
 *     responses:
 *       200:
 *         description: Producto agregado al carrito correctamente
 *       404:
 *         description: Carrito o producto no encontrado
 *       401:
 *         description: No autorizado
 */
router.post('/:cartId/products', verifyJWT, verifyRole(['premium', 'user']), addProductToCart);

/**
 * @swagger
 * /carts/{cid}/products:
 *   delete:
 *     summary: Limpiar el carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del carrito
 *     responses:
 *       200:
 *         description: Carrito limpiado correctamente
 *       404:
 *         description: Carrito no encontrado
 *       401:
 *         description: No autorizado
 */
router.delete('/:cid/products', verifyJWT, verifyRole(['admin']), validateObjectId, clearCart);

/**
 * @swagger
 * /carts/{cid}:
 *   delete:
 *     summary: Eliminar un carrito por ID
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del carrito a eliminar
 *     responses:
 *       200:
 *         description: Carrito eliminado correctamente
 *       404:
 *         description: Carrito no encontrado
 *       401:
 *         description: No autorizado
 */
router.delete('/:cid', verifyJWT, verifyRole(['admin']), validateObjectId, deleteCart);

/**
 * @swagger
 * /carts/{cid}/products/{pid}:
 *   delete:
 *     summary: Eliminar un producto del carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del carrito
 *       - in: path
 *         name: pid
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito correctamente
 *       404:
 *         description: Carrito o producto no encontrado
 *       401:
 *         description: No autorizado
 */
router.delete('/:cid/products/:pid', verifyJWT, verifyRole(['user']), validateObjectId, removeProductFromCart);

/**
 * @swagger
 * /carts/{id}/products/{pid}:
 *   put:
 *     summary: Actualizar la cantidad de un producto en el carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del carrito
 *       - in: path
 *         name: pid
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: Nueva cantidad del producto
 *     responses:
 *       200:
 *         description: Cantidad del producto actualizada correctamente
 *       404:
 *         description: Carrito o producto no encontrado
 *       401:
 *         description: No autorizado
 */
router.put('/:id/products/:pid', verifyJWT, verifyRole(['user']), validateObjectId, updateProductQuantityInCart);

/**
 * @swagger
 * /carts/{cid}/products:
 *   put:
 *     summary: Actualizar los productos del carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del carrito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: ID del producto
 *                     quantity:
 *                       type: integer
 *                       description: Cantidad del producto
 *     responses:
 *       200:
 *         description: Productos del carrito actualizados correctamente
 *       404:
 *         description: Carrito o producto no encontrado
 *       401:
 *         description: No autorizado
 */
router.put('/:cid/products', verifyJWT, verifyRole(['user']), validateObjectId, updateCartProducts);

/**
 * @swagger
 * /carts/{cid}/purchase:
 *   post:
 *     summary: Realizar la compra del carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del carrito
 *     responses:
 *       200:
 *         description: Compra realizada correctamente
 *       404:
 *         description: Carrito no encontrado
 *       401:
 *         description: No autorizado
 */
router.post('/:cid/purchase', verifyJWT, verifyRole(['user']), validateObjectId, purchaseCart);

export default router;
