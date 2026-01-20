const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

// Servir la web desde la carpeta de tu Dashboard
// Si tus archivos están en 'public', usa esto:
app.use(express.static(path.join(__dirname, 'public')));

app.get('/precio-actual', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM market_data ORDER BY id DESC LIMIT 1');
    res.json(result.rows[0] || { mensaje: "Sin datos" });
  } catch (err) {
    res.status(500).json({ error: "Error de conexión" });
  }
});

// Ruta para la App
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 HOO V6.0 funcionando en puerto ${port}`);
});
