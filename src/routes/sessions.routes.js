const express = require('express');
const verifyJWT = require('../middlewares/verifyJWT');
const UserDTO = require('../../dto/UserDTO');




const router = express.Router();

router.get('/current', verifyJWT, (req, res) => {

  const userDTO = new UserDTO(req.user);
  res.json({
    user: userDTO
  });
});

module.exports = router;
