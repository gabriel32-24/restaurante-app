// ----- Verificación de sesión -----
const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario || usuario.rol !== 'mozo') {
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
  socket.emit('join', { rol: 'mozo', username: usuario.username });
});

// Cuando el cocinero cambia el estado de un pedido, actualizamos la vista del mozo dueño
socket.on('pedido:actualizado', (pedido) => {
  if (pedido.mozo !== usuario.username) return; // solo nos interesan nuestros pedidos

  actualizarTarjetaPedido(pedido);

  if (pedido.estado === 'listo') {
    mostrarToast(`✅ ¡El pedido de ${pedido.mesa} está listo para servir!`);
  }
});

// ----- Elementos del DOM -----
const formPedido = document.getElementById('form-pedido');
const mensajePedido = document.getElementById('mensaje-pedido');
const listaPedidos = document.getElementById('lista-pedidos');

// ----- Cargar pedidos existentes del mozo -----
const cargarPedidos = async () => {
  try {
    const respuesta = await fetch(`/api/pedidos?mozo=${encodeURIComponent(usuario.username)}`);
    const pedidos = await respuesta.json();
    renderizarPedidos(pedidos);
  } catch (error) {
    console.error('Error al cargar pedidos:', error);
  }
};

const renderizarPedidos = (pedidos) => {
  listaPedidos.innerHTML = '';
  if (pedidos.length === 0) {
    listaPedidos.innerHTML = '<p class="vacio">Aún no has creado pedidos.</p>';
    return;
  }
  pedidos.forEach(agregarTarjetaPedido);
};

const agregarTarjetaPedido = (pedido) => {
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
  return `
    <div class="mesa">${pedido.mesa}</div>
    <div class="platos">${pedido.platos.join(', ')}</div>
    <span class="badge badge-${pedido.estado}">${etiquetas[pedido.estado]}</span>
  `;
};

// ----- Envío de un nuevo pedido -----
formPedido.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensajePedido.textContent = '';

  const mesa = document.getElementById('mesa').value;
  const platosSeleccionados = Array.from(
    document.querySelectorAll('input[name="plato"]:checked')
  ).map((input) => input.value);

  if (!mesa) {
    mensajePedido.textContent = 'Selecciona una mesa';
    return;
  }
  if (platosSeleccionados.length === 0) {
    mensajePedido.textContent = 'Selecciona al menos un plato';
    return;
  }

  try {
    const respuesta = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mesa, platos: platosSeleccionados, mozo: usuario.username })
    });

    const pedido = await respuesta.json();

    if (!respuesta.ok) {
      mensajePedido.textContent = pedido.mensaje || 'Error al enviar el pedido';
      return;
    }

    agregarTarjetaPedido(pedido);
    document.querySelectorAll('.vacio').forEach((el) => el.remove());
    formPedido.reset();
  } catch (error) {
    console.error('Error al enviar pedido:', error);
    mensajePedido.textContent = 'No se pudo enviar el pedido';
  }
});

// ----- Notificación tipo toast -----
let temporizadorToast;
const mostrarToast = (texto) => {
  const toast = document.getElementById('toast');
  toast.textContent = texto;
  toast.classList.remove('oculto');
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => toast.classList.add('oculto'), 4000);
};

cargarPedidos();
