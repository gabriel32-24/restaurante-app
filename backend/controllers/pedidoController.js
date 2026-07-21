const Pedido = require('../models/Pedido');

// POST /api/pedidos  -> El mozo crea un pedido nuevo
const crearPedido = async (req, res) => {
  try {
    const { mesa, platos, mozo } = req.body;

    if (!mesa || !platos || platos.length === 0 || !mozo) {
      return res.status(400).json({ mensaje: 'Mesa, mozo y al menos un plato son obligatorios' });
    }

    const nuevoPedido = new Pedido({ mesa, platos, mozo, estado: 'pendiente' });
    await nuevoPedido.save();

    // Emitimos el pedido en tiempo real a la(s) cocina(s) conectadas
    const io = req.app.get('io');
    io.to('cocina').emit('pedido:nuevo', nuevoPedido);

    res.status(201).json(nuevoPedido);
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ mensaje: 'Error al crear el pedido' });
  }
};

// GET /api/pedidos?mozo=username  -> Lista pedidos (todos o filtrados por mozo)
const listarPedidos = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.mozo) filtro.mozo = req.query.mozo;

    const pedidos = await Pedido.find(filtro).sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    console.error('Error al listar pedidos:', error);
    res.status(500).json({ mensaje: 'Error al obtener los pedidos' });
  }
};

// PUT /api/pedidos/:id/estado  -> El cocinero cambia el estado del pedido
const actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['pendiente', 'en_preparacion', 'listo'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado no válido' });
    }

    const pedido = await Pedido.findByIdAndUpdate(id, { estado }, { new: true });
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    // Notificamos en tiempo real: al mozo dueño del pedido y al resto de la cocina
    const io = req.app.get('io');
    io.to('mozos').emit('pedido:actualizado', pedido);
    io.to('cocina').emit('pedido:actualizado', pedido);

    res.json(pedido);
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el pedido' });
  }
};

module.exports = { crearPedido, listarPedidos, actualizarEstado };
