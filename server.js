const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// 1. Conexión a Supabase (PostgreSQL)
// Render inyectará DATABASE_URL automáticamente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

// 2. Servir archivos estáticos del Frontend (Carpeta public)
app.use(express.static(path.join(__dirname, 'public')));

// 3. API: Obtener precio actual (Para el Monitor HOO)
app.get('/precio-actual', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM market_data ORDER BY id DESC LIMIT 1');
    
    if (result.rows.length > 0) {
      // Devolvemos el registro más reciente con todos los campos Smart
      res.json(result.rows[0]);
    } else {
      res.json({ mensaje: "Esperando actualización de n8n..." });
    }
  } catch (err) {
    console.error("Error en consulta Supabase:", err);
    res.status(500).json({ error: "No se pudo conectar con la base de datos" });
  }
});

// 4. API: Actualizar precios (Recibe el JSON completo de n8n)
app.post('/api/update-prices', async (req, res) => {
  const { 
    precio_bcv, precio_usdt, precio_eur, brecha_porcentaje, 
    variacion_mercado, status, alerta_audio, mostrar_banner 
  } = req.body;

  try {
    const query = `
      INSERT INTO market_data 
      (precio_bcv, precio_usdt, precio_eur, brecha_porcentaje, variacion_mercado, status, alerta_audio, mostrar_banner)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [
      precio_bcv, precio_usdt, precio_eur, brecha_porcentaje, 
      variacion_mercado, status, alerta_audio, mostrar_banner
    ];
    
    await pool.query(query, values);
    res.json({ message: "Datos Smart guardados en Supabase" });
  } catch (err) {
    console.error("Error guardando en Supabase:", err);
    res.status(500).json({ error: "Error de inserción" });
  }
});

// 5. Ruta principal: Sirve el Monitor
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Motor HOO V6.0 operando en el puerto ${port}`);
});
