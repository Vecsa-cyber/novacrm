const express  = require('express');
const mysql    = require('mysql2/promise');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
require('dotenv').config();

// Módulos permitidos por rol
const MODULOS_POR_ROL = {
  1: ['dashboard', 'contacts', 'pipeline', 'activities', 'deals', 'settings'], // Admin
  2: ['dashboard', 'pipeline', 'activities'],                                   // Vendedor
};

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS — solo el origen configurado en .env ─────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// ── Middleware: verifica JWT ──────────────────────────────────
const auth = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado.' });
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o expirada.' });
  }
};

// ── Middleware: solo administradores (rol 1) ──────────────────
const requireAdmin = (req, res, next) => {
  if (req.user?.rol !== 1) return res.status(403).json({ error: 'Acceso restringido.' });
  next();
};

// ── Pool de conexiones MySQL ─────────────────────────────────
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,
});

// ── Health check ─────────────────────────────────────────────
app.get('/api/ping', (_req, res) => {
  res.json({ ok: true, message: 'Servidor funcionando' });
});

// ── LOGIN ─────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Correo y contraseña requeridos.' });

    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE correo = ? LIMIT 1', [email]
    );

    if (rows.length === 0)
      return res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos.' });

    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.contrasena);

    if (!passwordValida)
      return res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos.' });

    let modulosPermitidos;
    try {
      const [accesos] = await pool.query(
        'SELECT vista FROM accesos WHERE id_rol = ?', [usuario.id_rol]
      );
      const desdeBD = accesos.length > 0
        ? accesos.map(a => a.vista)
        : (MODULOS_POR_ROL[usuario.id_rol] ?? ['dashboard']);

      // Módulos que no están en el ENUM de accesos (siempre los gestiona el rol hardcodeado)
      const extras = (MODULOS_POR_ROL[usuario.id_rol] ?? [])
        .filter(m => !['dashboard','contacts','activities','pipeline'].includes(m));

      modulosPermitidos = [...new Set([...desdeBD, ...extras])];
    } catch {
      modulosPermitidos = MODULOS_POR_ROL[usuario.id_rol] ?? ['dashboard'];
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, rol: usuario.id_rol, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token,
      userData: {
        id:               usuario.id_usuario,
        nombre:           usuario.nombre,
        correo:           usuario.correo,
        rol:              usuario.id_rol,
        modulosPermitidos,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error del servidor.', error: err.message });
  }
});

