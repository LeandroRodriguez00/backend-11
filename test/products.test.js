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

describe('Products Router', () => {
  it('debería obtener todos los productos', async () => {
    const res = await request(app)
      .get('/products')
      .set('Cookie', cookie);

    expect(res.status).to.equal(200);
  });

  it('debería crear un nuevo producto', async () => {
    const res = await request(app)
      .post('/products')
      .set('Cookie', cookie)
      .send({ title: 'Nuevo Producto', price: 100, description: 'Descripción del producto' });

    expect(res.status).to.equal(201);
  });

  it('debería fallar al crear producto sin título', async () => {
    const res = await request(app)
      .post('/products')
      .set('Cookie', cookie)
      .send({ price: 100, description: 'Descripción del producto' });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal('El título es un campo requerido.');
  });
});
