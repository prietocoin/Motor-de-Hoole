/* 
   HOO MASTER BACKEND V6.4 - VERSIÓN INDESTRUCTIBLE
   - Restaura el acceso al sitio (Sirve el frontend desde /dist).
   - Registra todos los campos: brecha_bs, precio_eur, categoria.
   - Detiene la divagación del monitor (Filtro Inteligente para n8n).
*/

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de la base de datos (Postgres / Supabase)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

// 1. SERVIR EL FRONTEND (Soluciona el error "Cannot GET /")
// IMPORTANTE: Asegúrate de que tu carpeta de build se llame 'dist'
app.use(express.static(path.join(__dirname, 'dist')));

// 2. ENDPOINT PARA n8n (Guardar Datos)
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
        `, [
            precio_bcv, precio_usdt, precio_eur,
            brecha_bs || "0.00",
            brecha_porcentaje, variacion_mercado, status,
            alerta_audio || false, mostrar_banner || false,
            categoria || 'monitor'
        ]);

        res.json({ message: 'Sincronización exitosa 🦉' });
    } catch (error) {
        console.error('Error insertando en DB:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. ENDPOINT INTELIGENTE (Filtro por Categoría para n8n)
app.get('/precio-actual', async (req, res) => {
    const { categoria } = req.query;
    try {
        let sql = 'SELECT * FROM market_data ';
        if (categoria === 'eq.comparar') {
            sql += "WHERE categoria = 'comparar' ";
        }
        sql += 'ORDER BY id DESC LIMIT 1';

        const result = await pool.query(sql);
        res.json(result.rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. FALLBACK PARA FRONTEND (Asegura que el sitio siempre cargue al refrescar)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 HOO Smart System V6.4 activo en el puerto ${port}`);
});
