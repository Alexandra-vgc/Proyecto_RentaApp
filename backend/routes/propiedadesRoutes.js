const express = require("express");
const router = express.Router();
const { crearPropiedad, obtenerPropiedades } = require("../controllers/propiedadesController");

router.post("/", crearPropiedad);
router.get("/", obtenerPropiedades);

module.exports = router;