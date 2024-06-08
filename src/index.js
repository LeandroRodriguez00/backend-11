const express = require('express');
const { engine } = require('express-handlebars');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const Product = require('../dao/models/Product');
const Cart = require('../dao/models/Cart');
const Message = require('../dao/models/Message');

const mongoDBUri = 'mongodb+srv://leabackend:leabackend@lea32-backend.799yt4h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error al conectar a MongoDB', err));

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 8080;

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Rutas para Productos
const productosRouter = express.Router();

productosRouter.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

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

        const response = {
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.hasPrevPage ? result.page - 1 : null,
            nextPage: result.hasNextPage ? result.page + 1 : null,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/api/products?limit=${limit}&page=${result.page - 1}&sort=${sort}&query=${query}` : null,
            nextLink: result.hasNextPage ? `/api/products?limit=${limit}&page=${result.page + 1}&sort=${sort}&query=${query}` : null
        };

        res.json(response);
    } catch (error) {
        console.error('Error al obtener productos desde MongoDB Atlas:', error);
        res.status(500).send({ status: 'error', message: 'Error al obtener productos desde MongoDB Atlas', error: error.message });
    }
});

productosRouter.get('/:id', async (req, res) => {
    const producto = await Product.findById(req.params.id);
    if (producto) {
        res.json(producto);
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

productosRouter.post('/', async (req, res) => {
    const nuevoProducto = new Product(req.body);
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
});

productosRouter.put('/:id', async (req, res) => {
    const productoActualizado = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (productoActualizado) {
        res.json(productoActualizado);
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

productosRouter.delete('/:id', async (req, res) => {
    const productoEliminado = await Product.findByIdAndDelete(req.params.id);
    if (productoEliminado) {
        res.json(productoEliminado);
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

app.use('/api/products', productosRouter);

// Rutas para Carritos
const carritosRouter = express.Router();

carritosRouter.post('/', async (req, res) => {
    const nuevoCarrito = new Cart({ products: [] });
    await nuevoCarrito.save();
    res.status(201).json(nuevoCarrito);
});

carritosRouter.get('/:id', async (req, res) => {
    const carrito = await Cart.findById(req.params.id).populate('products.product');
    if (carrito) {
        res.json(carrito);
    } else {
        res.status(404).send('Carrito no encontrado');
    }
});

carritosRouter.post('/:id/productos', async (req, res) => {
    const carrito = await Cart.findById(req.params.id);
    if (!carrito) {
        return res.status(404).send('Carrito no encontrado');
    }
    const producto = await Product.findById(req.body.productId);
    if (!producto) {
        return res.status(404).send('Producto no encontrado');
    }
    const existingProductIndex = carrito.products.findIndex(item => item.product.toString() === req.body.productId);
    if (existingProductIndex >= 0) {
        carrito.products[existingProductIndex].quantity += req.body.quantity;
    } else {
        carrito.products.push({ product: req.body.productId, quantity: req.body.quantity });
    }
    await carrito.save();
    res.json(carrito);
});

carritosRouter.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const carrito = await Cart.findById(cid);
        if (!carrito) {
            return res.status(404).send('Carrito no encontrado');
        }

        const productIndex = carrito.products.findIndex(item => item.product.toString() === pid);
        if (productIndex >= 0) {
            carrito.products.splice(productIndex, 1);
            await carrito.save();
            return res.status(204).send();
        } else {
            return res.status(404).send('Producto no encontrado en el carrito');
        }
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        res.status(500).send('Error al eliminar producto del carrito');
    }
});

carritosRouter.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;

        const carrito = await Cart.findById(cid);
        if (!carrito) {
            return res.status(404).send('Carrito no encontrado');
        }

        carrito.products = products;
        await carrito.save();
        res.json(carrito);
    } catch (error) {
        console.error('Error al actualizar carrito:', error);
        res.status(500).send('Error al actualizar carrito');
    }
});

carritosRouter.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        const carrito = await Cart.findById(cid);
        if (!carrito) {
            return res.status(404).send('Carrito no encontrado');
        }

        const productIndex = carrito.products.findIndex(item => item.product.toString() === pid);
        if (productIndex >= 0) {
            carrito.products[productIndex].quantity = quantity;
            await carrito.save();
            res.json(carrito);
        } else {
            res.status(404).send('Producto no encontrado en el carrito');
        }
    } catch (error) {
        console.error('Error al actualizar cantidad del producto en el carrito:', error);
        res.status(500).send('Error al actualizar cantidad del producto en el carrito');
    }
});

carritosRouter.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        const carrito = await Cart.findById(cid);
        if (!carrito) {
            return res.status(404).send('Carrito no encontrado');
        }

        carrito.products = [];
        await carrito.save();
        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar productos del carrito:', error);
        res.status(500).send('Error al eliminar productos del carrito');
    }
});

app.use('/api/carts', carritosRouter);

// Rutas para Mensajes
const mensajesRouter = express.Router();

mensajesRouter.post('/', async (req, res) => {
    const nuevoMensaje = new Message(req.body);
    await nuevoMensaje.save();
    res.status(201).json(nuevoMensaje);
});

mensajesRouter.get('/', async (req, res) => {
    const mensajes = await Message.find();
    res.json(mensajes);
});

app.use('/api/messages', mensajesRouter);

// Ruta para el chat
app.get('/chat', (req, res) => {
    res.render('chat');
});

// Ruta para productos en tiempo real
app.get('/realtimeproducts', async (req, res) => {
    try {
        const productos = await Product.find();
        res.render('realTimeProducts', { productos });
    } catch (error) {
        console.error('Error al obtener productos desde MongoDB Atlas:', error);
        res.status(500).send('Error al obtener productos desde MongoDB Atlas');
    }
});

app.get('/products', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

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

        res.render('products', {
            productos: result.docs,
            totalPages: result.totalPages,
            prevPage: result.hasPrevPage ? result.page - 1 : null,
            nextPage: result.hasNextPage ? result.page + 1 : null,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/products?limit=${limit}&page=${result.page - 1}&sort=${sort}&query=${query}` : null,
            nextLink: result.hasNextPage ? `/products?limit=${limit}&page=${result.page + 1}&sort=${sort}&query=${query}` : null
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos');
    }
});

app.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const carrito = await Cart.findById(cid).populate('products.product');
        if (!carrito) {
            return res.status(404).send('Carrito no encontrado');
        }

        res.render('cart', { carrito });
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        res.status(500).send('Error al obtener carrito');
    }
});

io.on('connection', (socket) => {
    console.log('Usuario conectado');

    socket.on('new-message', async (data) => {
        try {
            const message = new Message(data);
            await message.save();
            io.emit('message', data); 
        } catch (error) {
            console.error('Error al guardar el mensaje:', error);
        }
    });

    socket.on('updateRequest', async () => {
        const productos = await Product.find();
        io.emit('updateProducts', productos); 
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
