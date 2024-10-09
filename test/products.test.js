import * as chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/index.js';

chai.use(chaiHttp);
const { expect } = chai;

describe('Product Router', () => {
  let productId;

  it('Debe crear un nuevo producto correctamente', (done) => {
    chai.request(app)
      .post('/products')
      .send({
        title: 'Test Product',
        description: 'Descripción de prueba',
        price: 100,
        stock: 10,
        code: 'TP123'
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('_id');
        productId = res.body._id; 
        done();
      });
  });

  it('Debe obtener un producto por ID', (done) => {
    chai.request(app)
      .get(`/products/${productId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('_id').eql(productId);
        done();
      });
  });

  it('Debe actualizar el producto correctamente', (done) => {
    chai.request(app)
      .put(`/products/${productId}`)
      .send({ price: 150 })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('price').eql(150);
        done();
      });
  });

  it('Debe eliminar el producto correctamente', (done) => {
    chai.request(app)
      .delete(`/products/${productId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message').eql('Producto eliminado');
        done();
      });
  });
});
