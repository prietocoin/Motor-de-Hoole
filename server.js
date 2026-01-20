const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// 1. Conexión a Supabase (Usa tu variable DATABASE_URL de Render)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 2. Esta línea es la que busca la carpeta "public" para mostrar el Dashboard
app.use(express.static('public'));

// 3. API: Esto es lo que lee los datos de n8n
app.get('/precio-actual', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM market_data ORDER BY id DESC LIMIT 1');
    res.json(result.rows[0] || { mensaje: "Sin datos" });
  } catch (err) {
    res.status(500).json({ error: "Error de conexión" });
  }
});

// 4. Esta ruta sirve la página web cuando entras a hoo.jairokov.com
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Motor de HOO funcionando en el puerto ${port}`);
});
