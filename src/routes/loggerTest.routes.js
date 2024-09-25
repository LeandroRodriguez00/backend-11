const express = require('express');
const router = express.Router();
const logger = require('../middlewares/logger'); 

router.get('/loggerTest', (req, res) => {
  logger.debug('Este es un mensaje de DEBUG');
  logger.http('Este es un mensaje de HTTP');
  logger.info('Este es un mensaje de INFO');
  logger.warn('Este es un mensaje de WARN');
  logger.error('Este es un mensaje de ERROR');
  logger.fatal('Este es un mensaje de FATAL');


  
  res.status(200).json({ message: 'Logs generados. Verifica la consola y los archivos.' });
});

module.exports = router;
