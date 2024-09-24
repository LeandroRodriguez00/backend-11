const UserDao = require('../../dao/mongo/UserMongoDAO'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { jwtSecret } = require('../config/config');
const CustomError = require('../middlewares/customError'); 
const errorDictionary = require('../config/errorDictionary'); 

const userDTO = (user) => ({
  id: user._id,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  role: user.role,
});

exports.registerUser = async (req, res, next) => {
  const { first_name, last_name, email, age, password } = req.body;


  if (!first_name || !last_name || !email || !age || !password) {
    return next(new CustomError(errorDictionary.USER_ERRORS.MISSING_FIELDS));
  }

  try {
    const existingUser = await UserDao.getUserByEmail(email);
    if (existingUser) {
      return next(new CustomError(errorDictionary.USER_ERRORS.EMAIL_ALREADY_REGISTERED));
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
  } catch (error) {

    next(error);
  }
};

exports.loginUser = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new CustomError(errorDictionary.USER_ERRORS.INVALID_CREDENTIALS));
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

exports.getCurrentUser = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return next(new CustomError(errorDictionary.AUTH_ERRORS.TOKEN_INVALID));
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await UserDao.getUserById(decoded.id);
    if (!user) {
      return next(new CustomError(errorDictionary.USER_ERRORS.USER_NOT_FOUND));
    }
    res.json(userDTO(user));
  } catch (error) {

    next(error);
  }
};

exports.googleCallback = passport.authenticate('google', {
  failureRedirect: '/login',
  successRedirect: '/products'
});
