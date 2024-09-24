const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../../dao/models/User'); 
const { googleClientID, googleClientSecret } = require('./config');
const CustomError = require('../middlewares/customError'); 
const errorDictionary = require('../config/errorDictionary');

module.exports = function(passport) {

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
       
        throw new CustomError(errorDictionary.USER_ERRORS.USER_NOT_FOUND); 
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
      
        throw new CustomError(errorDictionary.USER_ERRORS.INVALID_CREDENTIALS); 
      }

      return done(null, user);
    } catch (err) {
      return done(err); 
    }
  }));

  passport.use(new GoogleStrategy({
    clientID: googleClientID,
    clientSecret: googleClientSecret,
    callbackURL: process.env.NODE_ENV === 'production' ? 'https://I.com/auth/google/callback' : 'http://localhost:8080/auth/google/callback'
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
      done(err); 
    }
  });
};
