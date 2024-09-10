const express = require('express');
const { engine } = require('express-handlebars');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const Product = require('../dao/models/Product');
const Cart = require('../dao/models/Cart');
const Message = require('../dao/models/Message');
const User = require('../dao/models/User');

const mongoDBUri = 'mongodb+srv://leabackend:leabackend@lea32-backend.799yt4h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

mongoose.connect(mongoDBUri)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error al conectar a MongoDB', err));

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 8080;


const JWT_SECRET = 'jwt_secret';


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
app.use(cookieParser());


passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return done(null, false, { message: 'Usuario no encontrado' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Contraseña incorrecta' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.use(new GoogleStrategy({
  clientID: '22751861382-q0vtl9jual80atdl7sk0ce8klkhoj5ro.apps.googleusercontent.com', 
  clientSecret: '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', 
  callbackURL: 'http://localhost:8080/auth/google/callback'
}, async (token, tokenSecret, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        role: 'user'
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = profile.id;
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));


function verifyJWT(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' });
    }
    req.user = decoded;
    next();
  });
}


app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return res.render('login', { error: info.message }); }

 
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '1h',
    });


    res.cookie('jwt', token, { httpOnly: true, secure: false });

    return res.redirect('/products');
  })(req, res, next);
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { error: 'El correo electrónico ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
      role: 'user'
    });
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.error('Error al registrar el usuario:', err);
    res.render('register', { error: 'Error al registrar el usuario.' });
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/login');
});


app.get('/products', verifyJWT, async (req, res) => {
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


const sessionRouter = express.Router();

sessionRouter.get('/current', verifyJWT, (req, res) => {
  res.json({
    user: req.user
  });
});

app.use('/api/sessions', sessionRouter);


const productosRouter = express.Router();

productosRouter.get('/', verifyJWT, async (req, res) => {
  const productos = await Product.find();
  res.json(productos);
});

productosRouter.get('/:id', verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('ID inválido');
    }

    const productId = new mongoose.Types.ObjectId(id);
    const producto = await Product.findById(productId);

    if (producto) {
      res.json(producto);
    } else {
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).send('Error en el servidor');
  }
});

productosRouter.post('/', verifyJWT, async (req, res) => {
  try {
    const nuevoProducto = new Product(req.body);
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).send('Error en el servidor');
  }
});

productosRouter.put('/:id', verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;


    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('ID inválido');
    }

    const productId = new mongoose.Types.ObjectId(id);


    const productoActualizado = await Product.findByIdAndUpdate(productId, req.body, { new: true });

    if (productoActualizado) {
      res.json(productoActualizado);
    } else {
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).send('Error en el servidor');
  }
});


productosRouter.delete('/:id', verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('ID inválido');
    }

    const productId = new mongoose.Types.ObjectId(id);
    const productoEliminado = await Product.findByIdAndDelete(productId);

    if (productoEliminado) {
      res.json(productoEliminado);
    } else {
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).send('Error en el servidor');
  }
});

app.use('/api/products', productosRouter);


const carritosRouter = express.Router();

carritosRouter.post('/', verifyJWT, async (req, res) => {
  try {
    const nuevoCarrito = new Cart({ products: [] });
    await nuevoCarrito.save();
    res.status(201).json(nuevoCarrito);
  } catch (error) {
    console.error('Error al crear carrito:', error);
    res.status(500).send('Error en el servidor');
  }
});

carritosRouter.get('/:id', verifyJWT, async (req, res) => {
  try {
    const carrito = await Cart.findById(req.params.id).populate('products.product');
    if (carrito) {
      res.json(carrito);
    } else {
      res.status(404).send('Carrito no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).send('Error en el servidor');
  }
});

carritosRouter.post('/:id/productos', verifyJWT, async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).send('Error en el servidor');
  }
});

carritosRouter.delete('/:cid/products', verifyJWT, async (req, res) => {
  try {
    const { cid } = req.params;

    const carrito = await Cart.findById(cid);
    if (!carrito) {
      return res.status(404).send('Carrito no encontrado');
    }

    carrito.products = [];
    await carrito.save();
    res.status(200).json({ message: 'Productos eliminados del carrito' });
  } catch (error) {
    console.error('Error al eliminar productos del carrito:', error);
    res.status(500).send('Error al eliminar productos del carrito');
  }
});

carritosRouter.delete('/:cid', verifyJWT, async (req, res) => {
  try {
    const { cid } = req.params;

    const carritoEliminado = await Cart.findByIdAndDelete(cid);
    if (!carritoEliminado) {
      return res.status(404).send('Carrito no encontrado');
    }

    res.status(200).json({ message: 'Carrito eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el carrito:', error);
    res.status(500).send('Error al eliminar el carrito');
  }
});

carritosRouter.put('/:cid', verifyJWT, async (req, res) => {
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


app.use('/api/carts', carritosRouter);


const mensajesRouter = express.Router();

mensajesRouter.post('/', verifyJWT, async (req, res) => {
  try {
    const nuevoMensaje = new Message(req.body);
    await nuevoMensaje.save();
    res.status(201).json(nuevoMensaje);
  } catch (error) {
    console.error('Error al crear mensaje:', error);
    res.status(500).send('Error en el servidor');
  }
});

mensajesRouter.get('/', verifyJWT, async (req, res) => {
  try {
    const mensajes = await Message.find();
    res.json(mensajes);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).send('Error en el servidor');
  }
});

app.use('/api/messages', mensajesRouter);


app.get('/chat', verifyJWT, (req, res) => {
  res.render('chat');
});

app.get('/realtimeproducts', verifyJWT, async (req, res) => {
  try {
    const productos = await Product.find();
    res.render('realTimeProducts', { productos });
  } catch (error) {
    console.error('Error al obtener productos desde MongoDB Atlas:', error);
    res.status(500).send('Error al obtener productos desde MongoDB Atlas');
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
