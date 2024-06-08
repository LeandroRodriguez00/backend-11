const express = require('express');
const { engine } = require('express-handlebars');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

// Modelos de Mongoose
const Product = require('../dao/models/Product');
const Cart = require('../dao/models/Cart');
const Message = require('../dao/models/Message');

// Cadena de conexión a MongoDB Atlas
const mongoDBUri = 'mongodb+srv://leabackend:leabackend@lea32-backend.799yt4h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

mongoose.connect(mongoDBUri)
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

// Ruta para la página de inicio
app.get('/', async (req, res) => {
    try {
        const productos = await Product.find();
        res.render('layouts/home', { productos });
    } catch (error) {
        console.error('Error al obtener productos desde MongoDB Atlas:', error);
        res.status(500).send('Error al obtener productos desde MongoDB Atlas');
    }
});

productosRouter.get('/', async (req, res) => {
    const productos = await Product.find();
    res.json(productos);
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

carritosRouter.delete('/:id', async (req, res) => {
    const carritoEliminado = await Cart.findByIdAndDelete(req.params.id);
    if (carritoEliminado) {
        res.json(carritoEliminado);
    } else {
        res.status(404).send('Carrito no encontrado');
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

// Configuración de Socket.io para el chat y productos en tiempo real
io.on('connection', (socket) => {
    console.log('Usuario conectado');

    socket.on('new-message', async (data) => {
        try {
            const message = new Message(data);
            await message.save();
            io.emit('message', data); // Emitir el mensaje a todos los clientes conectados
        } catch (error) {
            console.error('Error al guardar el mensaje:', error);
        }
    });

    socket.on('updateRequest', async () => {
        const productos = await Product.find();
        io.emit('updateProducts', productos); // Emitir la lista actualizada de productos a todos los clientes
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
