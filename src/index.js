const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');
const { port, mongoUri, googleClientID, googleClientSecret, jwtSecret, sessionSecret } = require('./config/config');

// Importar modelos
const Product = require('../dao/models/Product');
const Cart = require('../dao/models/Cart');
const Message = require('../dao/models/Message');
const User = require('../dao/models/User');

// Conexión a MongoDB
mongoose.connect(mongoUri)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error al conectar a MongoDB', err));

const app = express();


app.use(session({
  secret: sessionSecret,  
  resave: false,
  saveUninitialized: false,  
  cookie: { secure: false }  
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
  clientID: googleClientID,
  clientSecret: googleClientSecret,
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


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});


function verifyJWT(req, res, next) {
  console.log("Cookies recibidas:", req.cookies);  
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
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
    if (!user) {
      return res.render('login', { error: info.message });
    }


    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, jwtSecret, {
      expiresIn: '1h'
    });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false,  
      sameSite: 'Lax',
      maxAge: 3600000  
    });

   
    console.log('JWT generado y almacenado en cookie:', token);

    return res.redirect('/api/products');  
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


app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);  
    }
    res.clearCookie('jwt');  
    res.redirect('/login');
  });
});


const productsRoutes = require('./routes/products.routes');
const cartsRoutes = require('./routes/carts.routes');
const messagesRoutes = require('./routes/messages.routes');
const usersRoutes = require('./routes/users.routes');
const sessionsRoutes = require('./routes/sessions.routes');

app.use('/api/products', verifyJWT, productsRoutes); 
app.use('/api/carts', cartsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/sessions', sessionsRoutes);

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
