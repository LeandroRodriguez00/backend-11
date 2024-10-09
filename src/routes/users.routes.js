import express from 'express';
import passport from 'passport';
import { registerUser, loginUser, logoutUser, forgotPassword, resetPassword } from '../controllers/user.controller.js';
import verifyJWT from '../middlewares/verifyJWT.js';
import UserDTO from '../../dto/UserDTO.js';
import logger from '../middlewares/logger.js';

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res, next) => {
  registerUser(req, res, next);
});

router.post('/login', (req, res, next) => {
  loginUser(req, res, next);
});

router.get('/logout', (req, res) => {
  logoutUser(req, res);
});

router.get('/current', verifyJWT, (req, res) => {
  const userDTO = new UserDTO(req.user);
  res.json({
    message: 'Acceso autorizado',
    user: userDTO,
  });
});

router.get('/auth/google', (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/products');
  }
);

router.post('/forgot-password', (req, res, next) => {
  forgotPassword(req, res, next);
});

router.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  res.render('resetPassword', { token });
});

router.post('/reset-password/:token', (req, res, next) => {
  const { token } = req.params;
  resetPassword(req, res, next);
});

router.get('/forgot-password', (req, res) => {
  const { expired, email } = req.query;
  res.render('forgotPassword', { expired: expired === 'true', email });
});

export default router;
