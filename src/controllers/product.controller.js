const Product = require('../../dao/models/Product');


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

    const result = await Product.paginate(filter, options);

    
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
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al obtener productos');
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Product.findById(id);

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(producto);  
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).send('Error al obtener el producto');
  }
};

exports.createProduct = async (req, res) => {
  try {
    const nuevoProducto = new Product(req.body);
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productoActualizado = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (productoActualizado) {
      res.json(productoActualizado);
    } else {
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productoEliminado = await Product.findByIdAndDelete(id);
    if (productoEliminado) {
      res.json(productoEliminado);
    } else {
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).send('Error en el servidor');
  }
};
