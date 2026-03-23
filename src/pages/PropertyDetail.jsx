import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import authService from "../services/authService"; 
import MapaInteractiva from "../components/admin/MapaInteractiva";

import { 
  Box, Container, Typography, Button, Grid, Paper, Stack, Divider, 
  CircularProgress, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  List, ListItem, Chip, IconButton, Alert, Link
} from "@mui/material";

// ✅ Iconos limpios y profesionales
import { 
  ArrowBack, Event, LocationOn, Info, Favorite, FavoriteBorder, Map, 
  Cancel, CheckCircle, Bed, Bathtub, Straighten, AttachMoney, Weekend,
  WaterDrop, EmojiObjects, Wifi, Pets, Facebook, Instagram, WhatsApp, Email, Phone,
  Description, Lightbulb, Security, Pool, FitnessCenter, Elevator
} from "@mui/icons-material";

const palette = { 
  fondoPrincipal: "#E8DCCB", 
  titulos: "#4E5B3C", 
  botonPrincipal: "#C66A3D", 
  textoSecundario: "#BFA58A", 
  detallesDorado: "#C9A227" 
};

// =================================================================
// ✅ FOOTER INCLUIDO AQUÍ MISMO PARA EVITAR ERRORES DE RUTA
// =================================================================
const FooterLocal = () => (
  <Box component="footer" sx={{ bgcolor: "white", pt: 10, pb: 6, mt: 10, borderTop: `2px solid ${palette.detallesDorado}` }}>
    <Container maxWidth="lg">
      <Grid container spacing={5}>
        <Grid item xs={12} md={4}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: palette.titulos, mb: 3, fontFamily: 'serif' }}>MiRentaAPP</Typography>
          <Typography variant="body1" sx={{ color: palette.textoSecundario, lineHeight: 1.8, fontSize: '1.1rem', maxWidth: 350 }}>
            La plataforma líder en Ecuador para la gestión digital de arriendos. Conectamos sueños con hogares de forma segura y transparente.
          </Typography>
        </Grid>
        <Grid item xs={6} md={2}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: palette.titulos, fontSize: '1.2rem' }}>Navegación</Typography>
          <Stack spacing={2}>
            <Link href="#" underline="none" sx={{ color: palette.textoSecundario, fontSize: '1.05rem', '&:hover': { color: palette.botonPrincipal } }}>Departamentos</Link>
            <Link href="#" underline="none" sx={{ color: palette.textoSecundario, fontSize: '1.05rem', '&:hover': { color: palette.botonPrincipal } }}>Publicar Inmueble</Link>
            <Link href="#" underline="none" sx={{ color: palette.textoSecundario, fontSize: '1.05rem', '&:hover': { color: palette.botonPrincipal } }}>Sobre Nosotros</Link>
          </Stack>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: palette.titulos, fontSize: '1.2rem' }}>Contacto</Typography>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Email sx={{ color: palette.detallesDorado, fontSize: 24 }} />
              <Typography sx={{ color: palette.textoSecundario, fontSize: '1.05rem' }}>mirentaapp@gmail.com</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Phone sx={{ color: palette.detallesDorado, fontSize: 24 }} />
              <Typography sx={{ color: palette.textoSecundario, fontSize: '1.05rem' }}>+593 985475789</Typography>
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: palette.titulos, fontSize: '1.2rem' }}>Síguenos</Typography>
          <Stack direction="row" spacing={2.5}>
            <IconButton component="a" href="https://www.facebook.com" target="_blank" sx={{ bgcolor: palette.fondoAlterno, color: palette.titulos, '&:hover': { bgcolor: palette.titulos, color: 'white' } }}>
              <Facebook sx={{ fontSize: 30 }} />
            </IconButton>
            <IconButton component="a" href="https://www.instagram.com" target="_blank" sx={{ bgcolor: palette.fondoAlterno, color: palette.botonPrincipal, '&:hover': { bgcolor: palette.botonPrincipal, color: 'white' } }}>
              <Instagram sx={{ fontSize: 30 }} />
            </IconButton>
            <IconButton component="a" href="https://wa.me/593985475789" target="_blank" sx={{ bgcolor: palette.fondoAlterno, color: '#25D366', '&:hover': { bgcolor: '#25D366', color: 'white' } }}>
              <WhatsApp sx={{ fontSize: 30 }} />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
      <Divider sx={{ my: 6, borderColor: palette.fondoAlterno }} />
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="body2" sx={{ color: palette.textoSecundario, fontWeight: 700, fontSize: '1rem' }}>
          © 2026 MiRentaAPP. Desarrollado por Nathasha Machado y Vanessa Guaranda - Estudiantes de Software
        </Typography>
      </Box>
    </Container>
  </Box>
);

