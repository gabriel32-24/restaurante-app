# Restaurante — Gestión de Pedidos en Tiempo Real

Aplicación de práctica con **Node.js + Express + Socket.IO + MongoDB Atlas** para
la comunicación en tiempo real entre **Mozos** y **Cocineros**.

## Estructura

```
backend/
├── models/          Usuario.js, Pedido.js  (Mongoose)
├── routes/          authRoutes.js, pedidoRoutes.js
├── controllers/     authController.js, pedidoController.js
├── config/          db.js (conexión a MongoDB Atlas)
├── server.js        Servidor Express + Socket.IO (también sirve el frontend)
├── package.json
├── seed.js          Crea usuarios de prueba
└── frontend/
    ├── index.html   Login
    ├── mozo.html    Interfaz del Mozo
    ├── cocinero.html Interfaz del Cocinero
    ├── css/styles.css
    └── js/
        ├── login.js
        ├── mozo.js
        └── cocinero.js
```

## Instalación y ejecución

1. Entra a la carpeta `backend`:
   ```bash
   cd backend
   npm install
   ```

2. Configura tu base de datos: copia `.env.example` a `.env` y coloca tu cadena
   de conexión real de **MongoDB Atlas**:
   ```bash
   cp .env.example .env
   ```
   Edita `.env`:
   ```
   MONGO_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/restaurante
   PORT=3000
   ```

3. Crea los usuarios de prueba (mozo1, mozo2, cocinero1 — todos con contraseña `123456`):
   ```bash
   npm run seed
   ```

4. Inicia el servidor:
   ```bash
   npm start
   ```
   (o `npm run dev` si tienes `nodemon` instalado, para reinicio automático)

5. Abre el navegador en `http://localhost:3000`

## Cómo probar el tiempo real

1. Abre dos pestañas/navegadores distintos.
2. En una, inicia sesión como **mozo1 / 123456** → verás `mozo.html`.
3. En la otra, inicia sesión como **cocinero1 / 123456** → verás `cocinero.html`.
4. Desde la pestaña del mozo, selecciona una mesa y platos, y envía el pedido:
   aparecerá **instantáneamente** en el dashboard del cocinero, sin recargar.
5. En la pestaña del cocinero, marca el pedido como "Aceptar / En Preparación"
   y luego "Listo para Servir": el mozo verá el cambio de estado y una
   notificación en tiempo real, sin recargar.

## Notas técnicas

- Las contraseñas se guardan con **bcryptjs** (hash), nunca en texto plano.
- La comunicación bidireccional usa salas de Socket.IO: `mozos` y `cocina`.
- Los endpoints de creación/actualización de pedidos usan `try...catch` y,
  tras persistir en MongoDB, emiten el evento correspondiente por WebSocket.
- La sesión del usuario (mientras la app está abierta) se guarda en
  `localStorage` del navegador, de forma simple, sin JWT, para mantener el
  ejercicio enfocado en el concepto de tiempo real.
