const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: function() { return !this.googleId; }},
  last_name: { type: String, required: function() { return !this.googleId; }},
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: function() { return !this.googleId; }},
  password: { type: String, required: function() { return !this.googleId; }},
  googleId: { type: String, default: null },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  role: { type: String, enum: ['user', 'admin', 'premium'], default: 'user' } 
});

module.exports = mongoose.model('User', userSchema);
