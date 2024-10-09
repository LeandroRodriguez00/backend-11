import * as chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/index.js';

chai.use(chaiHttp);
const { expect } = chai;

describe('Cart Router', () => {
  let cartId;
  let productId = '604b1a3e2313b4eeb2ef76b2'; 

  it('Debe crear un nuevo carrito', (done) => {
    chai.request(app)
      .post('/carts')
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('_id');
        cartId = res.body._id;
        done();
      });
  });

  it('Debe agregar un producto al carrito', (done) => {
    chai.request(app)
      .post(`/carts/${cartId}/products`)
      .send({ productId, quantity: 2 })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('products').with.lengthOf(1);
        expect(res.body.products[0]).to.have.property('quantity').eql(2);
        done();
      });
  });

  it('Debe eliminar el producto del carrito', (done) => {
    chai.request(app)
      .delete(`/carts/${cartId}/products/${productId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message').eql('Producto eliminado del carrito');
        done();
      });
  });
});
