import ProductDao from '../../dao/mongo/ProductMongoDAO.js';
import CustomError from '../middlewares/customError.js';
import errorDictionary from '../config/errorDictionary.js';
import logger from '../middlewares/logger.js';
import { sendEmail } from '../services/emailService.js'; 

export const getAllProducts = async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query, format } = req.query;

    let filter = {};
    if (query) {
      filter = {
        $or: [
          { category: { $regex: query, $options: 'i' } },
          { available: query.toLowerCase() === 'true' ? true : false },
        ],
      };
    }

    let sortOption = {};
    if (sort) {
      sortOption.price = sort.toLowerCase() === 'asc' ? 1 : -1;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: sortOption,
    };

    const result = await ProductDao.getAllProducts(filter, options);

    if (format === 'json') {
      return res.json({
        productos: result.docs,
        totalPages: result.totalPages,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
      });
    }

    res.render('products', {
      productos: result.docs,
      totalPages: result.totalPages,
      prevPage: result.hasPrevPage ? result.page - 1 : null,
      nextPage: result.hasNextPage ? result.page + 1 : null,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `/products?limit=${limit}&page=${result.page - 1}&sort=${sort}&query=${query}` : null,
      nextLink: result.hasNextPage ? `/products?limit=${limit}&page=${result.page + 1}&sort=${sort}&query=${query}` : null,
      user: req.user,
    });
  } catch (error) {
    logger.error('Error al obtener productos:', { error });
    res.status(500).send('Error al obtener productos');
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await ProductDao.getProductById(id);

    if (!producto) {
      throw new CustomError(errorDictionary.PRODUCT_ERRORS.PRODUCT_NOT_FOUND);
    }

    res.json(producto);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message });
    }
    logger.error('Error al obtener el producto:', { error });
    res.status(500).send('Error al obtener el producto');
  }
};

export const createProduct = async (req, res) => {
  try {
    const { title, price, description, category, stock, code } = req.body;
    const user = req.user;

    let owner = 'admin';
    if (user.role === 'premium') {
      owner = user.email;
    }

    const nuevoProducto = await ProductDao.createProduct({
      title,
      price,
      description,
      category,
      stock,
      code,
      owner,
      available: true,
    });

    res.status(201).json(nuevoProducto);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message });
    }
    logger.error('Error al crear producto:', { error });
    res.status(500).send('Error en el servidor');
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductDao.getProductById(id);
    const user = req.user;

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (user.role === 'premium' && product.owner !== user.email) {
      return res.status(403).json({ message: 'No puedes modificar productos que no te pertenecen' });
    }

    const productoActualizado = await ProductDao.updateProduct(id, req.body);
    res.json(productoActualizado);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message });
    }
    logger.error(`Error al actualizar producto con ID ${id}:`, { error });
    res.status(500).send('Error en el servidor');
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params; 
    const product = await ProductDao.getProductById(id);
    const user = req.user; 

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (user.role === 'premium' && product.owner !== user.email) {
      return res.status(403).json({ message: 'No puedes eliminar productos que no te pertenecen' });
    }

    await ProductDao.deleteProduct(id);

    if (product.owner === user.email && user.role === 'premium') {
      await sendEmail(user.email, 'Producto eliminado', `Tu producto "${product.title}" ha sido eliminado.`);
    }

    res.status(200).json({ message: 'Producto eliminado' });
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message });
    }

    logger.error(`Error al eliminar producto con ID ${req.params.id}:`, { error });
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
};
