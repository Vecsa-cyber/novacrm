// Ejecuta este script UNA SOLA VEZ para hashear las contraseñas existentes
// Comando: node hashear.js

const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

(async () => {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  const [usuarios] = await conn.query('SELECT id_usuario, contrasena FROM usuarios');

  for (const u of usuarios) {
    // Si ya está hasheada (empieza con $2a$ o $2b$) la saltamos
    if (u.contrasena?.startsWith('$2')) {
      console.log(`Usuario ${u.id_usuario}: ya hasheada, se omite.`);
      continue;
    }

    const hash = await bcrypt.hash(u.contrasena, 10);
    await conn.query('UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?', [hash, u.id_usuario]);
    console.log(`Usuario ${u.id_usuario}: contraseña hasheada ✅`);
  }

  await conn.end();
  console.log('\nListo. Ahora puedes iniciar sesión normalmente.');
})();
