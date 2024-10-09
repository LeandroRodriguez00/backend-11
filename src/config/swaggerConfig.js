import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Productos y Carrito',
      version: '1.1.0',
      description: 'Documentación de la API de productos y carrito con Swagger',
    },
    servers: [
      {
        url: 'http://localhost:8080',
      },
    ],
    components: {
      schemas: {
        Cart: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID del carrito',
            },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: {
                    type: 'string',
                    description: 'ID del producto',
                  },
                  quantity: {
                    type: 'integer',
                    description: 'Cantidad del producto',
                  },
                },
              },
            },
          },
          example: {
            id: '60d21b4667d0d8992e610c99',
            products: [
              {
                productId: '60d21b4667d0d8992e610c85',
                quantity: 2,
              },
            ],
          },
        },
        Product: {
          type: 'object',
          required: ['title', 'price', 'description', 'stock'],
          properties: {
            id: {
              type: 'string',
              description: 'ID del producto',
            },
            title: {
              type: 'string',
              description: 'Nombre del producto',
            },
            price: {
              type: 'number',
              description: 'Precio del producto',
            },
            description: {
              type: 'string',
              description: 'Descripción del producto',
            },
            stock: {
              type: 'integer',
              description: 'Cantidad en stock',
            },
            owner: {
              type: 'string',
              description: 'Correo electrónico del propietario (si es premium)',
            },
          },
          example: {
            id: '60d21b4667d0d8992e610c85',
            title: 'Producto ejemplo',
            price: 100,
            description: 'Este es un producto de ejemplo',
            stock: 20,
            owner: 'premium@correo.com',
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './dao/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('Swagger docs disponibles en http://localhost:8080/api-docs');
};
