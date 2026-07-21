const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  mesa: {
    type: String,
    required: true
  },
  platos: {
    type: [String],
    required: true
  },
  mozo: {
    type: String, // username del mozo que creo el pedido
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'en_preparacion', 'listo'],
    default: 'pendiente'
  }
}, { timestamps: true });

module.exports = mongoose.model('Pedido', pedidoSchema);
