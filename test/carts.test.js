import request from 'supertest';
import app from '../src/index.js';
import { before } from 'mocha';

let cookie;

before(async () => {
  const res = await request(app)
    .post('/login')
    .send({
      email: '555@gmail.com',
      password: '555',
    });

  console.log('Login response cookies:', res.headers['set-cookie']);
  if (res.headers['set-cookie']) {
    cookie = res.headers['set-cookie'];
    console.log('Cookie:', cookie);
  } else {
    throw new Error("No se pudo obtener la cookie después del inicio de sesión.");
  }
});

describe('Carts Router', () => {
  it('debería crear un nuevo carrito', async () => {
    const res = await request(app)
      .post('/carts')
      .set('Cookie', cookie);

    expect(res.status).to.equal(201);
  });

  it('debería agregar un producto al carrito', async () => {

    const res = await request(app)
      .post('/carts/add-product')
      .set('Cookie', cookie)
      .send({ productId: 'VALID_PRODUCT_ID' });

    expect(res.status).to.equal(200);
  });

  it('debería fallar al agregar un producto si el producto no existe', async () => {
    const res = await request(app)
      .post('/carts/add-product')
      .set('Cookie', cookie)
      .send({ productId: 'invalidProductId' });

    expect(res.status).to.equal(404);
  });
});
