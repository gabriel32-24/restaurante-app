const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['mozo', 'cocinero'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);
