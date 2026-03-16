import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import authService from "../../services/authService";

import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, AppBar,
  Toolbar, Typography, Button, Grid, Card, CardContent, CardMedia,
  TextField, InputAdornment, Paper, InputBase, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Chip, Divider,
  Stack, Container, MenuItem, FormControlLabel, Checkbox, FormGroup, CircularProgress,
  Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  IconButton 
} from "@mui/material";

import {
  Add, Home, Mail, Description, Edit, Delete, Search as SearchIcon, 
  CloudUpload, EventAvailable, CalendarMonth, LocationOn, CheckCircle,
  AttachMoney, Straighten, Hotel, Bathtub, Business, Rule, Info,
  Dashboard as DashboardIcon, WbSunny, TrendingUp, Apartment, EventNote,
  ErrorOutline, WarningAmber, Visibility, Bed, VerifiedUser, Gavel // Icono para reglas
} from "@mui/icons-material";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const drawerWidth = 260;
const palette = {
  fondoPrincipal: "#E8DCCB",
  fondoAlterno: "#F5EFE6",
  titulos: "#4E5B3C",
  textoSecundario: "#BFA58A",
  botonPrincipal: "#C66A3D",
  textoBoton: "#FFFFFF",
  detallesDorado: "#C9A227"
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [aseccion, setSeccion] = useState("dashboard"); 
  const [propiedades, setPropiedades] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [clima, setClima] = useState({ temp: 20, desc: "Despejado" });

  const [alerta, setAlerta] = useState({ open: false, mensaje: "", severidad: "success" });
  const [confirmarEliminar, setConfirmarEliminar] = useState({ open: false, id: null });
  const [previewProp, setPreviewProp] = useState(null);

  const [form, setForm] = useState({
    id: null, sector: "", ciudad: "", direccion: "", precio_mensual: "", habitaciones: "", 
    banos: "", metros_cuadrados: "", descripcion: "", imagen_url: "", imagenes_extra: [],
    tipo_propiedad: "Departamento", estado_amoblado: "Vacío", garantia: "", alicuota: "",
    parqueaderos: "0", piso: "1", año_construccion: "2024", reglas: "", // Reglas inicializadas
    incluye_agua: false, incluye_luz: false, incluye_internet: false, mascotas: false,
    fumar: false, ascensor: false, seguridad: false, gym: false, piscina: false
  });
  
  const currentUser = authService.getCurrentUser();
  const userId = currentUser ? currentUser.id : null;

  const API_PROPIEDADES = "http://localhost:5000/api/admin/propiedades";
  const API_SOLICITUDES = `http://localhost:5000/api/solicitudes/propietario/${userId}`;

  useEffect(() => {
    cargarDatos();
    cargarSolicitudes();
    cargarContratos();
  }, [userId]);

  const cargarDatos = async () => {
    try {
      const res = await axios.get(API_PROPIEDADES);
      setPropiedades(res.data);
    } catch (err) { console.error("Error propiedades:", err); }
  };

  const cargarSolicitudes = async () => {
    if(!userId) return;
    try {
      const res = await axios.get(API_SOLICITUDES);
      setSolicitudes(res.data);
    } catch (err) { console.error("Error solicitudes:", err); }
  };

  const cargarContratos = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/contratos`);
      setContratos(res.data);
    } catch (err) { console.error(err); }
  };

  const stats = useMemo(() => {
    const totalRenta = propiedades.reduce((acc, p) => acc + parseFloat(p.precio_mensual || 0), 0);
    const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
    const chartData = propiedades.slice(0, 6).map(p => ({
      name: p.sector?.substring(0, 10) || "Inmueble",
      precio: parseFloat(p.precio_mensual)
    }));
    return { totalRenta, pendientes, chartData };
  }, [propiedades, solicitudes]);

  const handleAceptarCita = async (id, correo, nombre) => {
    try {
      await axios.put(`http://localhost:5000/api/solicitudes/aceptar/${id}`);
      setAlerta({ open: true, mensaje: `✅ Cita aceptada para ${nombre}. Correo enviado a ${correo}.`, severidad: "success" });
      cargarSolicitudes();
    } catch (error) {
      setAlerta({ open: true, mensaje: "❌ Error al aceptar la cita.", severidad: "error" });
    }
  };

  const handleMultipleImages = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({
          ...prev,
          imagenes_extra: [...(prev.imagenes_extra || []), reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...form,
        codigo: form.id ? form.codigo : `PROP-${Math.floor(Math.random() * 9000 + 1000)}`,
        precio_mensual: parseFloat(form.precio_mensual) || 0,
        garantia: parseFloat(form.garantia) || 0,
        alicuota: parseFloat(form.alicuota) || 0,
        habitaciones: parseInt(form.habitaciones) || 0,
        banos: parseInt(form.banos) || 0,
        parqueaderos: parseInt(form.parqueaderos) || 0,
        metros_cuadrados: parseFloat(form.metros_cuadrados) || 0,
        estado: form.estado || "disponible"
      };

      if (form.id) {
        await axios.put(`${API_PROPIEDADES}/${form.id}`, dataToSend);
        setAlerta({ open: true, mensaje: "✅ Propiedad actualizada exitosamente", severidad: "success" });
      } else {
        await axios.post(API_PROPIEDADES, dataToSend);
        setAlerta({ open: true, mensaje: "🚀 Propiedad publicada con éxito", severidad: "success" });
      }

      resetForm();
      cargarDatos();
      setSeccion("mis-departamentos");
      
    } catch (error) { 
      setAlerta({ open: true, mensaje: "❌ Error al guardar la propiedad.", severidad: "error" });
    }
  };

  const resetForm = () => setForm({ 
    id: null, sector: "", ciudad: "", direccion: "", precio_mensual: "", habitaciones: "", 
    banos: "", metros_cuadrados: "", descripcion: "", imagen_url: "", imagenes_extra: [],
    tipo_propiedad: "Departamento", estado_amoblado: "Vacío", garantia: "", alicuota: "",
    parqueaderos: "0", piso: "1", año_construccion: "2024", reglas: "",
    incluye_agua: false, incluye_luz: false, incluye_internet: false, mascotas: false,
    fumar: false, ascensor: false, seguridad: false, gym: false, piscina: false
  });

  const handleConfirmarEliminar = (id) => {
    setConfirmarEliminar({ open: true, id: id });
  };

  const ejecutarEliminacion = async () => {
    try {
      await axios.delete(`${API_PROPIEDADES}/${confirmarEliminar.id}`);
      cargarDatos();
      setAlerta({ open: true, mensaje: "🗑️ Eliminado correctamente", severidad: "success" });
    } catch { 
      setAlerta({ open: true, mensaje: "❌ Error al eliminar", severidad: "error" }); 
    } finally {
      setConfirmarEliminar({ open: false, id: null });
    }
  };

  const prepararEdicion = (p) => {
    setForm({ 
        ...p,
        imagenes_extra: p.imagenes_extra || [],
        tipo_propiedad: p.tipo_propiedad || "Departamento",
        estado_amoblado: p.estado_amoblado || "Vacío",
        reglas: p.reglas || ""
    });
    setSeccion("publicar");
  };

  const iniciarContrato = async (solicitud_id) => {
    const solicitud = solicitudes.find((s) => s.id === solicitud_id);
    if (!solicitud) return;
    try {
      const contratoData = {
        solicitud_id: solicitud.id,
        propiedad_id: solicitud.propiedad_id,
        fecha_inicio: new Date().toISOString().split("T")[0],
        fecha_fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
        canon: solicitud.precio_mensual || 0,
        nombre_cliente: solicitud.nombre_cliente,
        nombre_propiedad: solicitud.sector_propiedad || "Departamento",
      };
      const res = await axios.post("http://localhost:5000/api/contratos", contratoData);
      generarPDF({ ...contratoData, id: res.data.id });
      setAlerta({ open: true, mensaje: "✅ Contrato generado y enviado", severidad: "success" });
      cargarContratos();
      cargarSolicitudes();
    } catch (error) {
      setAlerta({ open: true, mensaje: "❌ Error al generar contrato", severidad: "error" });
    }
  };

  const generarPDF = (contrato) => {
    const doc = new jsPDF();
    const fechaHoy = new Date().toLocaleDateString();
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 277); 
    doc.rect(12, 12, 186, 273);
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text("REPÚBLICA DEL ECUADOR", 105, 22, { align: "center" });
    doc.text("CONSEJO DE LA JUDICATURA - NOTARÍA DIGITAL MiRentaApp", 105, 27, { align: "center" });
    doc.setFontSize(18);
    doc.setTextColor(78, 91, 60); 
    doc.text("CONTRATO DE ARRENDAMIENTO NOTARIADO", 105, 45, { align: "center" });
    doc.setDrawColor(198, 106, 61); 
    doc.line(35, 50, 175, 50);
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const cuerpoTexto = `En la ciudad de Quito, a los ${fechaHoy}, comparecen libre y voluntariamente el Administrador de MiRentaApp y el Sr./Sra. ${contrato.nombre_cliente.toUpperCase()}.
    PRIMERA: OBJETO.- Inmueble en ${contrato.nombre_propiedad}.
    SEGUNDA: CANON.- $${contrato.canon} USD mensuales.
    TERCERA: PLAZO.- 12 meses desde ${contrato.fecha_inicio}.`;
    const textLines = doc.splitTextToSize(cuerpoTexto, 160);
    doc.text(textLines, 25, 65);
    doc.setFont("times", "bold");
    doc.text("F. EL PROPIETARIO", 55, 240);
    doc.text("F. EL ARRENDATARIO", 132, 240);
    doc.save(`Contrato_MiRenta_${contrato.nombre_cliente}.pdf`);
  };

  const propiedadesFiltradas = useMemo(() => {
    const b = busqueda.toLowerCase();
    return propiedades.filter(p => p.sector?.toLowerCase().includes(b) || p.ciudad?.toLowerCase().includes(b));
  }, [busqueda, propiedades]);

  return (
    <Box sx={{ display: "flex", bgcolor: palette.fondoPrincipal, minHeight: "100vh" }}>
      
      <Snackbar 
        open={alerta.open} 
        autoHideDuration={4000} 
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Paper elevation={10} sx={{ 
          bgcolor: alerta.severidad === "success" ? palette.titulos : "#d32f2f", 
          color: "white", p: "12px 24px", borderRadius: "12px", display: 'flex', alignItems: 'center', gap: 2 
        }}>
          {alerta.severidad === "success" ? <CheckCircle /> : <ErrorOutline />}
          <Typography sx={{ fontWeight: 700 }}>{alerta.mensaje}</Typography>
        </Paper>
      </Snackbar>

      <Dialog open={confirmarEliminar.open} onClose={() => setConfirmarEliminar({ open: false, id: null })} PaperProps={{ sx: { borderRadius: "20px", p: 2 } }}>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <WarningAmber sx={{ fontSize: 60, color: palette.detallesDorado, mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 900, color: palette.titulos }}>¿Confirmar eliminación?</Typography>
          <Typography variant="body1" sx={{ mt: 1, color: "#666" }}>Esta acción no se puede deshacer.</Typography>
        </Box>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setConfirmarEliminar({ open: false, id: null })} sx={{ color: "#666", fontWeight: 700 }}>Cancelar</Button>
          <Button onClick={ejecutarEliminacion} variant="contained" sx={{ bgcolor: "#d32f2f", borderRadius: "10px", px: 4, fontWeight: 700 }}>Sí, Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL DE PREVISUALIZACIÓN TIPO PUBLICACIÓN --- */}
{/* --- MODAL DE PREVISUALIZACIÓN CORREGIDO (CON SCROLL Y SIN BOTÓN) --- */}
<Dialog 
  open={!!previewProp} 
  onClose={() => setPreviewProp(null)} 
  maxWidth="md" 
  fullWidth 
  PaperProps={{ 
    sx: { 
      borderRadius: 4, 
      overflow: 'hidden',
      maxHeight: '90vh' // Evita que el modal se salga de la pantalla
    } 
  }}
