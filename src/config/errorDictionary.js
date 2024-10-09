export default {
  PRODUCT_ERRORS: {
    MISSING_TITLE: {
      message: 'El título es un campo requerido.',
      type: 'MissingFieldError',
    },
    MISSING_PRICE: {
      message: 'El precio es un campo requerido.',
      type: 'MissingFieldError',
    },
    INVALID_PRICE: {
      message: 'El precio debe ser un número válido.',
      type: 'ValidationError',
    },
    PRODUCT_NOT_FOUND: {
      message: 'Producto no encontrado.',
      type: 'NotFoundError',
    },
    PRODUCT_CREATION_FAILED: {
      message: 'Error al crear el producto.',
      type: 'ServerError',
    },
    PRODUCT_UPDATE_FAILED: {
      message: 'Error al actualizar el producto.',
      type: 'ServerError',
    },
    PRODUCT_DELETE_FAILED: {
      message: 'Error al eliminar el producto.',
      type: 'ServerError',
    },
  },

  CART_ERRORS: {
    CART_NOT_FOUND: {
      message: 'Carrito no encontrado.',
      type: 'NotFoundError',
    },
    PRODUCT_NOT_FOUND_IN_CART: {
      message: 'Producto no encontrado en el carrito.',
      type: 'NotFoundError',
    },
    INSUFFICIENT_STOCK: {
      message: 'Stock insuficiente para el producto solicitado.',
      type: 'StockError',
    },
    CART_CREATION_FAILED: {
      message: 'Error al crear el carrito.',
      type: 'ServerError',
    },
    PRODUCT_ADDITION_FAILED: {
      message: 'Error al agregar el producto al carrito.',
      type: 'ServerError',
    },
    PRODUCT_REMOVAL_FAILED: {
      message: 'Error al eliminar el producto del carrito.',
      type: 'ServerError',
    },
    CART_PURCHASE_FAILED: {
      message: 'Error al procesar la compra.',
      type: 'ServerError',
    },
  },

  USER_ERRORS: {
    MISSING_FIELDS: {
      message: 'Todos los campos son obligatorios.',
      type: 'MissingFieldError',
    },
    EMAIL_ALREADY_REGISTERED: {
      message: 'El correo electrónico ya está registrado.',
      type: 'ValidationError',
    },
    INVALID_CREDENTIALS: {
      message: 'Credenciales inválidas. Intenta nuevamente.',
      type: 'AuthenticationError',
    },
    USER_NOT_FOUND: {
      message: 'Usuario no encontrado.',
      type: 'NotFoundError',
    },
    USER_CREATION_FAILED: {
      message: 'Error al registrar el usuario.',
      type: 'ServerError',
    },
    USER_UPDATE_FAILED: {
      message: 'Error al actualizar el usuario.',
      type: 'ServerError',
    },
    USER_DELETE_FAILED: {
      message: 'Error al eliminar el usuario.',
      type: 'ServerError',
    },
  },

  AUTH_ERRORS: {
    TOKEN_EXPIRED: {
      message: 'El token ha expirado.',
      type: 'AuthenticationError',
    },
    TOKEN_INVALID: {
      message: 'Token inválido o no proporcionado.',
      type: 'AuthenticationError',
    },
    ROLE_UNAUTHORIZED: {
      message: 'No tienes permisos para realizar esta acción.',
      type: 'AuthorizationError',
    },
  },

  MESSAGE_ERRORS: {
    MESSAGE_CREATION_FAILED: {
      message: 'Error al crear el mensaje.',
      type: 'ServerError',
    },
    MESSAGE_NOT_FOUND: {
      message: 'Mensaje no encontrado.',
      type: 'NotFoundError',
    },
    MESSAGE_RETRIEVAL_FAILED: {
      message: 'Error al obtener los mensajes.',
      type: 'ServerError',
    },
  },

  GENERAL_ERRORS: {
    VALIDATION_ERROR: {
      message: 'Error de validación.',
      type: 'ValidationError',
    },
    SERVER_ERROR: {
      message: 'Error en el servidor. Intenta nuevamente más tarde.',
      type: 'ServerError',
    },
    BAD_REQUEST: {
      message: 'Solicitud incorrecta. Revisa los datos enviados.',
      type: 'BadRequestError',
    },
    NOT_FOUND: {
      message: 'Recurso no encontrado.',
      type: 'NotFoundError',
    },
  },
};
