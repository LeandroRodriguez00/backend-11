const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser } = require('../controllers/user.controller');
const verifyJWT = require('../middlewares/auth');


router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);

router.get('/current', verifyJWT, (req, res) => {
  res.json({
    message: 'Acceso autorizado',
    user: req.user
  });
});

module.exports = router;
