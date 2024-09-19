const mongoose = require('mongoose');
const { Schema } = mongoose;

const ticketSchema = new Schema({
  code: { type: String, required: true, unique: true }, // Código único para el ticket
  purchase_datetime: { type: Date, default: Date.now }, // Fecha y hora de la compra
  amount: { type: Number, required: true }, // Total de la compra
  purchaser: { type: String, required: true } // Correo del comprador
});

module.exports = mongoose.model('Ticket', ticketSchema);