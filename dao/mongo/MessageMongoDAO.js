import Message from '../models/Message.js';

class MessageMongoDAO {
  async getAllMessages() {
    return await Message.find();
  }

  async createMessage(messageData) {
    const newMessage = new Message(messageData);
    return await newMessage.save();
  }
}

export default new MessageMongoDAO();
