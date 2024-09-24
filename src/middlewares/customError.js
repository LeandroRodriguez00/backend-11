class CustomError extends Error {
  constructor({ message, type, status = 400 }) {
    super(message);
    this.name = type;
    this.status = status; // Código de estado HTTP
  }

  logError() {
    console.error(`Error: ${this.name} - ${this.message}`);
  }
}

module.exports = CustomError;
