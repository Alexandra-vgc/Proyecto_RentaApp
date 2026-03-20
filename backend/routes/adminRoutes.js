const express = require('express');
const router = express.Router();
// ✅ Importamos el controlador que tiene toda la lógica de los 23 campos
const propiedadesController = require('../controllers/propiedadesController'); 

// 1. OBTENER TODAS LAS PROPIEDADES
// Se usa para el PublicHome y la sección de "Más Populares"
router.get('/propiedades', propiedadesController.obtenerPropiedades);

// 2. OBTENER UNA PROPIEDAD POR ID
// Este es el que hace que funcione tu pantalla de "Ver Detalles"
router.get('/propiedades/:id', propiedadesController.obtenerPropiedadPorId);

// 3. CREAR UNA NUEVA PROPIEDAD
// Este recibe TODO: sector, precio, habitaciones, imagen_url, latitud, longitud, etc.
router.post('/propiedades', propiedadesController.crearPropiedad);

// 4. (OPCIONAL) Si necesitas actualizar o eliminar en el futuro, los añades aquí:
// router.put('/propiedades/:id', propiedadesController.actualizarPropiedad);
// router.delete('/propiedades/:id', propiedadesController.eliminarPropiedad);

module.exports = router;