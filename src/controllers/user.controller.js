const User = require('../../dao/models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { jwtSecret } = require('../config/config');


exports.registerUser = async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;


  if (!first_name || !last_name || !email || !age || !password) {
    return res.render('register', { error: 'Todos los campos son obligatorios.' });
  }

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


    console.log('JWT generado:', token);

    return res.json({ message: 'Login exitoso', token });
  })(req, res, next);
};

exports.logoutUser = (req, res) => {
  res.clearCookie('jwt'); 
  res.redirect('/login');
};

exports.googleCallback = passport.authenticate('google', {
  failureRedirect: '/login',
  successRedirect: '/products'
});
