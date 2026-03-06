import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import authService from "../services/authService"; 
import { 
  Box, Container, Typography, Button, Grid, Paper, Stack, Divider, 
  CircularProgress, Dialog, DialogTitle, DialogContent, TextField, DialogActions 
} from "@mui/material";
import { Bed, Bathtub, LocationOn, ArrowBack, Event } from "@mui/icons-material";

const palette = { 
  fondoPrincipal: "#E8DCCB", titulos: "#4E5B3C", 
  botonPrincipal: "#C66A3D", textoSecundario: "#BFA58A", detallesDorado: "#C9A227" 
};

export default function PropertyDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  
  // Datos del formulario de cita
  const [citaForm, setCitaForm] = useState({
    nombre_cliente: "",
    fecha_cita: "",
    hora_cita: ""
  });

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/admin/propiedades/${id}`);
        setProperty(res.data);
      } catch (err) {
        console.error("Error al cargar:", err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProperty();
  }, [id]);

  const handleOpenCita = () => {
    // Si está logueado, precargamos su nombre
    if (currentUser) {
      setCitaForm({ ...citaForm, nombre_cliente: currentUser.nombre });
    }
    setOpenModal(true);
  };

  const confirmarCita = async () => {
    if (!citaForm.nombre_cliente || !citaForm.fecha_cita || !citaForm.hora_cita) {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/solicitudes", {
        propiedad_id: id,
        arrendatario_id: currentUser ? currentUser.id : null,
        nombre_cliente: citaForm.nombre_cliente,
        fecha_cita: citaForm.fecha_cita,
        hora_cita: citaForm.hora_cita,
        estado: "pendiente"
      });

      alert(`✅ Cita agendada para ${citaForm.nombre_cliente}. Nos vemos el ${citaForm.fecha_cita}`);
      setOpenModal(false);
      navigate("/");
    } catch (error) {
      alert("Error al conectar con el servidor.");
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!property) return <Typography variant="h5" textAlign="center" mt={10}>Propiedad no encontrada.</Typography>;

  return (
    <Box sx={{ bgcolor: palette.fondoPrincipal, minHeight: "100vh", py: 5 }}>
      <Container maxWidth="lg">
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ color: palette.titulos, mb: 3 }}>Volver</Button>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ border: `1px solid ${palette.textoSecundario}33`, overflow: 'hidden' }}>
              <img src={property.imagen_url || "https://via.placeholder.com/800"} alt={property.sector} style={{ width: '100%', height: '450px', objectFit: 'cover' }} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography variant="h3" sx={{ color: palette.titulos, fontWeight: 900, mb: 1 }}>{property.sector}</Typography>
            <Typography variant="h4" sx={{ color: palette.botonPrincipal, fontWeight: 900, mb: 4 }}>${property.precio_mensual} / mes</Typography>
            <Divider sx={{ mb: 4 }} />
            <Stack spacing={2} sx={{ mb: 4 }}>
              <Stack direction="row" spacing={2}><Bed sx={{ color: palette.detallesDorado }} /><Typography><strong>{property.habitaciones}</strong> Habitaciones</Typography></Stack>
              <Stack direction="row" spacing={2}><Bathtub sx={{ color: palette.detallesDorado }} /><Typography><strong>{property.banos}</strong> Baños</Typography></Stack>
            </Stack>
            <Typography variant="body1" sx={{ color: palette.titulos, mb: 5 }}>{property.descripcion}</Typography>
            
            <Button fullWidth variant="contained" startIcon={<Event />} onClick={handleOpenCita} sx={{ bgcolor: palette.botonPrincipal, py: 2 }}>
              Agendar cita de visita
            </Button>
          </Grid>
        </Grid>
      </Container>

      {/* VENTANA PEQUEÑA (MODAL) DE AGENDAMIENTO */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, color: palette.titulos }}>Agendar Visita</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {!currentUser && (
              <TextField label="Tu Nombre Completo" fullWidth value={citaForm.nombre_cliente} onChange={(e) => setCitaForm({...citaForm, nombre_cliente: e.target.value})} />
            )}
            <TextField type="date" label="Fecha" InputLabelProps={{ shrink: true }} fullWidth value={citaForm.fecha_cita} onChange={(e) => setCitaForm({...citaForm, fecha_cita: e.target.value})} />
            <TextField type="time" label="Hora" InputLabelProps={{ shrink: true }} fullWidth value={citaForm.hora_cita} onChange={(e) => setCitaForm({...citaForm, hora_cita: e.target.value})} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ color: palette.textoSecundario }}>Cancelar</Button>
          <Button variant="contained" onClick={confirmarCita} sx={{ bgcolor: palette.botonPrincipal }}>Confirmar Cita</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}