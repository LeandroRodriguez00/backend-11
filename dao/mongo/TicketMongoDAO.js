const Ticket = require('../models/Ticket');
const CustomError = require('../../src/middlewares/customError'); 
const errorDictionary = require('../../src/config/errorDictionary'); 
const logger = require('../../src/middlewares/logger'); 

class TicketMongoDAO {

  async createTicket(ticketData) {
    try {
      const newTicket = new Ticket(ticketData);
      await newTicket.save();
      return newTicket;
    } catch (error) {
      logger.error('Error al crear el ticket:', { error });
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
      logger.error('Error al obtener el ticket:', { error });
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
      logger.error('Error al obtener los tickets:', { error });
      throw new CustomError({
        message: errorDictionary.GENERAL_ERRORS.SERVER_ERROR.message,
        type: errorDictionary.GENERAL_ERRORS.SERVER_ERROR.type,
        status: 500
      });
    }
  }
}

module.exports = new TicketMongoDAO();
