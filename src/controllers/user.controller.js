const UserDao = require('../../dao/mongo/UserMongoDAO'); 

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { jwtSecret } = require('../config/config');

const userDTO = (user) => ({
  id: user._id,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  role: user.role,
});

exports.registerUser = async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;

  if (!first_name || !last_name || !email || !age || !password) {
    return res.render('register', { error: 'Todos los campos son obligatorios.' });
  }

  try {
    const existingUser = await UserDao.getUserByEmail(email);
    if (existingUser) {
      return res.render('register', { error: 'El correo electrónico ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
      role: 'user'
    };

    await UserDao.createUser(newUser);

    res.redirect('/login');
  } catch (err) {
    console.error('Error al registrar el usuario:', err);
    res.render('register', { error: 'Hubo un error al registrar el usuario. Intenta nuevamente.' });
  }
};

exports.loginUser = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Error de autenticación:', err);
      return next(err);
    }
    if (!user) {
      return res.render('login', { error: 'Credenciales inválidas. Inténtalo nuevamente.' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, jwtSecret, {
      expiresIn: '1h',
    });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false, 
      sameSite: 'Lax',
      maxAge: 3600000 
    });

    return res.redirect('/products');
  })(req, res, next);
};

exports.logoutUser = (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/login');
};


exports.getCurrentUser = (req, res) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    UserDao.getUserById(decoded.id)
      .then(user => {
        if (!user) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        return res.json(userDTO(user)); 
      })
      .catch(err => {
        console.error('Error al obtener usuario actual:', err);
        res.status(500).json({ message: 'Error al obtener usuario' });
      });
  } catch (err) {
    console.error('Error de token:', err);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

exports.googleCallback = passport.authenticate('google', {
  failureRedirect: '/login',
  successRedirect: '/products'
});
