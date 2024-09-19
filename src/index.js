const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const jwt = require('jsonwebtoken');  
const { port, mongoUri, sessionSecret, jwtSecret } = require('./config/config'); 


require('./config/passport.config')(passport); 


mongoose.connect(mongoUri)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error al conectar a MongoDB', err));

const app = express();


app.use(session({
  secret: sessionSecret,  
  resave: false,
  saveUninitialized: false,  
  cookie: { secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' }
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
    
   
    res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

  
    res.redirect('/products');
  }
);


const productsRoutes = require('./routes/products.routes');
const cartsRoutes = require('./routes/carts.routes');
const messagesRoutes = require('./routes/messages.routes');
const usersRoutes = require('./routes/users.routes');
const sessionsRoutes = require('./routes/sessions.routes');
const verifyJWT = require('./middlewares/verifyJWT'); 


app.use('/products', verifyJWT, productsRoutes);  
app.use('/carts', cartsRoutes);
app.use('/messages', messagesRoutes);
app.use('/', usersRoutes);
app.use('/sessions', sessionsRoutes);


app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
