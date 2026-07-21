// ----- Verificación de sesión -----
const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario || usuario.rol !== 'cocinero') {
  window.location.href = 'index.html';
}

document.getElementById('nombre-usuario').textContent = `👤 ${usuario.username}`;
document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
});

// ----- Conexión Socket.IO -----
const socket = io();
socket.on('connect', () => {
  socket.emit('join', { rol: 'cocinero', username: usuario.username });
});

// Nuevo pedido creado por un mozo -> aparece automáticamente en el dashboard
socket.on('pedido:nuevo', (pedido) => {
  document.querySelectorAll('.vacio').forEach((el) => el.remove());
  agregarTarjetaPedido(pedido);
});

// Un pedido cambió de estado (por este u otro cocinero) -> refrescamos su tarjeta
socket.on('pedido:actualizado', (pedido) => {
  actualizarTarjetaPedido(pedido);
});

// ----- Elementos del DOM -----
const listaPedidos = document.getElementById('lista-pedidos');

// ----- Cargar pedidos existentes -----
const cargarPedidos = async () => {
  try {
    const respuesta = await fetch('/api/pedidos');
    const pedidos = await respuesta.json();
    renderizarPedidos(pedidos);
  } catch (error) {
    console.error('Error al cargar pedidos:', error);
  }
};

const renderizarPedidos = (pedidos) => {
  listaPedidos.innerHTML = '';
  if (pedidos.length === 0) {
    listaPedidos.innerHTML = '<p class="vacio">No hay pedidos por el momento.</p>';
    return;
  }
  pedidos.forEach(agregarTarjetaPedido);
};

const agregarTarjetaPedido = (pedido) => {
  const yaExiste = document.getElementById(`pedido-${pedido._id}`);
  if (yaExiste) {
    actualizarTarjetaPedido(pedido);
    return;
  }
  const card = document.createElement('div');
  card.className = 'pedido-card';
  card.id = `pedido-${pedido._id}`;
  card.innerHTML = plantillaTarjeta(pedido);
  listaPedidos.prepend(card);
};

const actualizarTarjetaPedido = (pedido) => {
  const card = document.getElementById(`pedido-${pedido._id}`);
  if (card) {
    card.innerHTML = plantillaTarjeta(pedido);
  } else {
    agregarTarjetaPedido(pedido);
  }
};

const plantillaTarjeta = (pedido) => {
  const etiquetas = {
    pendiente: 'Pendiente',
    en_preparacion: 'En Preparación',
    listo: 'Listo para Servir'
  };

  let botones = '';
  if (pedido.estado === 'pendiente') {
    botones = `<button class="btn-preparar" onclick="cambiarEstado('${pedido._id}', 'en_preparacion')">Aceptar / En Preparación</button>`;
  } else if (pedido.estado === 'en_preparacion') {
    botones = `<button class="btn-listo" onclick="cambiarEstado('${pedido._id}', 'listo')">Listo para Servir</button>`;
  }

  return `
    <div class="mesa">${pedido.mesa}</div>
    <div class="platos">${pedido.platos.join(', ')}</div>
    <div class="mozo-nombre">Mozo: ${pedido.mozo}</div>
    <span class="badge badge-${pedido.estado}">${etiquetas[pedido.estado]}</span>
    <div class="acciones-cocina">${botones}</div>
  `;
};

// ----- Cambiar estado de un pedido -----
const cambiarEstado = async (id, nuevoEstado) => {
  try {
    const respuesta = await fetch(`/api/pedidos/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    });

    const pedido = await respuesta.json();

    if (!respuesta.ok) {
      alert(pedido.mensaje || 'No se pudo actualizar el pedido');
      return;
    }

    // El socket también actualizará la tarjeta, pero lo hacemos aquí para respuesta inmediata
    actualizarTarjetaPedido(pedido);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    alert('No se pudo actualizar el pedido');
  }
};

cargarPedidos();
