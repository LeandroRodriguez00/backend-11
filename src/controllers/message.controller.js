const MessageDao = require('../../dao/mongo/MessageMongoDAO'); 


exports.createMessage = async (req, res) => {
  try {
    const nuevoMensaje = {
      user: req.body.user,
      message: req.body.message,
    };
    
    const createdMessage = await MessageDao.createMessage(nuevoMensaje);
    res.status(201).json(createdMessage);
  } catch (error) {
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
