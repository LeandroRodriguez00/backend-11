
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

function verifyJWT(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      } else {
        return res.status(401).json({ message: 'Failed to authenticate token' });
      }
    }
    req.user = decoded;
    next();
  });
}

module.exports = verifyJWT;
