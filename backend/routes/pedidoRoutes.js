const express = require('express');
const router = express.Router();
const { crearPedido, listarPedidos, actualizarEstado } = require('../controllers/pedidoController');

router.post('/', crearPedido);
router.get('/', listarPedidos);
router.put('/:id/estado', actualizarEstado);

module.exports = router;
