const Ticket = require('../models/Ticket'); 

class TicketMongoDAO {
  

  async createTicket(ticketData) {
    try {
      const newTicket = new Ticket(ticketData);
      await newTicket.save();
      return newTicket;
    } catch (error) {
      console.error('Error al crear el ticket:', error);
      throw error;
    }
  }


  async getTicketById(id) {
    try {
      const ticket = await Ticket.findById(id);
      return ticket;
    } catch (error) {
      console.error('Error al obtener el ticket:', error);
      throw error;
    }
  }


  async getAllTickets() {
    try {
      const tickets = await Ticket.find();
      return tickets;
    } catch (error) {
      console.error('Error al obtener los tickets:', error);
      throw error;
    }
  }
}

module.exports = new TicketMongoDAO();
