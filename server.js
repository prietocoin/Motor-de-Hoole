/* 
   HOO MASTER BACKEND V6.6 - VERSIÓN ESM BLINDADA
   - Suministra el Frontend desde /dist (Fix Not Found).
   - Soporta filtros de categoría para n8n.
   - Registra Brecha BS y Alertas.
*/

import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Configuración de __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Configuración de la base de datos (Postgres / Supabase)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

// 1. SERVIR EL FRONTEND (Soluciona el error "Not Found")
console.log('Ruta estática:', path.join(__dirname, 'dist'));
app.use(express.static(path.join(__dirname, 'dist')));

// Ruta de Salud para diagnóstico
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        dirname: __dirname,
        time: new Date().toISOString()
    });
});

// Ruta de Depuración de Archivos (Para ver qué hay en Render)
app.get('/debug-files', (req, res) => {
    try {
        const distPath = path.join(__dirname, 'dist');
        const exists = fs.existsSync(distPath);
        const files = exists ? fs.readdirSync(distPath) : 'LA CARPETA dist NO EXISTE';
        res.json({
            currentDir: __dirname,
            distPath: distPath,
            distExists: exists,
            distFiles: files,
            rootFiles: fs.readdirSync(__dirname)
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

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
        console.error('Error DB:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. ENDPOINT INTELIGENTE (Escucha filtros de n8n)
app.get('/precio-actual', async (req, res) => {
    const { categoria } = req.query;
    try {
        let sql = 'SELECT * FROM market_data ';
        if (categoria === 'eq.comparar') {
            sql += "WHERE categoria = 'comparar' ";
        }
        const querySuffix = 'ORDER BY id DESC LIMIT 1';

        const result = await pool.query(sql + querySuffix);
        res.json(result.rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. FALLBACK PARA FRONTEND (Asegura ruteo interno)
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error enviando index.html:', err);
            res.status(404).send('HOO Error: El archivo index.html no existe en el servidor. Verifica el Build en Render.');
        }
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 HOO Smart System V6.6 (ESM) activo en puerto ${port}`);
});
