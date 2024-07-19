const express = require('express');
const { engine } = require('express-handlebars');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const Product = require('../dao/models/Product');
const Cart = require('../dao/models/Cart');
const Message = require('../dao/models/Message');
const User = require('../dao/models/User'); 

const mongoDBUri = 'mongodb+srv://leabackend:leabackend@lea32-backend.799yt4h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

mongoose.connect(mongoDBUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error al conectar a MongoDB', err));

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 8080;

app.engine('handlebars', engine({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
 
    if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
      const adminUser = { id: 'admin', email: 'adminCoder@coder.com', role: 'admin' };
      return done(null, adminUser);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return done(null, false, { message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  if (id === 'admin') {
    const adminUser = { id: 'admin', email: 'adminCoder@coder.com', role: 'admin' };
    return done(null, adminUser);
  }
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login');
  });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/products',
  failureRedirect: '/login'
}));

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ email, password: hashedPassword, role: 'user' });
  await newUser.save();
  res.redirect('/login');
});

app.get('/products', ensureAuthenticated, async (req, res) => {
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
      nextLink: result.hasNextPage ? `/products?limit=${limit}&page=${result.page + 1}&sort=${sort}&query=${query}` : null,
      user: req.user
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al obtener productos');
  }
});

const productosRouter = express.Router();

productosRouter.get('/', ensureAuthenticated, async (req, res) => {
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

productosRouter.get('/:id', ensureAuthenticated, async (req, res) => {
  const producto = await Product.findById(req.params.id);
  if (producto) {
    res.json(producto);
  } else {
    res.status(404).send('Producto no encontrado');
  }
});

productosRouter.post('/', ensureAuthenticated, async (req, res) => {
  const nuevoProducto = new Product(req.body);
  await nuevoProducto.save();
  res.status(201).json(nuevoProducto);
});

productosRouter.put('/:id', ensureAuthenticated, async (req, res) => {
  const productoActualizado = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (productoActualizado) {
    res.json(productoActualizado);
  } else {
    res.status(404).send('Producto no encontrado');
  }
});

productosRouter.delete('/:id', ensureAuthenticated, async (req, res) => {
  const productoEliminado = await Product.findByIdAndDelete(req.params.id);
  if (productoEliminado) {
    res.json(productoEliminado);
  } else {
    res.status(404).send('Producto no encontrado');
  }
});

app.use('/api/products', productosRouter);

const carritosRouter = express.Router();

carritosRouter.post('/', ensureAuthenticated, async (req, res) => {
  const nuevoCarrito = new Cart({ products: [] });
  await nuevoCarrito.save();
  res.status(201).json(nuevoCarrito);
});

carritosRouter.get('/:id', ensureAuthenticated, async (req, res) => {
  const carrito = await Cart.findById(req.params.id).populate('products.product');
  if (carrito) {
    res.json(carrito);
  } else {
    res.status(404).send('Carrito no encontrado');
  }
});

carritosRouter.post('/:id/productos', ensureAuthenticated, async (req, res) => {
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

carritosRouter.delete('/:cid/products/:pid', ensureAuthenticated, async (req, res) => {
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

carritosRouter.put('/:cid', ensureAuthenticated, async (req, res) => {
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

carritosRouter.put('/:cid/products/:pid', ensureAuthenticated, async (req, res) => {
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

carritosRouter.delete('/:cid', ensureAuthenticated, async (req, res) => {
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

const mensajesRouter = express.Router();

mensajesRouter.post('/', ensureAuthenticated, async (req, res) => {
  const nuevoMensaje = new Message(req.body);
  await nuevoMensaje.save();
  res.status(201).json(nuevoMensaje);
});

mensajesRouter.get('/', ensureAuthenticated, async (req, res) => {
  const mensajes = await Message.find();
  res.json(mensajes);
});

app.use('/api/messages', mensajesRouter);

app.get('/chat', ensureAuthenticated, (req, res) => {
  res.render('chat');
});

app.get('/realtimeproducts', ensureAuthenticated, async (req, res) => {
  try {
    const productos = await Product.find();
    res.render('realTimeProducts', { productos });
  } catch (error) {
    console.error('Error al obtener productos desde MongoDB Atlas:', error);
    res.status(500).send('Error al obtener productos desde MongoDB Atlas');
  }
});

app.get('/products', ensureAuthenticated, async (req, res) => {
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
      nextLink: result.hasNextPage ? `/products?limit=${limit}&page=${result.page + 1}&sort=${sort}&query=${query}` : null,
      user: req.user
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al obtener productos');
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
