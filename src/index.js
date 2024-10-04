const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const logger = require('./middlewares/logger');
const CustomError = require('./middlewares/customError');
const { port, sessionSecret, jwtSecret, mongoUri } = require('./config/config');

require('./config/passport.config')(passport);

mongoose.connect(mongoUri)
  .then(() => {
    logger.info('Conectado a MongoDB Atlas');
  })
  .catch(err => {
    logger.error('Error al conectar a MongoDB: %o', err);
    process.exit(1);
  });

const app = express();

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: mongoUri }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    httpOnly: true
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

const { engine } = require('express-handlebars');
app.engine('handlebars', engine({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id, email: req.user.email }, jwtSecret, { expiresIn: '1h' });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax'
    });

    res.redirect('/products');
  }
);

const productsRoutes = require('./routes/products.routes');
const cartsRoutes = require('./routes/carts.routes');
const messagesRoutes = require('./routes/messages.routes');
const usersRoutes = require('./routes/users.routes');
const sessionsRoutes = require('./routes/sessions.routes');
const verifyJWT = require('./middlewares/verifyJWT');

const swaggerConfig = require('./config/swaggerConfig');

swaggerConfig(app); 

app.use('/products', verifyJWT, productsRoutes);
app.use('/carts', verifyJWT, cartsRoutes);
app.use('/messages', verifyJWT, messagesRoutes);
app.use('/', usersRoutes);
app.use('/sessions', sessionsRoutes);

app.use((err, req, res, next) => {
  if (err instanceof CustomError) {
    logger.error(`Error controlado: ${err.message}`, {
      type: err.name,
      status: err.status,
      stack: err.stack,
      service: 'user-service',
      timestamp: new Date().toISOString()
    });

    return res.status(err.status).json({
      message: err.message,
      type: err.name
    });
  }

  logger.error('Error no controlado:', {
    stack: err.stack,
    message: err.message,
    service: 'user-service',
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    message: 'Error interno del servidor',
    details: err.message
  });
});

app.listen(port, () => {
  logger.info(`Servidor escuchando en el puerto ${port}`);
});
