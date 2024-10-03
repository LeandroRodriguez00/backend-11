const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../dao/models/User'); 
const { googleClientID, googleClientSecret, jwtSecret } = require('./config');
const CustomError = require('../middlewares/customError'); 
const errorDictionary = require('../config/errorDictionary');
const logger = require('../middlewares/logger');

module.exports = function(passport) {
  
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        logger.warn(`Usuario no encontrado: ${email}`);
        throw new CustomError(errorDictionary.USER_ERRORS.USER_NOT_FOUND);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        logger.warn(`Credenciales inválidas para el email: ${email}`);
        throw new CustomError(errorDictionary.USER_ERRORS.INVALID_CREDENTIALS);
      }

      logger.info(`Usuario autenticado con éxito: ${email}`);
      return done(null, user);
    } catch (err) {
      logger.error(`Error en la autenticación local: ${err.message}`);
      return done(err); 
    }
  }));

  const callbackURL = process.env.NODE_ENV === 'production' 
    ? 'https://el-dominio-en-produccion.com/auth/google/callback' 
    : 'http://localhost:8080/auth/google/callback';

  passport.use(new GoogleStrategy({
    clientID: googleClientID,
    clientSecret: googleClientSecret,
    callbackURL: callbackURL
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
        logger.info(`Usuario creado con éxito mediante Google OAuth: ${profile.emails[0].value}`);
      } else if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
        logger.info(`GoogleId agregado al usuario existente: ${profile.emails[0].value}`);
      }

      const jwtToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: '1h' }
      );
      return done(null, user);
    } catch (err) {
      logger.error(`Error en la autenticación con Google: ${err.message}`);
      return done(new CustomError({
        message: 'Error al autenticar con Google',
        type: 'GoogleAuthError',
        status: 500
      }));
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
      logger.error(`Error en la deserialización del usuario: ${err.message}`);
      done(err);
    }
  });
};
