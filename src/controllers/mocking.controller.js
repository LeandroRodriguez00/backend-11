import { faker } from '@faker-js/faker';
import CustomError from '../middlewares/customError.js';
import errorDictionary from '../config/errorDictionary.js';
import logger from '../middlewares/logger.js';

const generateMockProduct = () => {
  const title = faker.commerce.productName();
  const price = faker.commerce.price();

  if (!title || !price) {
    throw new CustomError({
      message: 'Error al generar producto mockeado. Faltan campos obligatorios.',
      type: 'MockingError',
      status: 500,
    });
  }

  return {
    _id: faker.string.uuid(),
    title,
    description: faker.commerce.productDescription(),
    price,
    thumbnail: faker.image.url(),
    code: faker.string.alphanumeric(8),
    stock: faker.number.int({ min: 0, max: 100 }),
    category: faker.commerce.department(),
    available: faker.datatype.boolean(),
  };
};

export const getMockProducts = (req, res) => {
  try {
    const products = [];

    for (let i = 0; i < 100; i++) {
      products.push(generateMockProduct());
    }

    res.status(200).json(products);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message });
    }
    logger.error('Error al generar productos mockeados:', { error });
    res.status(500).json({ message: 'Error en el servidor al generar productos mockeados.' });
  }
};
