import mongoose from 'mongoose';
const { Schema } = mongoose;

const ticketSchema = new Schema({
  code: { type: String, required: true, unique: true },
  purchase_datetime: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  purchaser: { type: String, required: true }
});

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
