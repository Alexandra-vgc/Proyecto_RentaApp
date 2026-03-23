const pool = require("../db");

const crearPropiedad = async (req, res) => {
  try {
    const {
      codigo, sector, ciudad, direccion, precio_mensual, garantia, alicuota,
      metros_cuadrados, habitaciones, banos, parqueaderos,
      tipo_propiedad, estado_amoblado, incluye_agua, incluye_luz,
      incluye_internet, mascotas, reglas, descripcion, 
      imagen_url, imagenes_extra, latitud, longitud
    } = req.body;

    const codigoFinal = codigo || `PROP-${Math.floor(Math.random() * 9000 + 1000)}`;

    const nuevaPropiedad = await pool.query(
      `INSERT INTO propiedades (
        codigo, sector, ciudad, direccion, precio_mensual, garantia, alicuota, 
        metros_cuadrados, habitaciones, banos, parqueaderos, 
        tipo_propiedad, estado_amoblado, incluye_agua, incluye_luz, 
        incluye_internet, mascotas, reglas, descripcion, imagen_url, 
        imagenes_extra, latitud, longitud
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) 
      RETURNING *`,
      [
        codigoFinal, sector, ciudad, direccion, parseFloat(precio_mensual) || 0, parseFloat(garantia) || 0, parseFloat(alicuota) || 0,
        parseFloat(metros_cuadrados) || 0, parseInt(habitaciones) || 0, parseInt(banos) || 0, parseInt(parqueaderos) || 0,
        tipo_propiedad, estado_amoblado, incluye_agua || false, incluye_luz || false, incluye_internet || false, 
        mascotas || false, reglas, descripcion, imagen_url, imagenes_extra, latitud || null, longitud || null
      ]
    );

    res.status(201).json(nuevaPropiedad.rows[0]);
  } catch (err) {
    console.error("❌ Error al crear propiedad:", err.message);
    res.status(500).json({ error: "Error al publicar: " + err.message });
  }
};

const actualizarPropiedad = async (req, res) => {
  const { id } = req.params;
  try {
    const {
      sector, ciudad, direccion, precio_mensual, garantia, alicuota,
      metros_cuadrados, habitaciones, banos, parqueaderos,
      tipo_propiedad, estado_amoblado, incluye_agua, incluye_luz,
      incluye_internet, mascotas, reglas, descripcion, 
      imagen_url, imagenes_extra, latitud, longitud
    } = req.body;

    const propiedadActualizada = await pool.query(
      `UPDATE propiedades SET 
        sector = $1, ciudad = $2, direccion = $3, precio_mensual = $4, garantia = $5, alicuota = $6,
        metros_cuadrados = $7, habitaciones = $8, banos = $9, parqueaderos = $10,
        tipo_propiedad = $11, estado_amoblado = $12, incluye_agua = $13, incluye_luz = $14,
        incluye_internet = $15, mascotas = $16, reglas = $17, descripcion = $18, 
        imagen_url = $19, imagenes_extra = $20, latitud = $21, longitud = $22
      WHERE id = $23 RETURNING *`,
      [
        sector, ciudad, direccion, parseFloat(precio_mensual) || 0, parseFloat(garantia) || 0, parseFloat(alicuota) || 0,
        parseFloat(metros_cuadrados) || 0, parseInt(habitaciones) || 0, parseInt(banos) || 0, parseInt(parqueaderos) || 0,
        tipo_propiedad, estado_amoblado, incluye_agua || false, incluye_luz || false, incluye_internet || false, 
        mascotas || false, reglas, descripcion, imagen_url, imagenes_extra, latitud || null, longitud || null,
        id 
      ]
    );

    res.json(propiedadActualizada.rows[0]);
  } catch (err) {
    console.error("❌ Error al actualizar propiedad:", err.message);
    res.status(500).json({ error: "Error al actualizar: " + err.message });
  }
};

const obtenerPropiedades = async (req, res) => {
  try {
    const todasPropiedades = await pool.query("SELECT * FROM propiedades ORDER BY id DESC");
    res.json(todasPropiedades.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener propiedades" });
  }
};

const obtenerPropiedadPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const propiedad = await pool.query("SELECT * FROM propiedades WHERE id = $1", [id]);
    if (propiedad.rows.length === 0) return res.status(404).json({ error: "Propiedad no encontrada" });
    res.json(propiedad.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const eliminarPropiedad = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM propiedades WHERE id = $1", [id]);
    res.json({ message: "Propiedad eliminada" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar" });
  }
};

module.exports = { 
    crearPropiedad, obtenerPropiedades, obtenerPropiedadPorId, actualizarPropiedad, eliminarPropiedad
};