const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0', 
    info: {
      title: 'API de Productos y Carrito', 
      version: '1.0.0', 
      description: 'Documentación de la API de productos y carrito con Swagger', 
    },
    servers: [
      {
        url: 'http://localhost:8080',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('Swagger docs disponibles en http://localhost:8080/api-docs');
};
