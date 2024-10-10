import supertest from 'supertest';
import app from '../src/index.js'; 
import * as chai from 'chai'; 


global.expect = chai.expect;
global.request = supertest(app); 