// =================================================================
// COMPONENTE PRINCIPAL
// =================================================================
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
    nombre_cliente: "", 
    correo_cliente: "", 
    fecha_cita: "", 
    hora_cita: "",
    mensaje: "¡Hola! Quiero que se comuniquen conmigo por este inmueble vi en MiRentaAPP."
  });

  const [currentUser] = useState(authService.getCurrentUser());
  const isUserLogged = !!currentUser;
  const [isFavorito, setIsFavorito] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resProp = await axios.get(`http://localhost:5000/api/admin/propiedades/${id}`);
        
        console.log("Datos de la propiedad desde BD:", resProp.data);
        
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
        propiedad_id: id, 
        arrendatario_id: currentUser?.id || null,
        ...citaForm,
        estado: "pendiente"
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

  const tipoOperacionLabel = property.operacion ? property.operacion.toUpperCase() : "ALQUILER";

  return (
    <Box sx={{ bgcolor: palette.fondoPrincipal, minHeight: "100vh" }}>
      <Container maxWidth={false} sx={{ pt: 2, px: { xs: 2, md: 5 }, pb: 5, maxWidth: '1400px' }}>
        
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ color: palette.titulos, mb: 2, fontWeight: 'bold', textTransform: 'none' }}>
          Volver al listado
        </Button>

        <Grid container spacing={4} alignItems="flex-start" sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          
          <Grid item xs={12} md={8} sx={{ minWidth: 0, width: '100%', overflow: 'hidden' }}>
            
            <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', mb: 2, bgcolor: '#f0f0f0' }}>
              <img src={allImages[activeImg]} style={{ width: '100%', height: '500px', objectFit: 'cover', display: 'block' }} alt="principal" />
            </Paper>

            <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1, mb: 4, width: '100%', '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: palette.textoSecundario, borderRadius: 3 } }}>
              {allImages.map((img, i) => (
                <Box key={i} component="img" src={img} onClick={() => setActiveImg(i)} 
                  sx={{ 
                    width: 130, height: 90, minWidth: 130, objectFit: 'cover', cursor: 'pointer', borderRadius: 3, 
                    transition: '0.3s', border: activeImg === i ? `4px solid ${palette.botonPrincipal}` : '2px solid transparent',
                    boxShadow: activeImg === i ? '0 4px 10px rgba(0,0,0,0.2)' : 'none'
                  }} 
                />
              ))}
            </Stack>

            <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, bgcolor: 'white', mb: 3 }}>
              
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'black', mb: 4 }}>
                Conoce más sobre este inmueble
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, borderBottom: `3px solid ${palette.botonPrincipal}`, pb: 0.5, mb: 2 }}>
                  <Description sx={{ color: palette.titulos, fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: palette.titulos }}>
                    Características generales
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: "#333", fontSize: '1.05rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {property.descripcion || "Sin descripción disponible."}
                </Typography>
              </Box>

              {property.reglas && (
                <Box sx={{ p: 3, bgcolor: "#fffde7", borderRadius: 3, borderLeft: `6px solid ${palette.detallesDorado}`, mb: 4 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1, color: palette.titulos }}>
                    <Info /> Reglas y Observaciones
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, color: '#555', wordBreak: 'break-word' }}>{property.reglas}</Typography>
                </Box>
              )}

              <Divider sx={{ my: 4 }} />

              <Typography variant="h5" sx={{ fontWeight: 900, color: palette.titulos, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Map sx={{ color: palette.botonPrincipal }} /> Ubicación exacta
              </Typography>
              <Box sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #ddd', height: '400px', width: '100%', mb: 5 }}>
                <MapaInteractiva lat={property.lat || property.latitud} lng={property.lng || property.longitud} soloLectura={true} />
              </Box>

              <Divider sx={{ my: 5, borderColor: '#eee' }} />

              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, borderBottom: `3px solid ${palette.botonPrincipal}`, pb: 0.5, mb: 3 }}>
                <Lightbulb sx={{ color: palette.titulos, fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: palette.titulos }}>
                  Servicios y Extras
                </Typography>
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#666', mb: 2 }}>Servicios Incluidos</Typography>
                  <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ rowGap: 1.5 }}>
                    {property.incluye_agua && <Chip icon={<WaterDrop sx={{ color: '#555 !important' }} />} label="Agua" variant="outlined" sx={{ borderRadius: 4, fontWeight: 600, color: '#333', borderColor: '#ccc', bgcolor: 'white' }} />}
                    {property.incluye_luz && <Chip icon={<EmojiObjects sx={{ color: '#555 !important' }} />} label="Luz" variant="outlined" sx={{ borderRadius: 4, fontWeight: 600, color: '#333', borderColor: '#ccc', bgcolor: 'white' }} />}
                    {property.incluye_internet && <Chip icon={<Wifi sx={{ color: '#555 !important' }} />} label="Wi-Fi" variant="outlined" sx={{ borderRadius: 4, fontWeight: 600, color: '#333', borderColor: '#ccc', bgcolor: 'white' }} />}
                    {!property.incluye_agua && !property.incluye_luz && !property.incluye_internet && (
                      <Typography variant="body2" color="textSecondary">No se especificaron.</Typography>
                    )}
                  </Stack>
                </Grid>
              </Grid>

            </Paper>
          </Grid>

          <Grid item xs={12} md={4} sx={{ minWidth: { xs: '100%', md: '350px' }, maxWidth: { md: '400px' }, flexShrink: 0, position: { xs: 'static', md: 'sticky' }, top: 24 }}>
            <Stack spacing={3}>
              <Paper elevation={4} sx={{ p: 4, bgcolor: 'white', borderRadius: 4, position: 'relative' }}>
                <IconButton onClick={toggleFavorito} sx={{ position: 'absolute', top: 15, right: 15, bgcolor: '#f8f9fa', '&:hover': { bgcolor: '#f1f1f1' } }}>
                  {isFavorito ? <Favorite sx={{ color: '#d32f2f' }} /> : <FavoriteBorder sx={{ color: 'gray' }} />}
                </IconButton>
                <Typography variant="overline" sx={{ color: 'gray', fontWeight: 800, letterSpacing: 1, display: 'block', mb: 1 }}>
                  {property.tipo_propiedad || "DEPARTAMENTO"} • EN {tipoOperacionLabel}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: palette.botonPrincipal, mb: 1 }}>
                  ${Number(property.precio_mensual).toFixed(2)}
                  <Typography component="span" variant="body1" sx={{ color: 'gray', ml: 1, fontWeight: 'normal' }}>{tipoOperacionLabel === "VENTA" ? "" : "/ mes"}</Typography>
                </Typography>
                <Box sx={{ mb: 3 }}><Chip label={property.estado?.toLowerCase() === 'ocupado' ? 'Ocupado' : 'Disponible ahora'} size="small" sx={{ bgcolor: property.estado?.toLowerCase() === 'ocupado' ? '#ffebee' : '#e8f5e9', color: property.estado?.toLowerCase() === 'ocupado' ? '#c62828' : '#2e7d32', fontWeight: 800, fontSize: '0.75rem' }} /></Box>
                <Divider sx={{ my: 2 }} />
                <List disablePadding>
                  {[
                    { label: "Habitaciones", value: property.habitaciones, icon: <Bed fontSize="small" /> },
                    { label: "Baños", value: property.banos, icon: <Bathtub fontSize="small" /> },
                    { label: "Área Total", value: `${property.metros_cuadrados} m²`, icon: <Straighten fontSize="small" /> },
                    { label: "Garantía", value: `$${Number(property.garantia || 0).toFixed(2)}`, icon: <AttachMoney fontSize="small" /> },
                    { label: "Mobiliario", value: property.estado_amoblado, icon: <Weekend fontSize="small" /> },
                  ].map((item, index) => (
                    <ListItem key={index} sx={{ py: 1.2, px: 0, display: 'flex', justifyContent: 'space-between', borderBottom: index !== 4 ? '1px solid #f0f0f0' : 'none' }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ color: 'gray' }}>{item.icon}<Typography variant="body2">{item.label}</Typography></Stack>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: palette.titulos }}>{item.value}</Typography>
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  {!citaExistente ? (
                    <Button variant="contained" fullWidth startIcon={<Event />} onClick={handleOpenCita} sx={{ bgcolor: palette.botonPrincipal, py: 1.5, fontWeight: 800, borderRadius: 3, textTransform: 'none', fontSize: '1rem', '&:hover': { bgcolor: '#a8552c' } }}>Agendar visita</Button>
                  ) : (
                    <Stack spacing={1.5} alignItems="center">
                      <Alert severity="success" variant="outlined" sx={{ py: 0, borderRadius: 2, width: '100%', justifyContent: 'center' }}>Cita agendada exitosamente</Alert>
                      <Button variant="outlined" color="error" fullWidth startIcon={<Cancel />} onClick={() => setOpenModalCancel(true)} sx={{ py: 1, borderRadius: 3, fontWeight: 'bold', textTransform: 'none', border: '2px solid' }}>Cancelar Mi Cita</Button>
                    </Stack>
                  )}
                </Box>
              </Paper>
              <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#f5efe6', borderRadius: 4, border: '1px dashed #c9a227', textAlign: 'center' }}>
                 <Typography variant="body2" sx={{ color: palette.titulos, fontWeight: 700 }}>¿Tienes dudas? <span style={{ color: palette.botonPrincipal, cursor: 'pointer', textDecoration: 'underline' }}>Contacta al propietario.</span></Typography>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
      <FooterLocal />

      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 900, textAlign: 'center', color: palette.titulos, fontSize: '1.5rem' }}>Contactar Anunciante</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>Déjanos tus datos para agendar una visita a esta propiedad.</Typography>
          <Stack spacing={2.5}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField label="Nombre Completo" fullWidth value={citaForm.nombre_cliente} onChange={(e) => setCitaForm({ ...citaForm, nombre_cliente: e.target.value })} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Correo Electrónico" fullWidth value={citaForm.correo_cliente} onChange={(e) => setCitaForm({ ...citaForm, correo_cliente: e.target.value })} /></Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField type="date" label="Fecha sugerida" InputLabelProps={{ shrink: true }} fullWidth value={citaForm.fecha_cita} onChange={(e) => setCitaForm({ ...citaForm, fecha_cita: e.target.value })} /></Grid>
              <Grid item xs={12} sm={6}><TextField type="time" label="Hora sugerida" InputLabelProps={{ shrink: true }} fullWidth value={citaForm.hora_cita} onChange={(e) => setCitaForm({ ...citaForm, hora_cita: e.target.value })} /></Grid>
            </Grid>
            <TextField label="Mensaje" multiline rows={3} fullWidth value={citaForm.mensaje} onChange={(e) => setCitaForm({ ...citaForm, mensaje: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ color: 'gray', fontWeight: 'bold' }}>Cancelar</Button>
          <Button variant="contained" onClick={confirmarCita} sx={{ bgcolor: palette.botonPrincipal, px: 5, py: 1.5, borderRadius: 8, fontWeight: 'bold' }}>Enviar Mensaje</Button>
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
          <Button variant="contained" color="error" onClick={ejecutarCancelacion} sx={{ px: 4, borderRadius: 3 }}>Confirmar Cancelación</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}