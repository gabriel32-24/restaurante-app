const formLogin = document.getElementById('form-login');
const mensajeError = document.getElementById('mensaje-error');

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensajeError.textContent = '';

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const respuesta = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mensajeError.textContent = datos.mensaje || 'Error al iniciar sesión';
      return;
    }

    // Guardamos el usuario logueado en el navegador
    localStorage.setItem('usuario', JSON.stringify(datos.usuario));

    // Redirigimos según el rol
    if (datos.usuario.rol === 'mozo') {
      window.location.href = 'mozo.html';
    } else if (datos.usuario.rol === 'cocinero') {
      window.location.href = 'cocinero.html';
    } else {
      mensajeError.textContent = 'Rol de usuario desconocido';
    }
  } catch (error) {
    console.error('Error de conexión:', error);
    mensajeError.textContent = 'No se pudo conectar con el servidor';
  }
});
