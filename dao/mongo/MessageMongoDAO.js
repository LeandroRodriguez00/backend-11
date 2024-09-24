const Message = require('../models/Message'); 

class MessageMongoDAO {
  async getAllMessages() {
    return await Message.find();
  }

  async createMessage(messageData) {
    const newMessage = new Message(messageData);
    return await newMessage.save();
  }
}

module.exports = new MessageMongoDAO();
