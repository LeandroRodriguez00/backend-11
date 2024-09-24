const MessageDao = require('../../dao/mongo/MessageMongoDAO');
const CustomError = require('../middlewares/customError'); 
const errorDictionary = require('../config/errorDictionary'); 

exports.createMessage = async (req, res) => {
  const { user, message } = req.body;

 
  if (!user || !message) {
    throw new CustomError(errorDictionary.MESSAGE_ERRORS.MESSAGE_CREATION_FAILED);
  }

  try {
    const nuevoMensaje = { user, message };
    const createdMessage = await MessageDao.createMessage(nuevoMensaje);
    res.status(201).json(createdMessage);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('Error al crear mensaje:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const mensajes = await MessageDao.getAllMessages();
    res.json(mensajes);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).send('Error en el servidor');
  }
};
