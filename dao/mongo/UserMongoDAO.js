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
}

export default new UserMongoDAO();
