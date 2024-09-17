const express = require('express');
const verifyJWT = require('../middlewares/auth');
const router = express.Router();

router.get('/current', verifyJWT, (req, res) => {
  res.json({
    user: req.user
  });
});

module.exports = router;
