const pool = require("../db"); // Asegúrate de que apunte a tu configuración de base de datos

const crearPropiedad = async (req, res) => {
  try {
    const {
      sector, ciudad, direccion, precio_mensual, garantia, alicuota,
      metros_cuadrados, habitaciones, banos, parqueaderos,
      tipo_propiedad, estado_amoblado, incluye_agua, incluye_luz,
      incluye_internet, mascotas, reglas, descripcion, imagen_url, imagenes_extra
    } = req.body;

    const nuevaPropiedad = await pool.query(
      `INSERT INTO propiedades (
        sector, ciudad, direccion, precio_mensual, garantia, alicuota, 
        metros_cuadrados, habitaciones, banos, parqueaderos, 
        tipo_propiedad, estado_amoblado, incluye_agua, incluye_luz, 
        incluye_internet, mascotas, reglas, descripcion, imagen_url, imagenes_extra
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING *`,
      [
        sector, ciudad, direccion, precio_mensual, garantia, alicuota,
        metros_cuadrados, habitaciones, banos, parqueaderos,
        tipo_propiedad, estado_amoblado, incluye_agua, incluye_luz,
        incluye_internet, mascotas, reglas, descripcion, imagen_url, imagenes_extra
      ]
    );

    res.json(nuevaPropiedad.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error al publicar la propiedad");
  }
};

const obtenerPropiedades = async (req, res) => {
  try {
    const todasPropiedades = await pool.query("SELECT * FROM propiedades ORDER BY id DESC");
    res.json(todasPropiedades.rows);
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = { crearPropiedad, obtenerPropiedades };