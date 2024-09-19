const express = require('express');
const passport = require('passport');
const router = express.Router();
const { registerUser, loginUser, logoutUser } = require('../controllers/user.controller');
const verifyJWT = require('../middlewares/verifyJWT');


router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);


router.get('/current', verifyJWT, (req, res) => {
  res.json({
    message: 'Acceso autorizado',
    user: req.user
  });
});

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
   
    res.redirect('/products'); 
  }
);

module.exports = router;
