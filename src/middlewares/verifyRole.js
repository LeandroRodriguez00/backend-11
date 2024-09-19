// verifyRole.js
module.exports = (rolesPermitidos) => {
    return (req, res, next) => {
      const { role } = req.user; 
      if (!rolesPermitidos.includes(role)) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }
      next();
    };
  };
  