const ProductDao = require('../../dao/mongo/ProductMongoDAO');
const CustomError = require('../middlewares/customError'); 
const errorDictionary = require('../config/errorDictionary');
const logger = require('../middlewares/logger'); 

exports.getAllProducts = async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query, format } = req.query;

    let filter = {};
    if (query) {
      filter = {
        $or: [
          { category: { $regex: query, $options: 'i' } },
          { available: query.toLowerCase() === 'true' ? true : false }
        ]
      };
    }

    let sortOption = {};
    if (sort) {
      sortOption.price = sort.toLowerCase() === 'asc' ? 1 : -1;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: sortOption
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
      user: req.user
    });
  } catch (error) {
    logger.error('Error al obtener productos:', { error }); 
    res.status(500).send('Error al obtener productos');
  }
};

exports.getProductById = async (req, res) => {
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

exports.createProduct = async (req, res) => {
  try {
    const { title, price } = req.body;
    
    if (!title) {
      throw new CustomError(errorDictionary.PRODUCT_ERRORS.MISSING_TITLE);
    }
    if (!price) {
      throw new CustomError(errorDictionary.PRODUCT_ERRORS.MISSING_PRICE);
    }

    const nuevoProducto = await ProductDao.createProduct(req.body);
    res.status(201).json(nuevoProducto);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message });
    }
    logger.error('Error al crear producto:', { error }); 
    res.status(500).send('Error en el servidor');
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productoActualizado = await ProductDao.updateProduct(id, req.body);
    if (!productoActualizado) {
      throw new CustomError(errorDictionary.PRODUCT_ERRORS.PRODUCT_NOT_FOUND);
    }
    res.json(productoActualizado);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message });
    }
    logger.error(`Error al actualizar producto con ID ${id}:`, { error }); 
    res.status(500).send('Error en el servidor');
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productoEliminado = await ProductDao.deleteProduct(id);
    if (!productoEliminado) {
      throw new CustomError(errorDictionary.PRODUCT_ERRORS.PRODUCT_NOT_FOUND);
    }
    res.json(productoEliminado);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message });
    }
    logger.error(`Error al eliminar producto con ID ${id}:`, { error }); 
    res.status(500).send('Error en el servidor');
  }
};
