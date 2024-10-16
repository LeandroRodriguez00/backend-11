import User from '../models/User.js';
import mongoose from 'mongoose';  

class UserMongoDAO {
  async getUserByEmail(email) {
    return await User.findOne({ email });
  }

  async getUserById(id) {
 
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid User ID: ${id}`);  
      throw new Error('Invalid User ID');
    }

    try {
      const user = await User.findById(id);
      if (!user) {
        console.warn(`No se encontró el usuario con el ID: ${id}`); 
      }
      return user;
    } catch (error) {
      console.error(`Error al buscar el usuario con ID ${id}: ${error.message}`);
      throw new Error('Error al buscar el usuario por ID');
    }
  }

  async createUser(userData) {
    const newUser = new User(userData);
    return await newUser.save();
  }

  async updateUser(id, userData) {
    return await User.findByIdAndUpdate(id, userData, { new: true });
  }

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }

  async updateUserRole(id, newRole) {
    return await User.findByIdAndUpdate(id, { role: newRole }, { new: true });
  }

  async getAllUsers() {
    return await User.find({}, 'first_name last_name email role'); 
  }

  async getInactiveUsers() {
    const cutoffDate = new Date(Date.now() - 30 * 60 * 1000); 
    return await User.find({ last_connection: { $lt: cutoffDate } });
  }
}

export default new UserMongoDAO();
