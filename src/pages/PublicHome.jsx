import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  InputAdornment,
  TextField,
  Select,
  MenuItem,
  Chip,
  FormControl,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

const Footer = () => (
  <footer style={{ backgroundColor: "#fff", padding: "60px 0 30px", marginTop: "50px", borderTop: "1px solid #eee" }}>
    <div className="container text-center text-md-start">
      <div className="row">
        <div className="col-md-3 mb-4">
          <h6 className="fw-bold mb-3" style={{ color: "#ff5a00" }}>MiRentaAPP</h6>
          <p className="small text-muted">Tu próximo hogar está a un clic de distancia. Seguridad y transparencia en cada contrato.</p>
        </div>
        <div className="col-md-3 mb-4">
          <h6 className="fw-bold mb-3">Servicios</h6>
          <ul className="list-unstyled small text-muted">
            <li className="mb-2">Alquiler de Departamentos</li>
            <li className="mb-2">Publicar Inmueble</li>
            <li className="mb-2">Gestión de Contratos</li>
          </ul>
        </div>
        <div className="col-md-3 mb-4">
          <h6 className="fw-bold mb-3">Legal</h6>
          <ul className="list-unstyled small text-muted">
            <li className="mb-2">Términos y Condiciones</li>
            <li className="mb-2">Política de Privacidad</li>
          </ul>
        </div>
        <div className="col-md-3 mb-4">
          <h6 className="fw-bold mb-3">Síguenos</h6>
          <div className="d-flex gap-3">
            <i className="bi bi-facebook fs-4 text-primary"></i>
            <i className="bi bi-instagram fs-4 text-danger"></i>
            <i className="bi bi-whatsapp fs-4 text-success"></i>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default function PublicHome() {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [habs, setHabs] = useState("");
  const [banos, setBanos] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/admin/propiedades")
      .then(res => setProperties(res.data))
      .catch(err => console.error(err));
  }, []);

  // FUNCIÓN PARA ENVIAR SOLICITUD AL PROPIETARIO
  const enviarSolicitud = async (propiedadId) => {
    const nombre = prompt("Para contactar al propietario, ingresa tu nombre completo:");
    if (!nombre) return;

    try {
      const response = await axios.post("http://localhost:5000/api/solicitudes", {
        propiedad_id: propiedadId,
        nombre_cliente: nombre
      });

      if (response.status === 201 || response.status === 200) {
        alert("✅ Solicitud enviada con éxito. El propietario se contactará contigo pronto.");
      }
    } catch (error) {
      console.error("Error detallado del servidor:", error.response?.data || error.message);
      alert(`❌ Error: ${error.response?.data?.error || "Intenta más tarde"}`);
    }
  };

  const filtered = properties.filter(p => {
    const matchSearch = (p.ciudad || "").toLowerCase().includes(search.toLowerCase()) || 
                        (p.sector || "").toLowerCase().includes(search.toLowerCase());
    const matchPrice = priceTo === "" || Number(p.precio) <= Number(priceTo);
    const matchHabs = habs === "" || Number(p.habitaciones) >= Number(habs);
    const matchBanos = banos === "" || Number(p.banos) >= Number(banos);
    return matchSearch && matchPrice && matchHabs && matchBanos;
  });

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      {/* MODAL BIENVENIDA */}
      {showWelcome && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", zIndex: 3000 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "25px" }}>
              <div className="row g-0">
                <div className="col-md-6 d-none d-md-block">
                  <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800" className="img-fluid h-100" style={{ objectFit: "cover", borderTopLeftRadius: "25px", borderBottomLeftRadius: "25px" }} alt="Home" />
                </div>
                <div className="col-md-6 p-5 text-center">
                  <h2 className="fw-bold mb-3" style={{ color: "#ff5a00" }}>¡Bienvenido!</h2>
                  <p className="text-muted mb-4">Encuentra el lugar ideal para vivir en Ecuador con contratos digitales seguros.</p>
                  <button className="btn btn-lg w-100 text-white shadow-sm" style={{ background: "#ff5a00", borderRadius: "12px" }} onClick={() => setShowWelcome(false)}>Empezar búsqueda</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR / SEARCH BAR */}
      <div className="bg-white border-bottom sticky-top shadow-sm py-3">
        <div className="container">
          <div className="row g-2 align-items-center">
            <div className="col-md-4">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="¿En qué ciudad o sector buscas?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            <div className="col-md-2">
              <FormControl fullWidth>
                <Select value={priceTo} onChange={(e) => setPriceTo(e.target.value)} displayEmpty>
                  <MenuItem value="">Precio Máx.</MenuItem>
                  <MenuItem value="300">USD 300</MenuItem>
                  <MenuItem value="500">USD 500</MenuItem>
                  <MenuItem value="1000">USD 1000</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="col-md-2">
              <FormControl fullWidth>
                <Select value={habs} onChange={(e) => setHabs(e.target.value)} displayEmpty>
                  <MenuItem value="">Habitaciones</MenuItem>
                  <MenuItem value="1">1+ hab</MenuItem>
                  <MenuItem value="2">2+ hab</MenuItem>
                  <MenuItem value="3">3+ hab</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="col-md-2 text-center">
              <Button
                variant="outlined"
                fullWidth
                onClick={() => { setSearch(""); setPriceTo(""); setHabs(""); setBanos(""); }}
              >
                Limpiar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-5">
        <h4 className="fw-bold mb-4">Resultados en Ecuador ({filtered.length})</h4>

        <Grid container spacing={3}>
          {filtered.length === 0 ? (
            <div className="col-12 text-center py-5">
              <img src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" width="100" className="mb-3 opacity-50" alt="Not found" />
              <h5 className="text-muted">No encontramos inmuebles con esos filtros.</h5>
            </div>
          ) : (
            filtered.map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p.id}>
                <Card>
                  <CardMedia
                    component="img"
                    alt={p.sector}
                    height="200"
                    image={p.imagen_url || "https://via.placeholder.com/400x250"}
                    style={{ objectFit: "cover" }}
                  />
                  <CardContent>
                    <Typography variant="h6">{p.sector}</Typography>
                    <Typography color="textSecondary">{p.ciudad}</Typography>
                    <Chip label={`$${p.precio}/mes`} color="primary" style={{ marginTop: "10px" }} />
                    <Button
                      fullWidth
                      color="primary"
                      variant="contained"
                      style={{ marginTop: "15px" }}
                      onClick={() => enviarSolicitud(p.id)}
                    >
                      Contactar
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </div>

      <Footer />
    </div>
  );
}