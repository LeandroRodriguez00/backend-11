import * as chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/index.js';

chai.use(chaiHttp);
const { expect } = chai;

describe('User Router', () => {
  let token;
  let userId;

  it('Debe registrar un usuario nuevo', (done) => {
    chai.request(app)
      .post('/register')
      .send({
        first_name: 'Test',
        last_name: 'User',
        email: 'testuser@example.com',
        age: 25,
        password: '123456'
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('Debe iniciar sesión y generar un token', (done) => {
    chai.request(app)
      .post('/login')
      .send({ email: 'testuser@example.com', password: '123456' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.headers).to.have.property('set-cookie');
        token = res.headers['set-cookie'][0].split(';')[0].split('=')[1]; 
        done();
      });
  });

  it('Debe obtener el usuario actual', (done) => {
    chai.request(app)
      .get('/users/current')
      .set('Cookie', `jwt=${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('user');
        userId = res.body.user.id; 
        done();
      });
  });

  it('Debe actualizar el usuario actual', (done) => {
    chai.request(app)
      .put(`/users/${userId}`)
      .set('Cookie', `jwt=${token}`)
      .send({ first_name: 'Updated' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('first_name').eql('Updated');
        done();
      });
  });

  it('Debe eliminar el usuario', (done) => {
    chai.request(app)
      .delete(`/users/${userId}`)
      .set('Cookie', `jwt=${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message').eql('Usuario eliminado');
        done();
      });
  });
});
