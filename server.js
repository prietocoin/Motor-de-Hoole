/* HOO MASTER BACKEND V6.8 - MULTI-CURRENCY SUPPORT
    - Filtro categoria 'monitor' por defecto.
    - Nueva ruta /global-rates conectada a Supabase vía Pool.
*/

import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

// Configuración de conexión (Supabase usa DATABASE_URL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Endpoint de salud
app.get('/health', (req, res) => {
    res.json({ status: 'UP', time: new Date().toISOString() });
});

// Endpoint para recibir datos de n8n (Dólar Venezuela)
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
            String(brecha_bs || "0.00").trim(),
            brecha_porcentaje, variacion_mercado, status,
            alerta_audio || false, mostrar_banner || false,
            categoria || 'monitor'
        ]);
        res.json({ message: 'Sincronización exitosa 🦉' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para que la web lea el Dólar Venezuela
app.get('/precio-actual', async (req, res) => {
    const { categoria } = req.query;
    try {
        let sql = "SELECT * FROM market_data WHERE categoria = 'monitor' ";
        if (categoria === 'eq.comparar') {
            sql = "SELECT * FROM market_data WHERE categoria = 'comparar' ";
        }
        const querySuffix = 'ORDER BY id DESC LIMIT 1';
        const result = await pool.query(sql + querySuffix);
        res.json(result.rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// NUEVA RUTA CORREGIDA: /global-rates
// ==========================================
app.get('/global-rates', async (req, res) => {
    try {
        // Consultamos la tabla global_rates usando el Pool (no Supabase JS)
        // Traemos la última fila insertada por n8n
        const result = await pool.query("SELECT * FROM global_rates ORDER BY created_at DESC LIMIT 1");
        
        // Enviamos la lista de resultados a la web
        res.json(result.rows); 
    } catch (err) {
        console.error("Error en global-rates:", err.message);
        res.status(500).json({ error: "Error al leer tasas globales" });
    }
});

// Servir el frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 HOO Smart System V6.8 activo en ${port}`);
});
