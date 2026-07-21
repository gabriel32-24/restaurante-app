// Script para crear usuarios de prueba (mozo y cocinero) en la base de datos
// Uso: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Usuario = require('./models/Usuario');

const usuariosDePrueba = [
  { username: 'mozo1', password: '123456', rol: 'mozo' },
  { username: 'mozo2', password: '123456', rol: 'mozo' },
  { username: 'cocinero1', password: '123456', rol: 'cocinero' }
];

const seed = async () => {
  try {
    await connectDB();

    for (const u of usuariosDePrueba) {
      const existe = await Usuario.findOne({ username: u.username });
      if (existe) {
        console.log(`⚠️  El usuario "${u.username}" ya existe, se omite.`);
        continue;
      }
      const passwordHasheada = await bcrypt.hash(u.password, 10);
      await Usuario.create({ username: u.username, password: passwordHasheada, rol: u.rol });
      console.log(`✅ Usuario creado: ${u.username} (${u.rol}) — contraseña: ${u.password}`);
    }

    console.log('🌱 Seed finalizado.');
    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  }
};

seed();
