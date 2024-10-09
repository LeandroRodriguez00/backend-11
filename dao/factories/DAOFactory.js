import ProductMongoDAO from '../mongo/ProductMongoDAO.js';
import UserMongoDAO from '../mongo/UserMongoDAO.js';
import CartMongoDAO from '../mongo/CartMongoDAO.js';
import MessageMongoDAO from '../mongo/MessageMongoDAO.js';

class DAOFactory {
  static getDAO(entity) {
    switch (entity) {
      case 'Product':
        return ProductMongoDAO;
      case 'User':
        return UserMongoDAO;
      case 'Cart':
        return CartMongoDAO;
      case 'Message':
        return MessageMongoDAO;
      default:
        throw new Error('DAO not found');
    }
  }
}

export default DAOFactory;
