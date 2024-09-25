const mongoose = require('mongoose');
const { Schema } = mongoose;

const ticketSchema = new Schema({
  code: { type: String, required: true, unique: true }, 
  purchase_datetime: { type: Date, default: Date.now }, 
  amount: { type: Number, required: true }, 
  purchaser: { type: String, required: true }
});

module.exports = mongoose.model('Ticket', ticketSchema);