// ── DASHBOARD — resumen para StatCards ───────────────────────
app.get('/api/dashboard/resumen', auth, async (req, res) => {
  try {
    const { id_usuario, fecha_desde, fecha_hasta } = req.query;

    // Un vendedor solo puede ver su propio resumen
    if (id_usuario && req.user.rol !== 1 && String(req.user.id) !== String(id_usuario)) {
      return res.status(403).json({ error: 'No puedes acceder a datos de otros usuarios.' });
    }

    // Construir filtros dinámicos
    const actConds = ['1=1'];
    const actParams = [];
    const tratConds = ['1=1'];
    const tratParams = [];

    if (id_usuario) {
      actConds.push('a.id_usuario = ?');  actParams.push(id_usuario);
      tratConds.push('id_usuario = ?');   tratParams.push(id_usuario);
    }
    if (fecha_desde) {
      actConds.push('DATE(a.fecha_actividad) >= ?');  actParams.push(fecha_desde);
      tratConds.push('DATE(fecha_visita) >= ?');       tratParams.push(fecha_desde);
    }
    if (fecha_hasta) {
      actConds.push('DATE(a.fecha_actividad) <= ?');  actParams.push(fecha_hasta);
      tratConds.push('DATE(fecha_visita) <= ?');       tratParams.push(fecha_hasta);
    }

    const wAct  = actConds.join(' AND ');
    const wTrat = tratConds.join(' AND ');

    const [[{ visitas }]]        = await pool.query(
      `SELECT COUNT(*) AS visitas FROM actividades a
       JOIN catalogo_actividades ca ON a.id_catalogo = ca.id_catalogo
       WHERE ca.nombre_actividad = 'Visita' AND ${wAct}`, actParams);
    const [[{ oportunidades }]]  = await pool.query(
      'SELECT COUNT(*) AS oportunidades FROM contactos');
    const [[{ avanzados }]]      = await pool.query(
      `SELECT COUNT(*) AS avanzados FROM tratos WHERE estado != 'Cerrado' AND ${wTrat}`, tratParams);
    const [[{ en_negociacion }]] = await pool.query(
      `SELECT COUNT(*) AS en_negociacion FROM tratos WHERE estado = 'En Negociación' AND ${wTrat}`, tratParams);

    res.json({ visitas, oportunidades, avanzados, en_negociacion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Todas las rutas a partir de aquí requieren JWT válido ─────
app.use(auth);

// ── PLANTAS ───────────────────────────────────────────────────
app.get('/api/plantas', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM plantas ORDER BY nombre_planta ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/plantas', async (req, res) => {
  try {
    const { nombre_planta } = req.body;
    const [result] = await pool.query(
      'INSERT INTO plantas (nombre_planta) VALUES (?)', [nombre_planta]
    );
    res.status(201).json({ id_planta: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/plantas/:id', async (req, res) => {
  try {
    const { nombre_planta } = req.body;
    await pool.query('UPDATE plantas SET nombre_planta=? WHERE id_planta=?', [nombre_planta, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/plantas/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM plantas WHERE id_planta=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── USUARIOS — lista para filtros ────────────────────────────
app.get('/api/usuarios', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id_usuario, nombre FROM usuarios');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ROLES ─────────────────────────────────────────────────────
app.get('/api/roles', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id_rol, nombre_rol FROM roles ORDER BY id_rol ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ACCESOS — leer todos ─────────────────────────────────────
app.get('/api/accesos', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id_acceso, a.vista, a.id_rol, r.nombre_rol
       FROM accesos a
       LEFT JOIN roles r ON a.id_rol = r.id_rol
       ORDER BY a.vista ASC, a.id_rol ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ACCESOS — crear ───────────────────────────────────────────
app.post('/api/accesos', async (req, res) => {
  try {
    const { id_rol, vista } = req.body;
    const [result] = await pool.query(
      'INSERT INTO accesos (id_rol, vista) VALUES (?, ?)',
      [id_rol, vista]
    );
    res.status(201).json({ id_acceso: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ACCESOS — actualizar id_rol ───────────────────────────────
app.put('/api/accesos/:id', async (req, res) => {
  try {
    const { id_rol } = req.body;
    await pool.query(
      'UPDATE accesos SET id_rol = ? WHERE id_acceso = ?',
      [id_rol, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ACCESOS — eliminar ────────────────────────────────────────
app.delete('/api/accesos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM accesos WHERE id_acceso = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── USUARIOS — lista completa (sin contraseña) ────────────────
app.get('/api/usuarios/todos', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.correo, u.id_rol, r.nombre_rol
       FROM usuarios u
       LEFT JOIN roles r ON u.id_rol = r.id_rol
       ORDER BY u.id_usuario ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── USUARIOS — crear ─────────────────────────────────────────
app.post('/api/usuarios', async (req, res) => {
  try {
    const { nombre, correo, contrasena, id_rol } = req.body;
    if (!nombre || !correo || !contrasena)
      return res.status(400).json({ error: 'nombre, correo y contraseña son requeridos.' });

    const hash = await bcrypt.hash(contrasena, 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contrasena, id_rol) VALUES (?, ?, ?, ?)',
      [nombre, correo, hash, id_rol ?? 2]
    );
    res.status(201).json({ id_usuario: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── USUARIOS — actualizar ─────────────────────────────────────
app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const { nombre, correo, id_rol } = req.body;
    await pool.query(
      'UPDATE usuarios SET nombre=?, correo=?, id_rol=? WHERE id_usuario=?',
      [nombre, correo, id_rol, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── USUARIOS — eliminar ───────────────────────────────────────
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM usuarios WHERE id_usuario=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DASHBOARD — tratos recientes ─────────────────────────────
app.get('/api/dashboard/tratos-recientes', async (req, res) => {
  try {
    const { id_usuario, fecha_desde, fecha_hasta } = req.query;
    const conds = ['1=1'];
    const params = [];
    if (id_usuario)  { conds.push('t.id_usuario = ?');          params.push(id_usuario); }
    if (fecha_desde) { conds.push('DATE(t.fecha_visita) >= ?'); params.push(fecha_desde); }
    if (fecha_hasta) { conds.push('DATE(t.fecha_visita) <= ?'); params.push(fecha_hasta); }

    const [rows] = await pool.query(
      `SELECT t.id_trato, t.nombre_servicio, t.estado,
              COALESCE(con.empresa, p.nombre_planta, '') AS empresa,
              u.nombre AS vendedor
       FROM tratos t
       LEFT JOIN usuarios   u   ON t.id_usuario  = u.id_usuario
       LEFT JOIN contactos  con ON t.id_contacto = con.id_contacto
       LEFT JOIN plantas    p   ON t.id_planta   = p.id_planta
       WHERE ${conds.join(' AND ')}
       ORDER BY t.id_trato DESC
       LIMIT 10`, params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DASHBOARD — últimas actividades ──────────────────────────
app.get('/api/dashboard/actividades-recientes', async (req, res) => {
  try {
    const { id_usuario, fecha_desde, fecha_hasta } = req.query;
    const conds = ['1=1'];
    const params = [];
    if (id_usuario)  { conds.push('a.id_usuario = ?');                params.push(id_usuario); }
    if (fecha_desde) { conds.push('DATE(a.fecha_actividad) >= ?');    params.push(fecha_desde); }
    if (fecha_hasta) { conds.push('DATE(a.fecha_actividad) <= ?');    params.push(fecha_hasta); }

    const [rows] = await pool.query(
      `SELECT a.id_actividad, ca.nombre_actividad AS tipo_actividad, a.fecha_actividad,
              u.nombre AS usuario, p.nombre_planta AS empresa
       FROM actividades a
       LEFT JOIN catalogo_actividades ca ON a.id_catalogo = ca.id_catalogo
       LEFT JOIN usuarios u ON a.id_usuario = u.id_usuario
       LEFT JOIN plantas   p ON a.id_planta  = p.id_planta
       WHERE ${conds.join(' AND ')}
       ORDER BY a.fecha_actividad DESC
       LIMIT 10`, params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CONTACTOS ─────────────────────────────────────────────────
app.get('/api/contactos', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contactos');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contactos', async (req, res) => {
  try {
    const { nombre_contacto, empresa, correo, telefono, estado, valor, id_planta } = req.body;
    const [result] = await pool.query(
      'INSERT INTO contactos (nombre_contacto, empresa, correo, telefono, estado, valor, id_planta) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre_contacto, empresa, correo, telefono, estado, valor, id_planta ?? null]
    );
    res.status(201).json({ id_contacto: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/contactos/:id', async (req, res) => {
  try {
    const { nombre_contacto, empresa, correo, telefono, estado, valor, id_planta } = req.body;
    await pool.query(
      'UPDATE contactos SET nombre_contacto=?, empresa=?, correo=?, telefono=?, estado=?, valor=?, id_planta=? WHERE id_contacto=?',
      [nombre_contacto, empresa, correo, telefono, estado, valor, id_planta ?? null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/contactos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM contactos WHERE id_contacto=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── TRATOS ────────────────────────────────────────────────────
app.get('/api/tratos', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, u.nombre AS nombre_usuario,
              COALESCE(con.empresa, p.nombre_planta, '') AS empresa,
              p.nombre_planta, con.nombre_contacto
       FROM tratos t
       LEFT JOIN usuarios   u   ON t.id_usuario  = u.id_usuario
       LEFT JOIN contactos  con ON t.id_contacto = con.id_contacto
       LEFT JOIN plantas    p   ON t.id_planta   = p.id_planta`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tratos', async (req, res) => {
  try {
    const { nombre_servicio, presupuesto, fecha_visita, fecha_vencimiento, estado, id_usuario, id_planta, id_contacto } = req.body;
    const [result] = await pool.query(
      'INSERT INTO tratos (nombre_servicio, presupuesto, fecha_visita, fecha_vencimiento, estado, id_usuario, id_planta, id_contacto) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre_servicio, presupuesto, fecha_visita, fecha_vencimiento, estado, id_usuario ?? null, id_planta ?? null, id_contacto ?? null]
    );
    res.status(201).json({ id_trato: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tratos/:id', async (req, res) => {
  try {
    const { nombre_servicio, presupuesto, fecha_visita, fecha_vencimiento, estado, id_usuario, id_planta, id_contacto } = req.body;
    await pool.query(
      'UPDATE tratos SET nombre_servicio=?, presupuesto=?, fecha_visita=?, fecha_vencimiento=?, estado=?, id_usuario=?, id_planta=?, id_contacto=? WHERE id_trato=?',
      [nombre_servicio, presupuesto, fecha_visita, fecha_vencimiento, estado, id_usuario ?? null, id_planta ?? null, id_contacto ?? null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tratos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tratos WHERE id_trato=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ACTIVIDADES ───────────────────────────────────────────────
app.get('/api/actividades', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, ca.nombre_actividad AS tipo_actividad,
              u.nombre AS nombre_usuario, p.nombre_planta AS nombre_planta
       FROM actividades a
       LEFT JOIN catalogo_actividades ca ON a.id_catalogo = ca.id_catalogo
       LEFT JOIN usuarios u ON a.id_usuario = u.id_usuario
       LEFT JOIN plantas   p ON a.id_planta  = p.id_planta
       ORDER BY a.fecha_actividad DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/actividades', async (req, res) => {
  try {
    const { id_catalogo, fecha_actividad, id_planta, id_usuario } = req.body;
    const [result] = await pool.query(
      'INSERT INTO actividades (id_catalogo, fecha_actividad, id_planta, id_usuario) VALUES (?, ?, ?, ?)',
      [id_catalogo ?? null, fecha_actividad, id_planta ?? null, id_usuario ?? null]
    );
    res.status(201).json({ id_actividad: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/actividades/:id/completada', async (req, res) => {
  try {
    const { completada } = req.body;
    await pool.query(
      'UPDATE actividades SET completada = ? WHERE id_actividad = ?',
      [completada ? 1 : 0, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/actividades/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM actividades WHERE id_actividad=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CATÁLOGO DE ACTIVIDADES ───────────────────────────────────
app.get('/api/catalogo-actividades', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM catalogo_actividades ORDER BY id_catalogo ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/catalogo-actividades', async (req, res) => {
  try {
    const { nombre_actividad } = req.body;
    const [result] = await pool.query(
      'INSERT INTO catalogo_actividades (nombre_actividad) VALUES (?)', [nombre_actividad]
    );
    res.status(201).json({ id_catalogo: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/catalogo-actividades/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM catalogo_actividades WHERE id_catalogo=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── EQUIPOS ───────────────────────────────────────────────────
app.get('/api/equipos', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM equipos ORDER BY id_equipo ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/equipos', async (req, res) => {
  try {
    const { nombre_equipo, tag, tipo, flujo_referencia, unidad, costo, factor_n, proveedor, notas } = req.body;
    if (!nombre_equipo) return res.status(400).json({ error: 'nombre_equipo es requerido.' });
    const [result] = await pool.query(
      `INSERT INTO equipos (nombre_equipo, tag, tipo, flujo_referencia, unidad, costo, factor_n, proveedor, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre_equipo, tag ?? null, tipo ?? null, flujo_referencia ?? null, unidad ?? null,
       costo ?? null, factor_n ?? null, proveedor ?? null, notas ?? null]
    );
    res.status(201).json({ id_equipo: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/equipos/:id', async (req, res) => {
  try {
    const { nombre_equipo, tag, tipo, flujo_referencia, unidad, costo, factor_n, proveedor, notas } = req.body;
    await pool.query(
      `UPDATE equipos SET nombre_equipo=?, tag=?, tipo=?, flujo_referencia=?, unidad=?,
       costo=?, factor_n=?, proveedor=?, notas=? WHERE id_equipo=?`,
      [nombre_equipo, tag ?? null, tipo ?? null, flujo_referencia ?? null, unidad ?? null,
       costo ?? null, factor_n ?? null, proveedor ?? null, notas ?? null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/equipos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM equipos WHERE id_equipo=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── TARIFAS ───────────────────────────────────────────────────
app.get('/api/tarifas', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tarifas ORDER BY id_tarifa ASC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/tarifas', async (req, res) => {
  try {
    const { nombre_tarifa, tipo_tarifa, costo } = req.body;
    const [r] = await pool.query(
      'INSERT INTO tarifas (nombre_tarifa, tipo_tarifa, costo) VALUES (?, ?, ?)',
      [nombre_tarifa, tipo_tarifa ?? null, costo ?? 0]
    );
    res.status(201).json({ id_tarifa: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/tarifas/:id', async (req, res) => {
  try {
    const { nombre_tarifa, tipo_tarifa, costo } = req.body;
    await pool.query(
      'UPDATE tarifas SET nombre_tarifa=?, tipo_tarifa=?, costo=? WHERE id_tarifa=?',
      [nombre_tarifa, tipo_tarifa ?? null, costo ?? 0, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/tarifas/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tarifas WHERE id_tarifa=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── COSTOS INDIRECTOS ─────────────────────────────────────────
app.get('/api/costos-indirectos', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM costos_indirectos ORDER BY id_indirecto ASC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/costos-indirectos', async (req, res) => {
  try {
    const { concepto, tipo, porcentaje_default, monto_fijo, cantidad } = req.body;
    const [r] = await pool.query(
      'INSERT INTO costos_indirectos (concepto, tipo, porcentaje_default, monto_fijo, cantidad) VALUES (?, ?, ?, ?, ?)',
      [concepto, tipo ?? 'Porcentaje', porcentaje_default ?? 0, monto_fijo ?? 0, cantidad ?? 1]
    );
    res.status(201).json({ id_indirecto: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/costos-indirectos/:id', async (req, res) => {
  try {
    const { concepto, tipo, porcentaje_default, monto_fijo, cantidad } = req.body;
    await pool.query(
      'UPDATE costos_indirectos SET concepto=?, tipo=?, porcentaje_default=?, monto_fijo=?, cantidad=? WHERE id_indirecto=?',
      [concepto, tipo, porcentaje_default ?? 0, monto_fijo ?? 0, cantidad ?? 1, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/costos-indirectos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM costos_indirectos WHERE id_indirecto=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── TABULADOR MO ──────────────────────────────────────────────
app.get('/api/tabulador-mo', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tabulador_mo ORDER BY id_tabulador ASC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/tabulador-mo', async (req, res) => {
  try {
    const { categoria, concepto, precio_unitario, desde, hasta } = req.body;
    const [r] = await pool.query(
      'INSERT INTO tabulador_mo (categoria, concepto, precio_unitario, desde, hasta) VALUES (?, ?, ?, ?, ?)',
      [categoria ?? null, concepto, precio_unitario ?? 0, desde ?? null, hasta ?? null]
    );
    res.status(201).json({ id_tabulador: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/tabulador-mo/:id', async (req, res) => {
  try {
    const { categoria, concepto, precio_unitario, desde, hasta } = req.body;
    await pool.query(
      'UPDATE tabulador_mo SET categoria=?, concepto=?, precio_unitario=?, desde=?, hasta=? WHERE id_tabulador=?',
      [categoria ?? null, concepto, precio_unitario ?? 0, desde ?? null, hasta ?? null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/tabulador-mo/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tabulador_mo WHERE id_tabulador=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── EXPONENTES EQUIPO ─────────────────────────────────────────
app.get('/api/exponentes-equipo', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM exponents_equipo ORDER BY id_exponente ASC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── COTIZACIONES ──────────────────────────────────────────────
app.get('/api/cotizaciones', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.nombre AS nombre_usuario, p.nombre_planta
       FROM cotizaciones c
       LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
       LEFT JOIN plantas  p ON c.id_planta  = p.id_planta
       ORDER BY c.fecha_creacion DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/cotizaciones/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [[cotizacion]] = await pool.query(
      `SELECT c.*, u.nombre AS nombre_usuario, p.nombre_planta
       FROM cotizaciones c
       LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
       LEFT JOIN plantas  p ON c.id_planta  = p.id_planta
       WHERE c.id_cotizacion = ?`, [id]
    );
    if (!cotizacion) return res.status(404).json({ error: 'No encontrada' });

    const [equipos]    = await pool.query(
      `SELECT ce.*, e.nombre_equipo, e.tag, e.unidad, e.flujo_referencia, e.factor_n
       FROM cotizacion_equipos ce
       JOIN equipos e ON ce.id_equipo = e.id_equipo
       WHERE ce.id_cotizacion = ?`, [id]);
    const [tarifas]    = await pool.query(
      `SELECT ct.*, t.nombre_tarifa, t.tipo_tarifa
       FROM cotizacion_tarifas_detalle ct
       JOIN tarifas t ON ct.id_tarifa = t.id_tarifa
       WHERE ct.id_cotizacion = ?`, [id]);
    const [indirectos] = await pool.query(
      `SELECT ci.*, c2.concepto, c2.tipo
       FROM cotizacion_indirectos_detalle ci
       JOIN costos_indirectos c2 ON ci.id_indirecto = c2.id_indirecto
       WHERE ci.id_cotizacion = ?`, [id]);
    const [tabulador]  = await pool.query(
      `SELECT ct.*, tm.concepto, tm.precio_unitario
       FROM cotizacion_tabulador_detalle ct
       JOIN tabulador_mo tm ON ct.id_tabulador = tm.id_tabulador
       WHERE ct.id_cotizacion = ?`, [id]);

    res.json({ ...cotizacion, equipos, tarifas, indirectos, tabulador });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/cotizaciones', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { nombre_proyecto, nombre_cliente, empresa, correo, id_usuario, id_planta,
            equipos = [], tarifas = [], indirectos = [], tabulador = [] } = req.body;

    const [r] = await conn.query(
      `INSERT INTO cotizaciones (nombre_proyecto, nombre_cliente, empresa, correo, id_usuario, id_planta, fecha_creacion)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [nombre_proyecto ?? null, nombre_cliente ?? null, empresa ?? null, correo ?? null,
       id_usuario ?? null, id_planta ?? null]
    );
    const id_cotizacion = r.insertId;

    for (const eq of equipos) {
      await conn.query(
        'INSERT INTO cotizacion_equipos (id_cotizacion, id_equipo, id_exponente, cantidad, precio_unitario_venta) VALUES (?, ?, ?, ?, ?)',
        [id_cotizacion, eq.id_equipo, eq.id_exponente ?? null, eq.cantidad ?? 1, eq.precio_unitario_venta ?? 0]
      );
    }
    for (const t of tarifas) {
      await conn.query(
        'INSERT INTO cotizacion_tarifas_detalle (id_cotizacion, id_tarifa, cantidad, costo_unitario_aplicado) VALUES (?, ?, ?, ?)',
        [id_cotizacion, t.id_tarifa, t.cantidad ?? 1, t.costo_unitario_aplicado ?? 0]
      );
    }
    for (const ind of indirectos) {
      await conn.query(
        'INSERT INTO cotizacion_indirectos_detalle (id_cotizacion, id_indirecto, monto_aplicado) VALUES (?, ?, ?)',
        [id_cotizacion, ind.id_indirecto, ind.monto_aplicado ?? 0]
      );
    }
    for (const tab of tabulador) {
      await conn.query(
        'INSERT INTO cotizacion_tabulador_detalle (id_cotizacion, id_tabulador, cantidad, precio_aplicado) VALUES (?, ?, ?, ?)',
        [id_cotizacion, tab.id_tabulador, tab.cantidad ?? 1, tab.precio_aplicado ?? 0]
      );
    }

    await conn.commit();
    res.status(201).json({ id_cotizacion });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// ── EQUIPOS COMODATO ──────────────────────────────────────────
app.get('/api/equipos-comodato', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ec.*, e.nombre_equipo, e.tag, p.nombre_planta
       FROM equipos_comodato ec
       JOIN equipos e ON ec.id_equipo = e.id_equipo
       JOIN plantas  p ON ec.id_planta = p.id_planta
       ORDER BY ec.id_comodato DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/equipos-comodato', async (req, res) => {
  try {
    const { id_planta, id_equipo, fecha_inicio, estado_equipo, notas } = req.body;
    const [r] = await pool.query(
      'INSERT INTO equipos_comodato (id_planta, id_equipo, fecha_inicio, estado_equipo, notas) VALUES (?, ?, ?, ?, ?)',
      [id_planta, id_equipo, fecha_inicio ?? null, estado_equipo ?? null, notas ?? null]
    );
    res.status(201).json({ id_comodato: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/equipos-comodato/:id', async (req, res) => {
  try {
    const { id_planta, id_equipo, fecha_inicio, estado_equipo, notas } = req.body;
    await pool.query(
      'UPDATE equipos_comodato SET id_planta=?, id_equipo=?, fecha_inicio=?, estado_equipo=?, notas=? WHERE id_comodato=?',
      [id_planta, id_equipo, fecha_inicio ?? null, estado_equipo ?? null, notas ?? null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/equipos-comodato/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM equipos_comodato WHERE id_comodato=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── EQUIPOS INSTALADOS ────────────────────────────────────────
app.get('/api/equipos-instalados', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ei.*, e.nombre_equipo, e.tag, p.nombre_planta
       FROM equipos_instalados ei
       JOIN equipos e ON ei.id_equipo = e.id_equipo
       JOIN plantas  p ON ei.id_planta = p.id_planta
       ORDER BY ei.id_instalacion DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/equipos-instalados', async (req, res) => {
  try {
    const { id_planta, id_equipo, cantidad, numero_serie, fecha_instalacion } = req.body;
    const [r] = await pool.query(
      'INSERT INTO equipos_instalados (id_planta, id_equipo, cantidad, numero_serie, fecha_instalacion) VALUES (?, ?, ?, ?, ?)',
      [id_planta, id_equipo, cantidad ?? 1, numero_serie ?? null, fecha_instalacion ?? null]
    );
    res.status(201).json({ id_instalacion: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/equipos-instalados/:id', async (req, res) => {
  try {
    const { id_planta, id_equipo, cantidad, numero_serie, fecha_instalacion } = req.body;
    await pool.query(
      'UPDATE equipos_instalados SET id_planta=?, id_equipo=?, cantidad=?, numero_serie=?, fecha_instalacion=? WHERE id_instalacion=?',
      [id_planta, id_equipo, cantidad ?? 1, numero_serie ?? null, fecha_instalacion ?? null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/equipos-instalados/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM equipos_instalados WHERE id_instalacion=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GMAO — CLIENTES ───────────────────────────────────────────
app.get('/api/gmao/clientes', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, p.nombre_planta
       FROM gmao_clientes c
       LEFT JOIN plantas p ON c.id_planta = p.id_planta`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/gmao/clientes', async (req, res) => {
  try {
    const { nombre_fiscal, rfc, contacto_principal, telefono_mantenimiento, id_planta } = req.body;
    const [result] = await pool.query(
      'INSERT INTO gmao_clientes (nombre_fiscal, rfc, contacto_principal, telefono_mantenimiento, id_planta) VALUES (?, ?, ?, ?, ?)',
      [nombre_fiscal, rfc ?? null, contacto_principal ?? null, telefono_mantenimiento ?? null, id_planta ?? null]
    );
    res.status(201).json({ id_gmao_cliente: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/gmao/clientes/:id', async (req, res) => {
  try {
    const { nombre_fiscal, rfc, contacto_principal, telefono_mantenimiento, id_planta } = req.body;
    await pool.query(
      'UPDATE gmao_clientes SET nombre_fiscal=?, rfc=?, contacto_principal=?, telefono_mantenimiento=?, id_planta=? WHERE id_gmao_cliente=?',
      [nombre_fiscal, rfc ?? null, contacto_principal ?? null, telefono_mantenimiento ?? null, id_planta ?? null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/gmao/clientes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM gmao_clientes WHERE id_gmao_cliente=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GMAO — ACTIVOS ────────────────────────────────────────────
app.get('/api/gmao/activos', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, p.nombre_planta, e.nombre_equipo
       FROM gmao_activos a
       LEFT JOIN plantas p ON a.id_planta = p.id_planta
       LEFT JOIN equipos e ON a.id_equipo_catalogo = e.id_equipo`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/gmao/activos', async (req, res) => {
  try {
    const { tag_activo, nombre_activo, modelo, serie, id_planta, fecha_instalacion, estado_activo, id_equipo_catalogo } = req.body;
    const [result] = await pool.query(
      'INSERT INTO gmao_activos (tag_activo, nombre_activo, modelo, serie, id_planta, fecha_instalacion, estado_activo, id_equipo_catalogo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [tag_activo ?? null, nombre_activo, modelo ?? null, serie ?? null, id_planta ?? null, fecha_instalacion ?? null, estado_activo ?? 'Operativo', id_equipo_catalogo ?? null]
    );
    res.status(201).json({ id_activo: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/gmao/activos/:id', async (req, res) => {
  try {
    const { tag_activo, nombre_activo, modelo, serie, id_planta, fecha_instalacion, estado_activo, id_equipo_catalogo } = req.body;
    await pool.query(
      'UPDATE gmao_activos SET tag_activo=?, nombre_activo=?, modelo=?, serie=?, id_planta=?, fecha_instalacion=?, estado_activo=?, id_equipo_catalogo=? WHERE id_activo=?',
      [tag_activo ?? null, nombre_activo, modelo ?? null, serie ?? null, id_planta ?? null, fecha_instalacion ?? null, estado_activo ?? 'Operativo', id_equipo_catalogo ?? null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/gmao/activos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM gmao_activos WHERE id_activo=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GMAO — ÓRDENES DE TRABAJO ─────────────────────────────────
app.get('/api/gmao/ordenes', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ot.*,
              a.nombre_activo, a.tag_activo,
              c.nombre_fiscal AS nombre_cliente,
              p.nombre_planta,
              ut.nombre AS nombre_tecnico,
              us.nombre AS nombre_supervisor,
              ca.nombre AS nombre_actividad
       FROM gmao_ordenes_trabajo ot
       LEFT JOIN gmao_activos              a  ON ot.id_activo    = a.id_activo
       LEFT JOIN plantas                   p  ON a.id_planta     = p.id_planta
       LEFT JOIN gmao_clientes             c  ON p.id_planta     = c.id_planta
       LEFT JOIN usuarios                  ut ON ot.id_tecnico   = ut.id_usuario
       LEFT JOIN usuarios                  us ON ot.id_supervisor= us.id_usuario
       LEFT JOIN gmao_catalogo_actividades ca ON ot.id_actividad = ca.id_actividad
       ORDER BY ot.fecha_programada ASC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/gmao/ordenes/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ot.*,
              a.nombre_activo, a.tag_activo,
              c.nombre_fiscal AS nombre_cliente,
              p.nombre_planta,
              ut.nombre AS nombre_tecnico,
              us.nombre AS nombre_supervisor,
              ca.nombre AS nombre_actividad
       FROM gmao_ordenes_trabajo ot
       LEFT JOIN gmao_activos              a  ON ot.id_activo    = a.id_activo
       LEFT JOIN plantas                   p  ON a.id_planta     = p.id_planta
       LEFT JOIN gmao_clientes             c  ON p.id_planta     = c.id_planta
       LEFT JOIN usuarios                  ut ON ot.id_tecnico   = ut.id_usuario
       LEFT JOIN usuarios                  us ON ot.id_supervisor= us.id_usuario
       LEFT JOIN gmao_catalogo_actividades ca ON ot.id_actividad = ca.id_actividad
       WHERE ot.id_ot = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'OT no encontrada' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/gmao/ordenes', async (req, res) => {
  try {
    const { folio, id_activo, tipo_mantenimiento, prioridad, estado_ot, id_tecnico, id_supervisor,
            fecha_programada, fecha_cierre, descripcion_falla, acciones_realizadas,
            periodicidad, periodicidad_custom, id_actividad } = req.body;
    const [result] = await pool.query(
      `INSERT INTO gmao_ordenes_trabajo
         (folio, id_activo, tipo_mantenimiento, prioridad, estado_ot, id_tecnico, id_supervisor,
          fecha_programada, fecha_cierre, descripcion_falla, acciones_realizadas,
          periodicidad, periodicidad_custom, id_actividad)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [folio ?? null, id_activo ?? null, tipo_mantenimiento, prioridad ?? 'Media', estado_ot ?? 'Abierta',
       id_tecnico ?? null, id_supervisor ?? null, fecha_programada ?? null, fecha_cierre ?? null,
       descripcion_falla ?? null, acciones_realizadas ?? null,
       periodicidad ?? null, periodicidad_custom ?? null, id_actividad ?? null]
    );
    res.status(201).json({ id_ot: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/gmao/ordenes/:id', async (req, res) => {
  try {
    const { folio, id_activo, tipo_mantenimiento, prioridad, estado_ot, id_tecnico, id_supervisor,
            fecha_programada, fecha_cierre, descripcion_falla, acciones_realizadas,
            periodicidad, periodicidad_custom, id_actividad } = req.body;
    await pool.query(
      `UPDATE gmao_ordenes_trabajo SET
         folio=?, id_activo=?, tipo_mantenimiento=?, prioridad=?, estado_ot=?,
         id_tecnico=?, id_supervisor=?, fecha_programada=?, fecha_cierre=?,
         descripcion_falla=?, acciones_realizadas=?,
         periodicidad=?, periodicidad_custom=?, id_actividad=?
       WHERE id_ot=?`,
      [folio ?? null, id_activo ?? null, tipo_mantenimiento, prioridad ?? 'Media', estado_ot ?? 'Abierta',
       id_tecnico ?? null, id_supervisor ?? null, fecha_programada ?? null, fecha_cierre ?? null,
       descripcion_falla ?? null, acciones_realizadas ?? null,
       periodicidad ?? null, periodicidad_custom ?? null, id_actividad ?? null,
       req.params.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/gmao/ordenes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM gmao_ordenes_trabajo WHERE id_ot=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GMAO — DASHBOARD resumen ──────────────────────────────────
app.get('/api/gmao/dashboard', async (_req, res) => {
  try {
    const [[{ clientesActivos }]]     = await pool.query(`SELECT COUNT(*) AS clientesActivos FROM gmao_clientes`);
    const [[{ activosTotal }]]        = await pool.query(`SELECT COUNT(*) AS activosTotal FROM gmao_activos`);
    const [[{ activosFuera }]]        = await pool.query(`SELECT COUNT(*) AS activosFuera FROM gmao_activos WHERE estado_activo = 'En Reparación'`);
    const [[{ otsAbiertas }]]         = await pool.query(`SELECT COUNT(*) AS otsAbiertas FROM gmao_ordenes_trabajo WHERE estado_ot NOT IN ('Cerrada')`);
    const [[{ otsVencidas }]]         = await pool.query(`SELECT COUNT(*) AS otsVencidas FROM gmao_ordenes_trabajo WHERE estado_ot NOT IN ('Cerrada') AND fecha_programada < NOW()`);
    const [[{ total, completadas }]]  = await pool.query(`SELECT COUNT(*) AS total, SUM(estado_ot = 'Cerrada') AS completadas FROM gmao_ordenes_trabajo`);

    res.json({
      clientesActivos,
      clientesTotal: clientesActivos,
      activosRegistrados: activosTotal,
      activosFueraServicio: activosFuera,
      otsAbiertas,
      otsVencidas,
      tasaCompletado: total > 0 ? Math.round((completadas / total) * 1000) / 10 : 0,
      completadas: completadas ?? 0,
      totalOTs: total,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GMAO — CATÁLOGO DE ACTIVIDADES ───────────────────────────
app.get('/api/gmao/catalogo', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM gmao_catalogo_actividades WHERE activo = 1 ORDER BY nombre ASC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/gmao/catalogo', async (req, res) => {
  try {
    const { nombre, tipo_mantenimiento, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
    const [result] = await pool.query(
      'INSERT INTO gmao_catalogo_actividades (nombre, tipo_mantenimiento, descripcion) VALUES (?, ?, ?)',
      [nombre, tipo_mantenimiento ?? null, descripcion ?? null]
    );
    res.status(201).json({ id_actividad: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/gmao/catalogo/:id', async (req, res) => {
  try {
    await pool.query('UPDATE gmao_catalogo_actividades SET activo = 0 WHERE id_actividad = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Inicio ────────────────────────────────────────────────────
const runMigrations = async () => {
  try {
    await pool.query(`
      ALTER TABLE gmao_ordenes_trabajo
        ADD COLUMN IF NOT EXISTS periodicidad       INT NULL COMMENT 'Días entre ejecuciones preventivas',
        ADD COLUMN IF NOT EXISTS periodicidad_custom INT NULL COMMENT 'Días personalizados',
        ADD COLUMN IF NOT EXISTS id_actividad       INT NULL
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gmao_catalogo_actividades (
        id_actividad       INT AUTO_INCREMENT PRIMARY KEY,
        nombre             VARCHAR(200) NOT NULL,
        tipo_mantenimiento ENUM('Preventivo','Correctivo','Predictivo') DEFAULT NULL,
        descripcion        TEXT,
        activo             TINYINT(1) DEFAULT 1
      )
    `);
    console.log('✅ Migraciones GMAO aplicadas');
  } catch (err) {
    console.warn('⚠️  Migraciones GMAO:', err.message);
  }
};

app.listen(PORT, async () => {
  await runMigrations();
  console.log(`✅ API corriendo en http://localhost:${PORT}`);
});
