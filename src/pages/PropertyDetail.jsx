import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import authService from "../services/authService"; 
import MapaInteractiva from "../components/admin/MapaInteractiva";
import { 
  Box, Container, Typography, Button, Grid, Paper, Stack, Divider, 
  CircularProgress, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  List, ListItem, Chip, IconButton, Tooltip
} from "@mui/material";
import { ArrowBack, Event, LocationOn, Info, Favorite, FavoriteBorder, Cancel, HelpOutline, CheckCircleOutline} from "@mui/icons-material";

const palette = { 
  fondoPrincipal: "#E8DCCB", 
  titulos: "#4E5B3C", 
  botonPrincipal: "#C66A3D", 
  textoSecundario: "#BFA58A", 
  detallesDorado: "#C9A227" 
};

export default function PropertyDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  // --- NUEVOS ESTADOS PARA CANCELACIÓN ---
  const [citaExistente, setCitaExistente] = useState(null);
  const [openModalCancel, setOpenModalCancel] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");

  const [citaForm, setCitaForm] = useState({
    nombre_cliente: "", correo_cliente: "", fecha_cita: "", hora_cita: ""
  });

  const [currentUser] = useState(authService.getCurrentUser());
  const isUserLogged = !!currentUser;
  const [isFavorito, setIsFavorito] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resProp = await axios.get(`http://localhost:5000/api/admin/propiedades/${id}`);
        setProperty(resProp.data);

        if (isUserLogged) {
          // Cargar favoritos
          const resFav = await axios.get(`http://localhost:5000/api/favoritos/${currentUser.id}`);
          const favsIds = resFav.data.map(f => f.id);
          setIsFavorito(favsIds.includes(parseInt(id)));

          // ✅ VERIFICAR SI YA TIENE UNA CITA PARA ESTA PROPIEDAD
          const resCitas = await axios.get(`http://localhost:5000/api/solicitudes/propietario/${currentUser.id}`);
          // Filtramos las citas de este usuario para esta propiedad específica que no estén canceladas
          const citaFound = resCitas.data.find(c => c.propiedad_id === parseInt(id) && c.correo_cliente === currentUser.email && c.estado !== 'cancelada');
          setCitaExistente(citaFound || null);
        }
      } catch (err) {
        console.error("Error al cargar datos:", err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchData();
  }, [id, isUserLogged, currentUser?.id, currentUser?.email]);

  const toggleFavorito = async () => {
    if (!isUserLogged) {
      alert("Debes iniciar sesión o registrarte para guardar favoritos.");
      navigate('/login');
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/favoritos", {
        usuario_id: currentUser.id,
        propiedad_id: id
      });
      setIsFavorito(res.data.guardado);
    } catch (error) {
      console.error("Error al guardar favorito");
    }
  };

  const allImages = property ? [property.imagen_url, ...(property.imagenes_extra || [])].filter(img => img) : [];

  const handleOpenCita = () => {
    if (!isUserLogged) {
      alert("Debes iniciar sesión para agendar una visita.");
      navigate('/login');
      return;
    }
    setCitaForm({ ...citaForm, nombre_cliente: currentUser.nombre, correo_cliente: currentUser.email });
    setOpenModal(true);
  };

  const confirmarCita = async () => {
    if (!citaForm.nombre_cliente || !citaForm.correo_cliente || !citaForm.fecha_cita || !citaForm.hora_cita) {
      alert("Completa todos los campos"); return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/solicitudes", {
        propiedad_id: id, arrendatario_id: currentUser?.id || null,
        ...citaForm, estado: "pendiente"
      });
      alert("✅ Solicitud enviada con éxito");
      setCitaExistente(res.data); // Guardamos la cita recién creada
      setOpenModal(false);
    } catch (error) { alert("Error al agendar"); }
  };

  // ✅ NUEVA FUNCIÓN PARA CANCELAR CITA
  const ejecutarCancelacion = async () => {
  // ... (validaciones de motivo)
  try {
    // Asegúrate de que la ruta coincida con el backend (/api/solicitudes/cancelar/)
    await axios.put(`http://localhost:5000/api/solicitudes/cancelar/${citaExistente.id}`, {
      motivo: motivoCancelacion
    });
    alert("Cita cancelada correctamente.");
    setCitaExistente(null);
    setOpenModalCancel(false);
  } catch (error) {
    alert("Error al cancelar la cita");
  }
};

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!property) return <Typography variant="h5" textAlign="center" mt={10}>Propiedad no encontrada</Typography>;

  return (
    <Box sx={{ bgcolor: palette.fondoPrincipal, minHeight: "100vh", pb: 10 }}>
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ color: palette.titulos, mb: 2, fontWeight: 'bold' }}>
          Volver al listado
        </Button>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', mb: 2, border: '1px solid #ddd' }}>
              <img src={allImages[activeImg]} style={{ width: '100%', height: '480px', objectFit: 'cover' }} alt="principal" />
            </Paper>

            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 2, mb: 3 }}>
              {allImages.map((img, i) => (
                <Box key={i} component="img" src={img} onClick={() => setActiveImg(i)} 
                  sx={{ 
                    width: 100, height: 75, objectFit: 'cover', cursor: 'pointer', borderRadius: 1, 
                    border: activeImg === i ? `3px solid ${palette.botonPrincipal}` : '1px solid #ddd' 
                  }} 
                />
              ))}
            </Stack>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #eee', bgcolor: 'white' }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#2c3e50', mb: 2 }}>
                {property.sector || "Lujoso Departamento"}, En Renta
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ color: "#555", lineHeight: 1.8, whiteSpace: 'pre-line', mb: 3 }}>
                {property.descripcion || "Sin descripción disponible actualmente."}
              </Typography>

              {property.reglas && (
                <Box sx={{ p: 2, bgcolor: "#fdf5e6", borderRadius: 1, borderLeft: `5px solid ${palette.detallesDorado}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info fontSize="small" /> Reglas y Observaciones:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{property.reglas}</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 4, bgcolor: 'white', borderRadius: 2, mb: 3, border: '1px solid #eee', position: 'relative' }}>
              <IconButton 
                onClick={toggleFavorito}
                sx={{ 
                  position: 'absolute', top: 15, right: 15, 
                  bgcolor: '#f5f5f5', 
                  '&:hover': { bgcolor: '#e0e0e0', transform: 'scale(1.1)' },
                  transition: 'all 0.2s'
                }}
              >
                {isFavorito ? <Favorite sx={{ color: '#d32f2f' }} /> : <FavoriteBorder sx={{ color: 'gray' }} />}
              </IconButton>

              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, pr: 5 }}>
                {property.tipo_propiedad || "departamento"} de {property.habitaciones} hab. de {property.metros_cuadrados}m² en {property.ciudad}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: palette.botonPrincipal }}>
                ${property.precio_mensual}
              </Typography>
              <Typography variant="caption" sx={{ color: "gray", fontWeight: 'bold', mb: 2 }}>ALQUILER MENSUAL</Typography>
              <Box sx={{ mb: 2 }}>
                <Chip label="Disponible" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }} />
              </Box>
              <Typography variant="body2" sx={{ color: "gray", display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOn sx={{ fontSize: 18 }} /> {property.direccion || property.sector}, {property.ciudad}
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ bgcolor: 'white', p: 1, borderRadius: 2, border: '1px solid #eee' }}>
              <List disablePadding>
                {[
                  { label: "Habitaciones", value: property.habitaciones },
                  { label: "Baños", value: property.banos },
                  { label: "Tamaño", value: `${property.metros_cuadrados} m²` },
                  { label: "Garantía", value: `$${property.garantia || 0}` },
                  { label: "Mobiliario", value: property.estado_amoblado },
                ].map((item, index, arr) => (
                  <Box key={index}>
                    <ListItem sx={{ py: 1.5, px: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: "#555" }}>{item.label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{item.value}</Typography>
                    </ListItem>
                    {index < arr.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Paper>

            <Box sx={{ mt: 3, mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: palette.titulos, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" /> Ubicación del inmueble
              </Typography>
              <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #eee' }}>
                {property.latitud && property.longitud ? (
                  <MapaInteractiva lat={Number(property.latitud)} lng={Number(property.longitud)} soloLectura={true} />
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                    <Typography variant="caption" color="textSecondary">Ubicación geográfica no disponible.</Typography>
                  </Box>
                )}
              </Paper>
            </Box>

            {/* --- LÓGICA DE BOTÓN DE CITA --- */}
            {!citaExistente ? (
              <Button 
                variant="contained" fullWidth startIcon={<Event />} onClick={handleOpenCita}
                sx={{ bgcolor: palette.botonPrincipal, mt: 3, py: 2, fontWeight: 'bold', borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#a35732' } }}
              >
                Agendar visita
              </Button>
            ) : (
              <Paper variant="outlined" sx={{ p: 2, mt: 3, borderColor: '#ffcdd2', bgcolor: '#fff5f5', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 700, color: '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <CheckCircleOutline fontSize="small" /> Tienes una visita programada
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 2, color: '#666' }}>
                  Fecha: {new Date(citaExistente.fecha_cita).toLocaleDateString()} a las {citaExistente.hora_cita}
                </Typography>
                <Button 
                  variant="outlined" fullWidth color="error" startIcon={<Cancel />} onClick={() => setOpenModalCancel(true)}
                  sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 2 }}
                >
                  Cancelar Visita
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* MODAL AGENDAR */}
      {/* MODAL AGENDAR - ACTUALIZADO PARA PRUEBAS */}
<Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
  <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', color: palette.titulos }}>Confirmar Visita</DialogTitle>
  <DialogContent>
    <Stack spacing={3} sx={{ mt: 1 }}>
      {/* Quitamos el 'disabled' para que puedas escribir y probar libremente */}
      <TextField 
        label="Nombre" 
        fullWidth 
        value={citaForm.nombre_cliente} 
        onChange={(e) => setCitaForm({ ...citaForm, nombre_cliente: e.target.value })} 
      />
      <TextField 
        label="Correo" 
        fullWidth 
        value={citaForm.correo_cliente} 
        onChange={(e) => setCitaForm({ ...citaForm, correo_cliente: e.target.value })} 
      />
      <TextField 
        type="date" 
        label="Fecha" 
        InputLabelProps={{ shrink: true }} 
        fullWidth 
        value={citaForm.fecha_cita} 
        onChange={(e) => setCitaForm({ ...citaForm, fecha_cita: e.target.value })} 
      />
      <TextField 
        type="time" 
        label="Hora" 
        InputLabelProps={{ shrink: true }} 
        fullWidth 
        value={citaForm.hora_cita} 
        onChange={(e) => setCitaForm({ ...citaForm, hora_cita: e.target.value })} 
      />
    </Stack>
  </DialogContent>
  <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
    <Button onClick={() => setOpenModal(false)} sx={{ color: 'gray' }}>Volver</Button>
    <Button variant="contained" onClick={confirmarCita} sx={{ bgcolor: palette.botonPrincipal, px: 4, borderRadius: 2 }}>Confirmar Cita</Button>
  </DialogActions>
</Dialog>
      {/* MODAL CANCELAR (PROFESIONAL) */}
      <Dialog open={openModalCancel} onClose={() => setOpenModalCancel(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', color: '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <HelpOutline /> ¿Cancelar tu visita?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ textAlign: 'center', color: '#666', mb: 3 }}>
            Lamentamos que no puedas asistir. Por favor, indícanos el motivo para informar al propietario.
          </Typography>
          <TextField 
            label="Motivo de cancelación" 
            placeholder="Ej: Cambio de planes, emergencia médica..." 
            multiline rows={3} fullWidth 
            value={motivoCancelacion} 
            onChange={(e) => setMotivoCancelacion(e.target.value)} 
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setOpenModalCancel(false)} sx={{ color: 'gray' }}>Cerrar</Button>
          <Button variant="contained" color="error" onClick={ejecutarCancelacion} sx={{ px: 4, borderRadius: 2 }}>Confirmar Cancelación</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}