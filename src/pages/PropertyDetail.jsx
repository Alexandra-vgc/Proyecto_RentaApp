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
  
  // Estado del formulario de cita (Campos obligatorios para invitados e inquilinos)
  const [citaForm, setCitaForm] = useState({
    nombre_cliente: "",
    correo_cliente: "",
    fecha_cita: "",
    hora_cita: ""
  });

  const currentUser = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();
  const isUserLogged = isAuthenticated && currentUser && currentUser.email; // usuario con sesión válida
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        // Petición al backend usando el ID de la URL
        const res = await axios.get(`http://localhost:5000/api/admin/propiedades/${id}`);
        setProperty(res.data);
      } catch (err) {
        console.error("Error al cargar detalles:", err.response?.data || err.message);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProperty();
  }, [id]);

  const handleOpenCita = () => {
    // Si hay usuario logueado y su sesión está activa, precargamos sus datos automáticamente
    if (isUserLogged) {
      setCitaForm((prev) => ({
        ...prev,
        nombre_cliente: currentUser.nombre || "",
        correo_cliente: currentUser.email || "",
      }));
    } else {
      // Si es invitado, aseguramos que los campos estén vacíos para que pueda escribir
      setCitaForm((prev) => ({
        ...prev,
        nombre_cliente: "",
        correo_cliente: "",
      }));
    }
    setOpenModal(true);
  };

  const isValidEmail = (email) => {
    // Validación básica de formato de correo
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const confirmarCita = async () => {
    // Validación: Todos los campos son requeridos
    if (!citaForm.nombre_cliente || !citaForm.correo_cliente || !citaForm.fecha_cita || !citaForm.hora_cita) {
      alert("Por favor completa todos los campos para agendar tu visita.");
      return;
    }

    if (!isValidEmail(citaForm.correo_cliente)) {
      alert("Por favor ingresa un correo electrónico válido.");
      return;
    }

    try {
      // Verificamos si realmente hay un usuario logueado para enviar su ID, de lo contrario enviamos null
      const userId = (currentUser && currentUser.id) ? currentUser.id : null;

      // Enviamos la solicitud al backend
      await axios.post("http://localhost:5000/api/solicitudes", {
        propiedad_id: id,
        arrendatario_id: userId, 
        nombre_cliente: citaForm.nombre_cliente,
        correo_cliente: citaForm.correo_cliente,
        fecha_cita: citaForm.fecha_cita,
        hora_cita: citaForm.hora_cita,
        estado: "pendiente"
      });

      alert(`✅ ¡Cita solicitada con éxito! Se ha enviado un aviso al propietario. 
      Revisa tu correo ${citaForm.correo_cliente} para la confirmación de la cita.`);
      
      setOpenModal(false);
      navigate("/"); // Redirige al inicio tras el éxito
    } catch (error) {
      console.error("Error al crear cita:", error.response?.data || error.message);
      const msgError = error.response?.data?.error || "No se pudo conectar con el servidor.";
      alert("Error: " + msgError);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  
  if (!property) return (
    <Box sx={{ bgcolor: palette.fondoPrincipal, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ color: palette.titulos, fontWeight: 'bold' }}>⚠️ Propiedad no encontrada</Typography>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: palette.fondoPrincipal, minHeight: "100vh", py: 5 }}>
      <Container maxWidth="lg">
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)} 
          sx={{ color: palette.titulos, mb: 3, fontWeight: 'bold', textTransform: 'none' }}
        >
          Volver al listado
        </Button>

        <Grid container spacing={4}>
          {/* Imagen Principal */}
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ border: `1px solid ${palette.textoSecundario}33`, overflow: 'hidden', borderRadius: 0 }}>
              <img 
                src={property.imagen_url || "https://via.placeholder.com/800?text=Sin+imagen"} 
                alt={property.sector} 
                style={{ width: '100%', height: '450px', objectFit: 'cover' }} 
              />
            </Paper>
          </Grid>

          {/* Detalles e Información */}
          <Grid item xs={12} md={5}>
            <Typography variant="h3" sx={{ color: palette.titulos, fontWeight: 900, mb: 2, fontFamily: 'serif' }}>
              {property.sector || "Departamento"}
            </Typography>
            
            <Typography variant="h4" sx={{ color: palette.botonPrincipal, fontWeight: 900, mb: 3 }}>
              ${property.precio_mensual} / mes
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: palette.textoSecundario, mb: 3 }}>
               <LocationOn fontSize="small" />
               <Typography variant="body1">{property.ciudad}, Ecuador</Typography>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" sx={{ fontWeight: 800, color: palette.titulos, mb: 2 }}>Características</Typography>
            <Stack spacing={2} sx={{ mb: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Bed sx={{ color: palette.detallesDorado }} />
                <Typography variant="body1"><strong>{property.habitaciones}</strong> Habitaciones</Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Bathtub sx={{ color: palette.detallesDorado }} />
                <Typography variant="body1"><strong>{property.banos}</strong> Baños</Typography>
              </Stack>
            </Stack>

            <Typography variant="body1" sx={{ color: palette.titulos, lineHeight: 1.8, mb: 5 }}>
              {property.descripcion || "Sin descripción disponible."}
            </Typography>

            <Button 
              fullWidth 
              variant="contained" 
              startIcon={<Event />} 
              onClick={handleOpenCita}
              sx={{ bgcolor: palette.botonPrincipal, py: 2, fontWeight: 'bold', borderRadius: 0, fontSize: '1.1rem', textTransform: 'none' }}
            >
              Agendar cita de visita
            </Button>
          </Grid>
        </Grid>
      </Container>

      {/* MODAL DE AGENDAMIENTO PARA INVITADOS E INQUILINOS */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, color: palette.titulos, textAlign: 'center' }}>
            Confirmar Solicitud de Visita
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Si es invitado, puede escribir nombre y correo; si está logueado, se bloquean sus datos */}
            <TextField
              label="Nombre Completo"
              fullWidth
              value={citaForm.nombre_cliente}
              onChange={(e) => setCitaForm({ ...citaForm, nombre_cliente: e.target.value })}
              disabled={isUserLogged}
            />
            <TextField
              label="Correo Electrónico"
              type="email"
              fullWidth
              placeholder="ejemplo@correo.com"
              value={citaForm.correo_cliente}
              onChange={(e) => setCitaForm({ ...citaForm, correo_cliente: e.target.value })}
              disabled={isUserLogged}
            />
            <TextField
              type="date"
              label="Fecha de Visita"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={citaForm.fecha_cita}
              onChange={(e) => setCitaForm({ ...citaForm, fecha_cita: e.target.value })}
            />
            <TextField
              type="time"
              label="Hora de Visita"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={citaForm.hora_cita}
              onChange={(e) => setCitaForm({ ...citaForm, hora_cita: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button onClick={() => setOpenModal(false)} sx={{ color: palette.textoSecundario, fontWeight: 'bold' }}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={confirmarCita} 
            sx={{ bgcolor: palette.botonPrincipal, fontWeight: 'bold', px: 4 }}
          >
            Confirmar y Enviar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}