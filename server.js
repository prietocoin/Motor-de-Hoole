/* 
   HOO MASTER BACKEND V6.32 - EDICIÓN INTELIGENTE
   - Soporta filtros de categoría (categoria=eq.comparar).
   - Registra Brecha BS y Alertas.
   - Detiene la divagación del monitor.
*/

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

// 1. ENDPOINT PARA n8n (Guardar Datos)
app.post('/api/update-prices', async (req, res) => {
    const { 
        precio_bcv, precio_usdt, precio_eur, brecha_bs, 
        brecha_porcentaje, variacion_mercado, status, 
        alerta_audio, mostrar_banner, categoria 
    } = req.body;

    try {
        await pool.query(`
            INSERT INTO market_data 
            (precio_bcv, precio_usdt, precio_eur, brecha_bs, brecha_porcentaje, variacion_mercado, status, alerta_audio, mostrar_banner, categoria)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [precio_bcv, precio_usdt, precio_eur, brecha_bs, brecha_porcentaje, variacion_mercado, status, alerta_audio, mostrar_banner, categoria]);
        
        res.json({ message: 'Sincronización exitosa 🦉' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. ENDPOINT INTELIGENTE (Escucha filtros de n8n)
app.get('/precio-actual', async (req, res) => {
    const { categoria } = req.query; // Captura el parámetro 'categoria'
    try {
        let query = 'SELECT * FROM market_data ';
        let params = [];

        // Si n8n manda 'eq.comparar', filtramos
        if (categoria === 'eq.comparar') {
            query += "WHERE categoria = 'comparar' ";
        }

        query += 'ORDER BY id DESC LIMIT 1';
        
        const result = await pool.query(query, params);
        res.json(result.rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 HOO System V6.32 en puerto ${port}`);
});
