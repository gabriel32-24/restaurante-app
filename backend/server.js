require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Conexion a la base de datos
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Servimos el frontend (HTML, CSS, JS) como archivos estáticos
app.use(express.static(path.join(__dirname, 'frontend')));

// Hacemos que "io" esté disponible dentro de los controladores (req.app.get('io'))
app.set('io', io);

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/pedidos', pedidoRoutes);

// ----- Comunicación en tiempo real con Socket.IO -----
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);

  // El cliente informa su rol al conectarse para unirse a la sala correcta
  socket.on('join', ({ rol, username }) => {
    if (rol === 'mozo') {
      socket.join('mozos');
      console.log(`🧑‍🍳 Mozo "${username}" se unió a la sala "mozos"`);
    } else if (rol === 'cocinero') {
      socket.join('cocina');
      console.log(`👨‍🍳 Cocinero "${username}" se unió a la sala "cocina"`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