>
  {previewProp && (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '100%' }}>
      
      {/* LADO IZQUIERDO: IMAGEN FIJA */}
      <Box sx={{ width: { xs: '100%', md: '50%' }, position: 'relative', bgcolor: '#000' }}>
        <CardMedia 
          component="img" 
          image={previewProp.imagen_url || "https://via.placeholder.com/400"} 
          sx={{ height: '100%', objectFit: 'cover' }} 
        />
        <Chip 
          label="Vista Previa de Publicación" 
          sx={{ position: 'absolute', top: 16, left: 16, bgcolor: palette.titulos, color: 'white', fontWeight: 'bold' }} 
        />
      </Box>

      {/* LADO DERECHO: CONTENIDO CON SCROLL */}
      <Box sx={{ 
        p: 4, 
        width: { xs: '100%', md: '50%' }, 
        bgcolor: 'white',
        overflowY: 'auto', // ✅ ESTO PERMITE BAJAR PARA VER TODO
        maxHeight: { md: '600px', xs: 'auto' } 
      }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: palette.titulos, fontFamily: 'serif', lineHeight: 1.2 }}>
          {previewProp.sector}
        </Typography>
        
        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: palette.textoSecundario, mt: 1, mb: 2 }}>
          <LocationOn fontSize="small" />
          <Typography variant="body2">{previewProp.ciudad}, Ecuador</Typography>
        </Stack>

        <Typography variant="h3" sx={{ color: palette.botonPrincipal, fontWeight: 900, mb: 3 }}>
          ${previewProp.precio_mensual}
        </Typography>
        
        <Stack direction="row" spacing={3} sx={{ mb: 3, p: 2, bgcolor: palette.fondoAlterno, borderRadius: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Bed sx={{ color: palette.detallesDorado }} />
            <Typography variant="body2" fontWeight="bold">{previewProp.habitaciones} Hab.</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Bathtub sx={{ color: palette.detallesDorado }} />
            <Typography variant="body2" fontWeight="bold">{previewProp.banos} Baños</Typography>
          </Stack>
        </Stack>

        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: palette.titulos, mb: 1 }}>
          Descripción:
        </Typography>
        <Typography variant="body2" sx={{ color: '#555', mb: 3, lineHeight: 1.6 }}>
          {previewProp.descripcion}
        </Typography>
        
        {/* REGLAS DEL DEPARTAMENTO */}
        {previewProp.reglas && (
          <Box sx={{ mb: 3, p: 2, borderLeft: `4px solid ${palette.detallesDorado}`, bgcolor: '#fffde7', borderRadius: '0 8px 8px 0' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: palette.titulos, display: 'flex', alignItems: 'center', gap: 1, textTransform: 'uppercase', mb: 0.5 }}>
              <Gavel sx={{ fontSize: 16 }} /> Reglas y Convivencia:
            </Typography>
            <Typography variant="body2" sx={{ color: '#555' }}>
              {previewProp.reglas}
            </Typography>
          </Box>
        )}

        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: palette.titulos, mb: 1 }}>
          Servicios Incluidos:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
          {previewProp.incluye_agua && <Chip label="Agua" size="small" variant="outlined" color="primary" />}
          {previewProp.incluye_internet && <Chip label="WiFi" size="small" variant="outlined" color="success" />}
          {previewProp.mascotas && <Chip label="Mascotas ok" size="small" variant="outlined" color="secondary" />}
        </Stack>

        <Divider sx={{ my: 3 }} />
        
        <Typography variant="caption" color="textSecondary" textAlign="center" display="block">
          Fin de la vista previa. Así es como los inquilinos verán tu anuncio.
        </Typography>
      </Box>
    </Box>
  )}
