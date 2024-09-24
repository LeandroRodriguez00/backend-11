const { faker } = require('@faker-js/faker');


const generateMockProduct = () => {
  return {
    _id: faker.string.uuid(),
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(), 
    price: faker.commerce.price(), 
    thumbnail: faker.image.url(), 
    code: faker.string.alphanumeric(8), 
    stock: faker.number.int({ min: 0, max: 100 }), 
    category: faker.commerce.department(), 
    available: faker.datatype.boolean(), 
  };
};

exports.getMockProducts = (req, res) => {
  const products = [];
  

  for (let i = 0; i < 100; i++) {
    products.push(generateMockProduct());
  }
  

  res.status(200).json(products);
};
