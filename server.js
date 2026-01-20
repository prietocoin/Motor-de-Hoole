const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Configuración de la base de datos (Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Permitir que Render sirva los archivos de la carpeta 'public'
app.use(express.static('public'));

// API para que el dashboard obtenga los datos
app.get('/precio-actual', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM market_data ORDER BY id DESC LIMIT 1');
    if (result.rows.length === 0) {
      return res.json({ mensaje: "Esperando datos..." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al conectar con Supabase" });
  }
});

// Ruta principal para ver el Dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Motor de HOO encendido en puerto ${port}`);
});
