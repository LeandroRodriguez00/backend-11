const express = require('express');
const passport = require('passport');
const router = express.Router();
const { registerUser, loginUser, logoutUser } = require('../controllers/user.controller');
const verifyJWT = require('../middlewares/verifyJWT');
const UserDTO = require('../../dto/UserDTO');





router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);


router.get('/current', verifyJWT, (req, res) => {
 
  const userDTO = new UserDTO(req.user);
  res.json({
    message: 'Acceso autorizado',
    user: userDTO
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