</Dialog>

      <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, bgcolor: "white", color: palette.titulos, boxShadow: "none", borderBottom: `1px solid ${palette.textoSecundario}33` }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: palette.fondoAlterno, borderRadius: 1, px: 2, width: 350 }}>
            <SearchIcon sx={{ color: palette.textoSecundario, mr: 1 }} />
            <InputBase placeholder="Buscar registros..." fullWidth value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{currentUser?.nombre || "Propietario"}</Typography>
            <Button variant="contained" onClick={() => { authService.logout(); navigate("/login"); }} sx={{ bgcolor: palette.botonPrincipal, borderRadius: 0 }}>Cerrar</Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" sx={{ width: drawerWidth, "& .MuiDrawer-paper": { width: drawerWidth, bgcolor: palette.fondoAlterno } }}>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: palette.titulos, cursor: 'pointer' }} onClick={() => navigate("/")}>MiRentaAPP</Typography>
        </Box>
        <List sx={{ px: 2 }}>
          <ListItemButton selected={aseccion === "dashboard"} onClick={() => setSeccion("dashboard")} sx={{ borderRadius: 1, mb: 1 }}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Panel de Control" />
          </ListItemButton>
          {[{ id: "mis-departamentos", icon: <Home />, label: "Mis Propiedades" },
            { id: "publicar", icon: <Add />, label: "Publicar Nuevo" },
            { id: "solicitudes", icon: <Mail />, label: "Citas / Agendas" },
            { id: "contratos", icon: <Description />, label: "Contratos Generados" }].map((item) => (
            <ListItemButton key={item.id} selected={aseccion === item.id} onClick={() => { setSeccion(item.id); if (item.id === "publicar") resetForm(); }} sx={{ borderRadius: 1, mb: 1 }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 5, mt: 10 }}>
        
        {aseccion === "dashboard" && (
          <Container maxWidth="lg">
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, color: palette.titulos }}>Resumen General 📊</Typography>
            <Grid container spacing={3}>
              <Grid item size={{ xs: 12, md: 3 }}>
                <Card sx={{ bgcolor: 'white', borderRadius: 2 }}><CardContent sx={{ textAlign: 'center' }}><Apartment sx={{ fontSize: 40, color: palette.botonPrincipal, mb: 1 }} /><Typography variant="h4" fontWeight="bold">{propiedades.length}</Typography><Typography color="textSecondary">Propiedades</Typography></CardContent></Card>
              </Grid>
              <Grid item size={{ xs: 12, md: 3 }}>
                <Card sx={{ bgcolor: 'white', borderRadius: 2 }}><CardContent sx={{ textAlign: 'center' }}><AttachMoney sx={{ fontSize: 40, color: "#2e7d32", mb: 1 }} /><Typography variant="h4" fontWeight="bold">${stats.totalRenta}</Typography><Typography color="textSecondary">Renta Mensual Total</Typography></CardContent></Card>
              </Grid>
              <Grid item size={{ xs: 12, md: 3 }}>
                <Card sx={{ bgcolor: 'white', borderRadius: 2 }}><CardContent sx={{ textAlign: 'center' }}><EventNote sx={{ fontSize: 40, color: palette.detallesDorado, mb: 1 }} /><Typography variant="h4" fontWeight="bold">{stats.pendientes}</Typography><Typography color="textSecondary">Citas Pendientes</Typography></CardContent></Card>
              </Grid>
              <Grid item size={{ xs: 12, md: 3 }}>
                <Card sx={{ bgcolor: palette.titulos, color: 'white', borderRadius: 2 }}><CardContent sx={{ textAlign: 'center' }}><WbSunny sx={{ fontSize: 40, mb: 1 }} /><Typography variant="h4" fontWeight="bold">{clima.temp}°C</Typography><Typography variant="body2">Quito - {clima.desc}</Typography></CardContent></Card>
              </Grid>
              <Grid item size={{ xs: 12, md: 8 }}>
                <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Precios por Propiedad</Typography>
                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={stats.chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip cursor={{fill: '#f5f5f5'}} /><Bar dataKey="precio" fill={palette.botonPrincipal} radius={[5, 5, 0, 0]} /></BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 3, borderRadius: 2, height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 60, color: palette.botonPrincipal, mb: 2 }} /><Typography variant="h5" fontWeight="bold">Rendimiento</Typography><Typography variant="h2" color={palette.titulos} fontWeight="900" sx={{ my: 2 }}>92%</Typography><Typography color="textSecondary">Tu perfil es altamente confiable</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        )}

        {aseccion === "mis-departamentos" && (
          <Grid container spacing={4}>
            {propiedadesFiltradas.map((p) => (
              <Grid item size={{ xs: 12, md: 4 }} key={p.id}>
                <Card sx={{ borderRadius: 2, border: `1px solid ${palette.textoSecundario}33`, boxShadow: 3, position: 'relative' }}>
                  <CardMedia component="img" height="220" image={p.imagen_url || "https://via.placeholder.com/400"} />
                  <IconButton onClick={() => setPreviewProp(p)} sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'white' } }}>
                    <Visibility color="primary" />
                  </IconButton>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: palette.titulos }}>{p.sector}</Typography>
                    <Typography variant="h5" color={palette.botonPrincipal} sx={{ fontWeight: 900, my: 1 }}>${p.precio_mensual}</Typography>
                    <Stack direction="row" spacing={1} mt={3}>
                      <Button fullWidth variant="outlined" startIcon={<Edit />} onClick={() => prepararEdicion(p)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Editar</Button>
                      <Button fullWidth variant="outlined" color="error" startIcon={<Delete />} onClick={() => handleConfirmarEliminar(p.id)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Borrar</Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {aseccion === "publicar" && (
          <Container maxWidth="md">
            <Paper sx={{ p: 5, bgcolor: palette.fondoAlterno, borderRadius: 2 }}>
              <Typography variant="h4" mb={4} color={palette.titulos} sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                <Business /> {form.id ? "Actualizar Anuncio" : "Publicar Arriendo"}
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item size={{ xs: 12 }}><Typography variant="h6" color={palette.botonPrincipal} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}><LocationOn /> 1. Información y Ubicación</Typography><Divider sx={{ my: 1, borderBottomWidth: 2, borderColor: palette.botonPrincipal }} /></Grid>
                  <Grid item size={{ xs: 12 }}><TextField label="Título del Anuncio" fullWidth value={form.sector} onChange={(e) => setForm({...form, sector: e.target.value})} /></Grid>
                  <Grid item size={{ xs: 12, md: 6 }}><TextField label="Ciudad" fullWidth value={form.ciudad} onChange={(e) => setForm({...form, ciudad: e.target.value})} /></Grid>
                  <Grid item size={{ xs: 12, md: 6 }}><TextField label="Sector / Barrio" fullWidth value={form.direccion} onChange={(e) => setForm({...form, direccion: e.target.value})} /></Grid>
                  <Grid item size={{ xs: 12 }} sx={{ mt: 2 }}><Typography variant="h6" color={palette.botonPrincipal} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}><AttachMoney /> 2. Información de Precio y Garantía</Typography><Divider sx={{ my: 1, borderBottomWidth: 2, borderColor: palette.botonPrincipal }} /></Grid>
                  <Grid item size={{ xs: 12, md: 4 }}><TextField label="Renta Mensual ($)" type="number" fullWidth value={form.precio_mensual} onChange={(e) => setForm({...form, precio_mensual: e.target.value})} /></Grid>
                  <Grid item size={{ xs: 12, md: 4 }}><TextField label="Depósito / Garantía ($)" type="number" fullWidth value={form.garantia} onChange={(e) => setForm({...form, garantia: e.target.value})} /></Grid>
                  <Grid item size={{ xs: 12, md: 4 }}><TextField label="Alícuota ($)" type="number" fullWidth value={form.alicuota} onChange={(e) => setForm({...form, alicuota: e.target.value})} /></Grid>
                  <Grid item size={{ xs: 12 }} sx={{ mt: 2 }}><Typography variant="h6" color={palette.botonPrincipal} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}><Straighten /> 3. Características y equipamiento</Typography><Divider sx={{ my: 1, borderBottomWidth: 2, borderColor: palette.botonPrincipal }} /></Grid>
                  <Grid item size={{ xs: 6, md: 3 }}><TextField label="Área (m²)" type="number" fullWidth value={form.metros_cuadrados} onChange={(e) => setForm({...form, metros_cuadrados: e.target.value})} /></Grid>
                  <Grid item size={{ xs: 6, md: 3 }}><TextField label="Habitaciones" type="number" fullWidth value={form.habitaciones} onChange={(e) => setForm({...form, habitaciones: e.target.value})} /></Grid>
                  <Grid item size={{ xs: 6, md: 3 }}><TextField label="Baños" type="number" fullWidth value={form.banos} onChange={(e) => setForm({...form, banos: e.target.value})} /></Grid>
                  <Grid item size={{ xs: 6, md: 3 }}><TextField label="Parqueaderos" type="number" fullWidth value={form.parqueaderos} onChange={(e) => setForm({...form, parqueaderos: e.target.value})} /></Grid>
                  <Grid item size={{ xs: 12, md: 6 }}><TextField select label="Tipo" fullWidth value={form.tipo_propiedad} onChange={(e) => setForm({...form, tipo_propiedad: e.target.value})}>{["Departamento", "Casa", "Suite", "Estudio"].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</TextField></Grid>
                  <Grid item size={{ xs: 12, md: 6 }}><TextField select label="Mobiliario" fullWidth value={form.estado_amoblado} onChange={(e) => setForm({...form, estado_amoblado: e.target.value})}>{["Amoblado", "Semi-amoblado", "Vacío"].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</TextField></Grid>
                  
                  {/* SECCIÓN 4 CORREGIDA: INCLUYE REGLAS */}
                  <Grid item size={{ xs: 12 }} sx={{ mt: 2 }}><Typography variant="h6" color={palette.botonPrincipal} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}><Rule /> 4. Servicios Incluidos y Reglas</Typography><Divider sx={{ my: 1, borderBottomWidth: 2, borderColor: palette.botonPrincipal }} /></Grid>
                  <Grid item size={{ xs: 12 }}><FormGroup sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}><FormControlLabel control={<Checkbox checked={form.incluye_agua} onChange={(e) => setForm({...form, incluye_agua: e.target.checked})} />} label="Agua" /><FormControlLabel control={<Checkbox checked={form.incluye_luz} onChange={(e) => setForm({...form, incluye_luz: e.target.checked})} />} label="Luz" /><FormControlLabel control={<Checkbox checked={form.incluye_internet} onChange={(e) => setForm({...form, incluye_internet: e.target.checked})} />} label="WiFi" /><FormControlLabel control={<Checkbox checked={form.mascotas} onChange={(e) => setForm({...form, mascotas: e.target.checked})} />} label="Mascotas ok" /></FormGroup></Grid>
                  
                  {/* CAMPO DE REGLAS AUMENTADO */}
                  <Grid item size={{ xs: 12 }}>
                    <TextField 
                      label="Reglas del Departamento (ej: No ruidos después de las 10 PM, No fiestas)" 
                      multiline rows={2} fullWidth 
                      value={form.reglas || ""} 
                      onChange={(e) => setForm({...form, reglas: e.target.value})} 
                    />
                  </Grid>

                  <Grid item size={{ xs: 12 }}><TextField label="Descripción detallada" multiline rows={4} fullWidth value={form.descripcion} onChange={(e) => setForm({...form, descripcion: e.target.value})} /></Grid>
                  
                  <Grid item size={{ xs: 12 }} sx={{ mt: 2 }}><Typography variant="h6" color={palette.botonPrincipal} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}><CloudUpload /> 5. Fotos del Departamento</Typography><Divider sx={{ my: 1, borderBottomWidth: 2, borderColor: palette.botonPrincipal }} /></Grid>
                  <Grid item size={{ xs: 12 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Button variant="outlined" component="label" startIcon={<Add />}>Foto Principal<input type="file" hidden accept="image/*" onChange={(e) => { const reader = new FileReader(); reader.onloadend = () => setForm({...form, imagen_url: reader.result}); reader.readAsDataURL(e.target.files[0]); }} /></Button>
                      <Button variant="outlined" component="label" startIcon={<CloudUpload />}>Galería<input type="file" hidden multiple accept="image/*" onChange={handleMultipleImages} /></Button>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', p: 1, bgcolor: '#fff', borderRadius: 1 }}>
                      {form.imagen_url && <Box component="img" src={form.imagen_url} sx={{ width: 100, height: 100, objectFit: 'cover', border: '2px solid green' }} />}
                      {(form.imagenes_extra || []).map((img, i) => (<Box key={i} component="img" src={img} sx={{ width: 100, height: 100, objectFit: 'cover' }} />))}
                    </Stack>
                  </Grid>
                  <Grid item size={{ xs: 12 }} sx={{ mt: 3 }}><Button type="submit" variant="contained" fullWidth sx={{ bgcolor: palette.botonPrincipal, height: 60, fontWeight: 900 }}>{form.id ? "GUARDAR CAMBIOS" : "PUBLICA AHORA"}</Button></Grid>
                </Grid>
              </form>
            </Paper>
          </Container>
        )}

