const Message = require('../../dao/models/Message');


exports.createMessage = async (req, res) => {
  try {
    const nuevoMensaje = new Message(req.body);
    await nuevoMensaje.save();
    res.status(201).json(nuevoMensaje);
  } catch (error) {
    console.error('Error al crear mensaje:', error);
    res.status(500).send('Error en el servidor');
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const mensajes = await Message.find();
    res.json(mensajes);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).send('Error en el servidor');
  }
};
