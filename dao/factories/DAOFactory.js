class DAOFactory {
    static getDAO(entity) {
      switch (entity) {
        case 'Product':
          return require('../mongo/ProductMongoDAO');
        case 'User':
          return require('../mongo/UserMongoDAO');
        case 'Cart':
          return require('../mongo/CartMongoDAO');
        case 'Message':
          return require('../mongo/MessageMongoDAO');
        default:
          throw new Error('DAO not found');
      }
    }
  }
  
  module.exports = DAOFactory;
  