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

describe('Users Router', () => {
  it('debería retornar la sesión del usuario actual', async () => {
    const res = await request(app)
      .get('/current')
      .set('Cookie', cookie);

    expect(res.status).to.equal(200);
    expect(res.body.user).to.have.property('email', '555@gmail.com');
  });

  it('debería fallar si el JWT es inválido', async () => {
    const res = await request(app)
      .get('/current')
      .set('Cookie', 'jwt=invalidtoken');

    expect(res.status).to.equal(400);
  });

  it('debería cerrar sesión y eliminar el JWT', async () => {
    const res = await request(app)
      .get('/logout')
      .set('Cookie', cookie);

    expect(res.status).to.equal(302);
  });

  it('debería registrar un nuevo usuario', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        email: 'nuevo@example.com',
        password: 'password123',
      });

    expect(res.status).to.equal(201);
  });

  it('debería fallar al registrar con un email ya existente', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        email: '555@gmail.com',
        password: '555',
      });

    expect(res.status).to.equal(400);
  });
});
