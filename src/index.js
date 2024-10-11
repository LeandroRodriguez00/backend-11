import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import logger from './middlewares/logger.js';
import CustomError from './middlewares/customError.js';
import config from './config/config.js'; 
import initializePassport from './config/passport.config.js';
import swaggerConfig from './config/swaggerConfig.js';
import productsRoutes from './routes/products.routes.js';
import cartsRoutes from './routes/carts.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import usersRoutes from './routes/users.routes.js';  
import sessionsRoutes from './routes/sessions.routes.js';
import loggerTestRoutes from './routes/loggerTest.routes.js'; 
import verifyJWT from './middlewares/verifyJWT.js';

const { port, sessionSecret, jwtSecret, mongoUri } = config; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initializePassport(passport);

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

import { engine } from 'express-handlebars';
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

swaggerConfig(app);

app.use('/products', verifyJWT, productsRoutes);
app.use('/carts', verifyJWT, cartsRoutes);
app.use('/messages', verifyJWT, messagesRoutes);
app.use('/api/users', usersRoutes);  
app.use('/sessions', sessionsRoutes);
app.use('/', loggerTestRoutes); 

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

export default app;
