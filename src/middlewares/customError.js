import logger from './logger.js';

class CustomError extends Error {
  constructor({ message, type, status = 400 }) {
    if (!message || !type) {
      throw new Error('CustomError debe recibir un mensaje y un tipo');
    }
    super(message);
    this.name = type;
    this.status = status;

    this.logError();
  }

  logError() {
    logger.error(`${this.status} - ${this.name}: ${this.message}`);
  }
}

export default CustomError;
