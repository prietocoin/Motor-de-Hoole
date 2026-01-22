/* 
   HOO MASTER BACKEND V6.7 - CATEGORY FILTERING FIX
   - Fuerza filtro categoria = 'monitor' por defecto en /precio-actual.
   - Soporta eq.comparar específicamente para n8n trends.
*/

import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Endpoint /health
app.get('/health', (req, res) => {
    res.json({ status: 'UP', time: new Date().toISOString() });
});

// Endpoint /api/update-prices
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

// Endpoint /precio-actual (CORREGIDO)
app.get('/precio-actual', async (req, res) => {
    const { categoria } = req.query;
    try {
        // Blindaje: Por defecto solo mostramos la categoría 'monitor'
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
// Ruta igual a la de precio-actual
app.get('/global-rates', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('global_rates') // Nombre de la tabla en Supabase
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    res.json(data); // Envía los datos a la web
  } catch (error) {
    res.status(500).send('Error');
  }
});
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 HOO Smart System V6.7 activo en ${port}`);
});
