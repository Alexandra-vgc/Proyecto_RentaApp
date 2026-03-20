import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import authService from "../services/authService"; 
import MapaInteractiva from "../components/admin/MapaInteractiva";
import { 
  Box, Container, Typography, Button, Grid, Paper, Stack, Divider, 
  CircularProgress, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  List, ListItem, Chip, IconButton, Alert
} from "@mui/material";

import { ArrowBack, Event, LocationOn, Info, Favorite, FavoriteBorder, Map, HelpOutline, Cancel, CheckCircle } from "@mui/icons-material";

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
          const resFav = await axios.get(`http://localhost:5000/api/favoritos/${currentUser.id}`);
          const favsIds = resFav.data.map(f => f.id);
          setIsFavorito(favsIds.includes(parseInt(id)));

          const resCitas = await axios.get(`http://localhost:5000/api/solicitudes/propietario/${currentUser.id}`);
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
      alert("Debes iniciar sesión para guardar favoritos.");
      navigate('/login');
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/favoritos", {
        usuario_id: currentUser.id, propiedad_id: id
      });
      setIsFavorito(res.data.guardado);
    } catch (error) { console.error("Error al guardar favorito"); }
  };

  const allImages = property ? [property.imagen_url, ...(property.imagenes_extra || [])].filter(img => img) : [];

  const handleOpenCita = () => {
    if (!isUserLogged) {
      alert("Debes iniciar sesión para agendar.");
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
      alert("✅ Solicitud enviada");
      setCitaExistente(res.data);
      setOpenModal(false);
    } catch (error) { alert("Error al agendar"); }
  };

  const ejecutarCancelacion = async () => {
    try {
      await axios.put(`http://localhost:5000/api/solicitudes/cancelar/${citaExistente.id}`, { motivo: motivoCancelacion });
      alert("Cita cancelada.");
      setCitaExistente(null);
      setOpenModalCancel(false);
      setMotivoCancelacion("");
    } catch (error) { alert("Error al cancelar"); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!property) return <Typography variant="h5" textAlign="center" mt={10}>No encontrada</Typography>;

  return (
    <Box sx={{ bgcolor: palette.fondoPrincipal, minHeight: "100vh", pb: 5 }}>
      <Container maxWidth={false} sx={{ pt: 2, px: { xs: 2, md: 5 } }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ color: palette.titulos, mb: 1, fontWeight: 'bold', textTransform: 'none' }}>
          Volver al listado
        </Button>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', mb: 2, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
              <img src={allImages[activeImg]} style={{ width: '100%', height: '550px', objectFit: 'cover' }} alt="principal" />
            </Paper>

            <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 1, mb: 3, '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: palette.textoSecundario, borderRadius: 3 } }}>
              {allImages.map((img, i) => (
                <Box key={i} component="img" src={img} onClick={() => setActiveImg(i)} 
                  sx={{ 
                    width: 120, height: 85, objectFit: 'cover', cursor: 'pointer', borderRadius: 2, 
                    transition: '0.3s', border: activeImg === i ? `3px solid ${palette.botonPrincipal}` : '2px solid transparent'
                  }} 
                />
              ))}
            </Stack>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #eee', bgcolor: 'white', mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: palette.titulos, mb: 1 }}>Detalles de la propiedad</Typography>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="body1" sx={{ color: "#444", fontSize: '1.1rem', lineHeight: 1.8, whiteSpace: 'pre-line', mb: 4 }}>
                {property.descripcion || "Sin descripción disponible actualmente."}
              </Typography>

              {property.reglas && (
                <Box sx={{ p: 3, bgcolor: "#fdf8f0", borderRadius: 3, borderLeft: `6px solid ${palette.detallesDorado}`, mb: 4 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1, color: palette.titulos }}><Info /> Reglas y Observaciones</Typography>
                  <Typography variant="body1" sx={{ mt: 1, color: '#555' }}>{property.reglas}</Typography>
                </Box>
              )}

              <Typography variant="h5" sx={{ fontWeight: 900, color: palette.titulos, mb: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Map sx={{ color: palette.botonPrincipal }} /> Ubicación exacta
              </Typography>
              <Box sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #ddd' }}>
                <MapaInteractiva lat={property.lat || property.latitud} lng={property.lng || property.longitud} soloLectura={true} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3} sx={{ position: 'sticky', top: 20 }}>
              <Paper elevation={0} sx={{ p: 4, bgcolor: 'white', borderRadius: 4, border: '1px solid #eee', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative' }}>
                <IconButton 
                  onClick={toggleFavorito}
                  sx={{ position: 'absolute', top: 15, right: 15, bgcolor: '#f8f9fa', '&:hover': { bgcolor: '#f1f1f1' } }}
                >
                  {isFavorito ? <Favorite sx={{ color: '#d32f2f' }} /> : <FavoriteBorder sx={{ color: 'gray' }} />}
                </IconButton>

                <Typography variant="h6" sx={{ color: 'gray', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800, mb: 0.5 }}>
                  {property.tipo_propiedad || "Departamento"} en {property.sector}
                </Typography>
                
                <Typography variant="h3" sx={{ fontWeight: 900, color: palette.botonPrincipal }}>
                  ${property.precio_mensual}
                  <Typography component="span" variant="body1" sx={{ color: 'gray', ml: 0.5 }}>/ mes</Typography>
                </Typography>

                <Box sx={{ mt: 1, mb: 1 }}>
                  <Chip label="Disponible ahora" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 800, fontSize: '0.7rem' }} />
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <List disablePadding>
                  {[
                    { label: "Habitaciones", value: property.habitaciones },
                    { label: "Baños", value: property.banos },
                    { label: "Área Total", value: `${property.metros_cuadrados} m²` },
                    { label: "Garantía", value: `$${property.garantia || 0}` },
                    { label: "Mobiliario", value: property.estado_amoblado },
                  ].map((item, index) => (
                    <ListItem key={index} sx={{ py: 0.6, px: 0, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: "gray" }}>{item.label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: palette.titulos }}>{item.value}</Typography>
                    </ListItem>
                  ))}
                </List>

                {/* BOTÓN MÁS PEQUEÑO */}
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  {!citaExistente ? (
                    <Button 
                      variant="contained" startIcon={<Event />} onClick={handleOpenCita}
                      sx={{ 
                        bgcolor: palette.botonPrincipal, 
                        py: 1,      // Reducido de 1.2 a 1
                        px: 3,      // Reducido de 5 a 3
                        fontWeight: 'bold', 
                        borderRadius: 3, 
                        textTransform: 'none', 
                        fontSize: '0.9rem', // Reducido de 1rem a 0.9rem
                        width: 'auto'       // Cambiado de 100% a auto para que no use todo el ancho
                      }}
                    >
                      Agendar visita
                    </Button>
                  ) : (
                    <Stack spacing={1.5} alignItems="center">
                      <Alert severity="success" variant="outlined" sx={{ py: 0, borderRadius: 2, fontSize: '0.8rem', width: '100%' }}>
                        Cita agendada para esta propiedad.
                      </Alert>
                      <Button 
                        variant="outlined" color="error" startIcon={<Cancel />} onClick={() => setOpenModalCancel(true)}
                        sx={{ py: 0.8, px: 3, borderRadius: 3, fontWeight: 'bold', textTransform: 'none', fontSize: '0.9rem', border: '2px solid', width: 'auto' }}
                      >
                        Cancelar Mi Cita
                      </Button>
                    </Stack>
                  )}
                </Box>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(78, 91, 60, 0.05)', borderRadius: 4, border: '1px dashed #4E5B3C' }}>
                 <Typography variant="caption" sx={{ textAlign: 'center', color: palette.titulos, fontWeight: 600, display: 'block' }}>
                   ¿Tienes dudas? <span style={{ color: palette.botonPrincipal }}>Contacta al propietario.</span>
                 </Typography>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* MODALES */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 5 } }}>
        <DialogTitle sx={{ fontWeight: 900, textAlign: 'center', color: palette.titulos }}>Confirmar Visita</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nombre Completo" fullWidth value={citaForm.nombre_cliente} onChange={(e) => setCitaForm({ ...citaForm, nombre_cliente: e.target.value })} />
            <TextField label="Correo Electrónico" fullWidth value={citaForm.correo_cliente} onChange={(e) => setCitaForm({ ...citaForm, correo_cliente: e.target.value })} />
            <TextField type="date" label="Fecha" InputLabelProps={{ shrink: true }} fullWidth value={citaForm.fecha_cita} onChange={(e) => setCitaForm({ ...citaForm, fecha_cita: e.target.value })} />
            <TextField type="time" label="Hora" InputLabelProps={{ shrink: true }} fullWidth value={citaForm.hora_cita} onChange={(e) => setCitaForm({ ...citaForm, hora_cita: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button onClick={() => setOpenModal(false)} sx={{ color: 'gray' }}>Cancelar</Button>
          <Button variant="contained" onClick={confirmarCita} sx={{ bgcolor: palette.botonPrincipal, px: 4, borderRadius: 3 }}>Agendar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openModalCancel} onClose={() => setOpenModalCancel(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 5 } }}>
        <DialogTitle sx={{ fontWeight: 900, textAlign: 'center', color: '#c62828' }}>¿Cancelar visita?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ textAlign: 'center', mb: 2 }}>Indícanos el motivo de la cancelación.</Typography>
          <TextField label="Motivo" multiline rows={3} fullWidth value={motivoCancelacion} onChange={(e) => setMotivoCancelacion(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button onClick={() => setOpenModalCancel(false)} sx={{ color: 'gray' }}>Volver</Button>
          <Button variant="contained" color="error" onClick={ejecutarCancelacion} sx={{ px: 4, borderRadius: 3 }}>Confirmar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}