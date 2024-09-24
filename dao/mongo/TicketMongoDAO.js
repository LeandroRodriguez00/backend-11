const Ticket = require('../models/Ticket');
const CustomError = require('../../src/middlewares/customError'); // Asegúrate de que esta ruta sea correcta
const errorDictionary = require('../../src/config/errorDictionary'); // Asegúrate de que esta ruta sea correcta

class TicketMongoDAO {

  async createTicket(ticketData) {
    try {
      const newTicket = new Ticket(ticketData);
      await newTicket.save();
      return newTicket;
    } catch (error) {
      console.error('Error al crear el ticket:', error);
      throw new CustomError({
        message: errorDictionary.GENERAL_ERRORS.SERVER_ERROR.message,
        type: errorDictionary.GENERAL_ERRORS.SERVER_ERROR.type,
        status: 500
      });
    }
  }

  async getTicketById(id) {
    try {
      const ticket = await Ticket.findById(id);
      if (!ticket) {
        throw new CustomError({
          message: errorDictionary.GENERAL_ERRORS.NOT_FOUND.message,
          type: errorDictionary.GENERAL_ERRORS.NOT_FOUND.type,
          status: 404
        });
      }
      return ticket;
    } catch (error) {
      console.error('Error al obtener el ticket:', error);
      throw new CustomError({
        message: errorDictionary.GENERAL_ERRORS.SERVER_ERROR.message,
        type: errorDictionary.GENERAL_ERRORS.SERVER_ERROR.type,
        status: 500
      });
    }
  }

  async getAllTickets() {
    try {
      const tickets = await Ticket.find();
      return tickets;
    } catch (error) {
      console.error('Error al obtener los tickets:', error);
      throw new CustomError({
        message: errorDictionary.GENERAL_ERRORS.SERVER_ERROR.message,
        type: errorDictionary.GENERAL_ERRORS.SERVER_ERROR.type,
        status: 500
      });
    }
  }
}

module.exports = new TicketMongoDAO();