{aseccion === "solicitudes" && (
  <TableContainer component={Paper} sx={{ borderRadius: "15px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
    <Table>
      <TableHead sx={{ bgcolor: palette.fondoAlterno }}>
        <TableRow>
          <TableCell sx={{ fontWeight: 'bold', color: palette.titulos }}>Inmueble</TableCell>
          <TableCell sx={{ fontWeight: 'bold', color: palette.titulos }}>Cliente</TableCell>
          <TableCell sx={{ fontWeight: 'bold', color: palette.titulos }}>Fecha / Hora</TableCell>
          <TableCell sx={{ fontWeight: 'bold', color: palette.titulos }}>Estado</TableCell>
          <TableCell sx={{ fontWeight: 'bold', color: palette.titulos }}>Acciones</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {solicitudes.map((sol) => {
          // 1. Buscamos la propiedad para saber qué número le toca en tu lista
          const indexProp = propiedades.findIndex(p => p.id === sol.propiedad_id) + 1;
          const propInfo = propiedades.find(p => p.id === sol.propiedad_id);

          return (
            <TableRow key={sol.id} hover>
              {/* ✅ Muestra Inmueble #1, #2, etc., según el orden de tus 3 departamentos */}
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 800, color: palette.botonPrincipal }}>
                  Inmueble #{indexProp > 0 ? indexProp : sol.propiedad_id}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {propInfo ? propInfo.sector : 'Cargando...'}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{sol.nombre_cliente}</Typography>
                <Typography variant="caption" sx={{ color: palette.textoSecundario }}>{sol.correo_cliente}</Typography>
              </TableCell>

              {/* ✅ Limpiamos la fecha para que no salga el formato largo T05:00:00Z */}
              <TableCell sx={{ fontSize: '0.85rem' }}>
                {new Date(sol.fecha_cita).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                <br />
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666' }}>{sol.hora_cita}</Typography>
              </TableCell>

              <TableCell>
                <Chip 
                  label={sol.estado} 
                  size="small"
                  sx={{ 
                    bgcolor: sol.estado === 'aceptada' ? '#e8f5e9' : '#f5f5f5', 
                    color: sol.estado === 'aceptada' ? '#2e7d32' : '#757575',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '0.65rem'
                  }} 
                />
              </TableCell>

              <TableCell>
                <Stack direction="row" spacing={1}>
                  {sol.estado === 'pendiente' && (
                    <Button 
                      variant="contained" 
                      size="small" 
                      onClick={() => handleAceptarCita(sol.id, sol.correo_cliente, sol.nombre_cliente)}
                      sx={{ textTransform: 'none', borderRadius: '8px' }}
                    >
                      Aceptar
                    </Button>
                  )}
                  <Button 
                    variant="contained" 
                    size="small" 
                    sx={{ bgcolor: palette.botonPrincipal, textTransform: 'none', borderRadius: '8px', fontWeight: 'bold' }} 
                    onClick={() => iniciarContrato(sol.id)} 
                    disabled={sol.estado !== 'aceptada'}
                  >
                    CONTRATO
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </TableContainer>
)}

        {aseccion === "contratos" && (
          <Box>{contratos.map(c => (
            <Paper key={c.id} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Box><Typography fontWeight="bold">{c.nombre_cliente}</Typography><Typography variant="caption">{c.nombre_propiedad}</Typography></Box>
              <Button onClick={() => generarPDF(c)}>PDF</Button>
            </Paper>
          ))}</Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;