const pool = require("../db");

const crearPropiedad = async (req, res) => {
  try {
    const {
      codigo, // ✅ Añadido: Evita el error de "valor nulo en columna codigo"
      sector, ciudad, direccion, precio_mensual, garantia, alicuota,
      metros_cuadrados, habitaciones, banos, parqueaderos,
      tipo_propiedad, estado_amoblado, incluye_agua, incluye_luz,
      incluye_internet, mascotas, reglas, descripcion, imagen_url, 
      imagenes_extra, 
      latitud, longitud 
    } = req.body;

    const nuevaPropiedad = await pool.query(
      `INSERT INTO propiedades (
        codigo, sector, ciudad, direccion, precio_mensual, garantia, alicuota, 
        metros_cuadrados, habitaciones, banos, parqueaderos, 
        tipo_propiedad, estado_amoblado, incluye_agua, incluye_luz, 
        incluye_internet, mascotas, reglas, descripcion, imagen_url, 
        imagenes_extra, latitud, longitud
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) 
      RETURNING *`,
      [
        codigo || `PROP-${Math.floor(Math.random() * 9000 + 1000)}`, // ✅ Si no viene código, genera uno rápido
        sector, ciudad, direccion, 
        parseFloat(precio_mensual) || 0, 
        parseFloat(garantia) || 0, 
        parseFloat(alicuota) || 0,
        parseFloat(metros_cuadrados) || 0, 
        parseInt(habitaciones) || 0, 
        parseInt(banos) || 0, 
        parseInt(parqueaderos) || 0,
        tipo_propiedad, estado_amoblado, 
        incluye_agua || false, incluye_luz || false, incluye_internet || false, mascotas || false, 
        reglas, descripcion, imagen_url, 
        imagenes_extra, 
        latitud || null, // ✅ Ahora sí está definida y se enviará correctamente
        longitud || null
      ]
    );

    res.json(nuevaPropiedad.rows[0]);
  } catch (err) {
    console.error("❌ Error al crear propiedad:", err.message);
    res.status(500).json({ error: "Error al publicar: " + err.message });
  }
};

const obtenerPropiedades = async (req, res) => {
  try {
    const todasPropiedades = await pool.query("SELECT * FROM propiedades ORDER BY id DESC");
    res.json(todasPropiedades.rows);
  } catch (err) {
    console.error("❌ Error al obtener todas:", err.message);
    res.status(500).json({ error: "Error al obtener propiedades" });
  }
};

const obtenerPropiedadPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const propiedad = await pool.query("SELECT * FROM propiedades WHERE id = $1", [id]);
    if (propiedad.rows.length === 0) {
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }
    res.json(propiedad.rows[0]);
  } catch (err) {
    console.error("❌ Error al obtener por ID:", err.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

module.exports = { 
    crearPropiedad, 
    obtenerPropiedades, 
    obtenerPropiedadPorId 
};