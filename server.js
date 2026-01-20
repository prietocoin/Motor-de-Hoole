const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

// Conexión a la base de datos (Usaremos el Host que termina en .pooler.supabase.com)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Endpoint para que tu App pida los datos
app.get('/precio-actual', async (req, res) => {
  try {
    // Traemos la última fila (la que tiene el ID más alto)
    const result = await pool.query('SELECT * FROM market_data ORDER BY id DESC LIMIT 1');
    
    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "No hay datos guardados aún" });
    }

    // Enviamos el dato limpio a la App
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error en la DB:", err);
    res.status(500).json({ error: "Error al leer Supabase" });
  }
});

app.listen(port, () => {
  console.log(`API de Hoole lista en puerto ${port}`);
});
