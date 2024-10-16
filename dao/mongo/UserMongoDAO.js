import User from '../models/User.js';

class UserMongoDAO {
  async getUserByEmail(email) {
    return await User.findOne({ email });
  }

  async getUserById(id) {
    return await User.findById(id);
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
