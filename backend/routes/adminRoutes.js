const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Asegúrate de que la ruta a tu conexión de BD sea correcta

// 1. Obtener TODAS las propiedades (Para el PublicHome)
router.get('/propiedades', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM propiedades ORDER BY id ASC');
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener propiedades:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
});

// 2. OBTENER UNA PROPIEDAD POR ID (Esto es lo que arregla tu pantalla de detalles)
router.get('/propiedades/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Consultamos la tabla 'propiedades' usando el ID que viene de la URL
        const resultado = await pool.query('SELECT * FROM propiedades WHERE id = $1', [id]);
        
        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "Propiedad no encontrada en la base de datos" });
        }
        
        res.json(resultado.rows[0]); // Enviamos solo la propiedad encontrada
    } catch (error) {
        console.error("Error al obtener detalle de propiedad:", error);
        res.status(500).json({ mensaje: "Error en el servidor al consultar el ID" });
    }
});

// 3. Crear una nueva propiedad (Para tu formulario de Publicar)
router.post('/propiedades', async (req, res) => {
    const { sector, ciudad, direccion, precio_mensual, habitaciones, banos, metros_cuadrados, descripcion, imagen_url } = req.body;
    try {
        const nuevaPropiedad = await pool.query(
            'INSERT INTO propiedades (sector, ciudad, direccion, precio_mensual, habitaciones, banos, metros_cuadrados, descripcion, imagen_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [sector, ciudad, direccion, precio_mensual, habitaciones, banos, metros_cuadrados, descripcion, imagen_url]
        );
        res.json(nuevaPropiedad.rows[0]);
    } catch (error) {
        console.error("Error al publicar:", error);
        res.status(500).send("Error al guardar la propiedad");
    }
});

module.exports = router;