// Importar Mongoose
const mongoose = require('mongoose');

// URI de conexión a MongoDB Atlas con la contraseña ya incluida
// Asegúrate de reemplazar <password> y cualquier otro detalle necesario
const uri = "mongodb+srv://leabackend:leabackend@lea32-backend.799yt4h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

// Establecer la conexión a MongoDB Atlas usando Mongoose
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: mongoose.ServerApiVersion.v1,
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error al conectar a MongoDB', err));

// Definición de la clase MongoDbManager
class MongoDbManager {
  constructor(model) {
    this.model = model;
  }

  async getAll() {
    return await this.model.find();
  }

  async getById(id) {
    return await this.model.findById(id);
  }

  async create(item) {
    const newItem = new this.model(item);
    return await newItem.save();
  }

  async update(id, item) {
    return await this.model.findByIdAndUpdate(id, item, { new: true });
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }
}

module.exports = MongoDbManager;
