import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import authService from "../../services/authService";
import { generarPDFContrato } from "./contratos/ModuloContratos";
import MapaInteractiva from "./MapaInteractiva";

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
  ErrorOutline, WarningAmber, Visibility, Bed, VerifiedUser, Gavel,
  Payments, Check, Close, InsertPhoto, Build 
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

  // ESTADOS PARA PAGOS
  const [pagosAdmin, setPagosAdmin] = useState([]); 
  const [fotoComprobante, setFotoComprobante] = useState(null); 
  const [filtroPagosAdmin, setFiltroPagosAdmin] = useState('todos'); 
  const [busquedaPagos, setBusquedaPagos] = useState(""); 

  // ESTADOS PARA MANTENIMIENTO
  const [mantenimientosAdmin, setMantenimientosAdmin] = useState([]);
  const [fotoMantenimiento, setFotoMantenimiento] = useState(null);

  const [form, setForm] = useState({
    id: null, sector: "", ciudad: "", direccion: "", precio_mensual: "", habitaciones: "", 
    banos: "", metros_cuadrados: "", descripcion: "", imagen_url: "", imagenes_extra: [],
    tipo_propiedad: "Departamento", estado_amoblado: "Vacío", garantia: "", alicuota: "",
    parqueaderos: "0", piso: "1", año_construccion: "2024", reglas: "", 
    incluye_agua: true, incluye_luz: true, incluye_internet: true, mascotas: false,
    fumar: false, ascensor: false, seguridad: false, gym: false, piscina: false,
    latitud: "", longitud: "", calle_secundaria: "" // ✅ FUSIÓN: Agregada variable de Nathasha
  });
  
  const currentUser = authService.getCurrentUser();
  const userId = currentUser ? currentUser.id : null;

  const API_PROPIEDADES = "http://localhost:5000/api/admin/propiedades";
  const API_SOLICITUDES = `http://localhost:5000/api/solicitudes/propietario/${userId}`;
  const API_PAGOS = "http://localhost:5000/api/admin/pagos"; 
  const API_MANTENIMIENTOS = "http://localhost:5000/api/admin/mantenimientos"; 

  useEffect(() => {
    cargarDatos();
    cargarSolicitudes();
    cargarContratos();
    cargarPagos(); 
    cargarMantenimientos(); 
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

  const cargarPagos = async () => {
    try {
      const res = await axios.get(API_PAGOS);
      setPagosAdmin(res.data);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
    }
  };

  const handleEstadoPago = async (id, nuevoEstado) => {
    try {
      await axios.put(`${API_PAGOS}/${id}/estado`, { estado: nuevoEstado });
      setAlerta({ open: true, mensaje: `Pago ${nuevoEstado} correctamente`, severidad: "success" });
      cargarPagos(); 
    } catch (error) {
      setAlerta({ open: true, mensaje: "Error al actualizar el pago", severidad: "error" });
    }
  };

  const cargarMantenimientos = async () => {
    try {
      const res = await axios.get(API_MANTENIMIENTOS);
      setMantenimientosAdmin(res.data);
    } catch (error) {
      console.error("Error al cargar mantenimientos:", error);
    }
  };

  const handleEstadoMantenimiento = async (id, nuevoEstado) => {
    try {
      await axios.put(`${API_MANTENIMIENTOS}/${id}/estado`, { estado: nuevoEstado });
      setAlerta({ open: true, mensaje: `Mantenimiento marcado como ${nuevoEstado}`, severidad: "success" });
      cargarMantenimientos(); 
    } catch (error) {
      setAlerta({ open: true, mensaje: "Error al actualizar estado", severidad: "error" });
    }
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

  const pagosAdminFiltrados = useMemo(() => {
    return pagosAdmin.filter(pago => {
      const est = pago.estado?.toLowerCase() || 'pendiente';
      let pasaBoton = true;
      if (filtroPagosAdmin === 'aprobados') pasaBoton = (est === 'aprobado' || est === 'pagado');
      else if (filtroPagosAdmin === 'pendientes') pasaBoton = (est === 'pendiente');
      else if (filtroPagosAdmin === 'rechazados') pasaBoton = (est === 'rechazado' || est === 'atrasado');

      const texto = busquedaPagos.toLowerCase();
      const pasaTexto = 
        (pago.nombre_cliente && pago.nombre_cliente.toLowerCase().includes(texto)) ||
        (pago.nombre_propiedad && pago.nombre_propiedad.toLowerCase().includes(texto)) ||
        (pago.mes && pago.mes.toLowerCase().includes(texto));

      return pasaBoton && pasaTexto;
    });
  }, [pagosAdmin, filtroPagosAdmin, busquedaPagos]);

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
      // ✅ FUSIÓN: Se agregan las funciones de Nathasha y las mías sin conflictos
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
        imagen_url: form.imagen_url || "", 
        imagenes_extra: form.imagenes_extra || [], 
        latitud: form.latitud ? parseFloat(form.latitud) : null, 
        longitud: form.longitud ? parseFloat(form.longitud) : null, 
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
    incluye_agua: true, incluye_luz: true, incluye_internet: true, mascotas: false,
    fumar: false, ascensor: false, seguridad: false, gym: false, piscina: false,
    latitud: "", longitud: "", calle_secundaria: "" // ✅ FUSIÓN: Conservado de Nathasha
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

  const iniciarContrato = async (solicitud_id, tipo) => {
    const solicitud = solicitudes.find((s) => s.id === solicitud_id);
    if (!solicitud) return;

    const contratoData = {
      solicitud_id: solicitud.id,
      propiedad_id: solicitud.propiedad_id,
      fecha_inicio: new Date().toISOString().split("T")[0],
      fecha_fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
      canon: solicitud.precio_mensual || 0,
      nombre_cliente: solicitud.nombre_cliente,
      nombre_propiedad: solicitud.sector_propiedad || "Departamento Lujoso",
      tipo_cliente: tipo,
      cedula: "172XXXXXXX", 
      estado_civil: "SOLTERO/A",
      nacionalidad: "ECUATORIANA",
      direccion_cliente: "Calle Principal y Av. Interoceánica",
      precio_total: tipo === 'comprador' ? (solicitud.precio_mensual * 12 * 10) : null,
      cuota_inicial: tipo === 'comprador' ? (solicitud.precio_mensual * 5) : null,
      numero_cuotas: tipo === 'comprador' ? 120 : null
    };

    try {
      const res = await axios.post("http://localhost:5000/api/contratos", contratoData);
      generarPDFContrato({ ...contratoData, id: res.data.id }, tipo);
      setAlerta({ open: true, mensaje: "✅ Contrato robusto generado", severidad: "success" });
    } catch (error) {
      setAlerta({ open: true, mensaje: "❌ Error al guardar en DB", severidad: "error" });
    }
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

      <Dialog open={!!fotoComprobante} onClose={() => setFotoComprobante(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px", p: 2, bgcolor: '#f5f5f5' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" color={palette.titulos}>Comprobante de Pago</Typography>
          <IconButton onClick={() => setFotoComprobante(null)}><Close /></IconButton>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          {fotoComprobante ? (
            <img src={fotoComprobante} alt="Comprobante" style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }} />
          ) : (
            <Typography>No hay imagen disponible</Typography>
          )}
        </Box>
      </Dialog>

      <Dialog open={!!fotoMantenimiento} onClose={() => setFotoMantenimiento(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px", p: 2, bgcolor: '#f5f5f5' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" color={palette.titulos}>Foto del Daño</Typography>
          <IconButton onClick={() => setFotoMantenimiento(null)}><Close /></IconButton>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          {fotoMantenimiento ? (
            <img src={fotoMantenimiento} alt="Mantenimiento" style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }} />
          ) : (
            <Typography>No se adjuntó imagen</Typography>
          )}
        </Box>
      </Dialog>

      <Dialog 
        open={!!previewProp} 
        onClose={() => setPreviewProp(null)} 
        maxWidth="md" 
        fullWidth 
        PaperProps={{ 
          sx: { 
            borderRadius: 4, 
            overflow: 'hidden',
            maxHeight: '90vh'
          } 
        }}
      >
        {previewProp && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '100%' }}>
            
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

            <Box sx={{ 
              p: 4, 
              width: { xs: '100%', md: '50%' }, 
              bgcolor: 'white',
              overflowY: 'auto',
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
            { id: "contratos", icon: <Description />, label: "Contratos Generados" },
            { id: "pagos", icon: <Payments />, label: "Revisión de Pagos" },
            { id: "mantenimiento", icon: <Build />, label: "Mantenimiento" } 
          ].map((item) => (
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
                  
                  <Grid item size={{ xs: 12 }} sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: palette.titulos, mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn fontSize="small" /> Ubicación en el Mapa (Haz clic para marcar el punto exacto)
                    </Typography>
                    <MapaInteractiva lat={form.latitud} lng={form.longitud} onLocationSelect={(lat, lng) => setForm({...form, latitud: lat, longitud: lng})} />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField label="Latitud (Coordenada N/S)" fullWidth value={form.latitud} InputLabelProps={{ shrink: true }} placeholder="Selecciona en el mapa" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField label="Longitud (Coordenada E/O)" fullWidth value={form.longitud} InputLabelProps={{ shrink: true }} placeholder="Selecciona en el mapa" />
                  </Grid>                  
                  
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
                  
                  <Grid item size={{ xs: 12 }} sx={{ mt: 2 }}>
                    <Typography variant="h6" color={palette.botonPrincipal} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                      <Rule /> 4. Servicios Incluidos y Reglas
                    </Typography>
                    <Divider sx={{ my: 1, borderBottomWidth: 2, borderColor: palette.botonPrincipal }} />
                  </Grid>
                  <Grid item size={{ xs: 12 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#fff", border: '1px solid #ddd' }}>
                      <Stack direction="column" spacing={2}>
                        <Stack direction="row" spacing={3}>
                          <FormControlLabel control={<Checkbox checked={form.incluye_agua} onChange={(e) => setForm({...form, incluye_agua: e.target.checked})} />} label="Agua" />
                          <FormControlLabel control={<Checkbox checked={form.incluye_luz} onChange={(e) => setForm({...form, incluye_luz: e.target.checked})} />} label="Luz" />
                          <FormControlLabel control={<Checkbox checked={form.incluye_internet} onChange={(e) => setForm({...form, incluye_internet: e.target.checked})} />} label="WiFi" />
                        </Stack>
                        <Divider />
                        <FormControlLabel 
                          control={
                            <Checkbox 
                              checked={form.mascotas} 
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setForm({
                                  ...form, 
                                  mascotas: checked,
                                  reglas: checked 
                                    ? (form.reglas + "\n- Se aceptan mascotas (bajo estrictas políticas de higiene y comportamiento educado).").trim() 
                                    : form.reglas
                                });
                              }} 
                              color="warning"
                            />
                          } 
                          label={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Se aceptan mascotas</Typography>
                              <Typography variant="caption" color="textSecondary">* Bajo estrictas políticas de higiene y comportamiento educado.</Typography>
                            </Box>
                          } 
                        />
                      </Stack>
                    </Paper>
                  </Grid>
                  
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
                  const indexProp = propiedades.findIndex(p => p.id === sol.propiedad_id) + 1;
                  const propInfo = propiedades.find(p => p.id === sol.propiedad_id);

                  return (
                    <TableRow key={sol.id} hover>
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
                            fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.65rem'
                          }} 
                        />
                      </TableCell>

                      <TableCell>
                        <Stack direction="column" spacing={1}>
                          {sol.estado === 'pendiente' && (
                            <Button 
                              variant="contained" 
                              size="small" 
                              onClick={() => handleAceptarCita(sol.id, sol.correo_cliente, sol.nombre_cliente)}
                              sx={{ textTransform: 'none', borderRadius: '8px' }}
                            >
                              Aceptar Cita
                            </Button>
                          )}

                          {sol.estado === 'aceptada' && (
                            <Stack direction="row" spacing={1}>
                              <Button 
                                variant="contained" 
                                size="small" 
                                onClick={() => iniciarContrato(sol.id, 'inquilino')}
                                sx={{ 
                                  bgcolor: palette.titulos, 
                                  textTransform: 'none', 
                                  borderRadius: '8px', 
                                  fontSize: '0.7rem',
                                  '&:hover': { bgcolor: '#3d472f' } 
                                }}
                              >
                                + Arriendo
                              </Button>
                              <Button 
                                variant="contained" 
                                size="small" 
                                onClick={() => iniciarContrato(sol.id, 'comprador')}
                                sx={{ 
                                  bgcolor: palette.botonPrincipal, 
                                  textTransform: 'none', 
                                  borderRadius: '8px', 
                                  fontSize: '0.7rem' 
                                }}
                              >
                                + Venta
                              </Button>
                            </Stack>
                          )}
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
              <Button onClick={() => generarPDFContrato(c, c.tipo)}>Descargar</Button>
            </Paper>
          ))}</Box>
        )}

        {/* ✅ TABLA DE PAGOS CON EL NUEVO BUSCADOR Y LOS FILTROS */}
        {aseccion === "pagos" && (
          <Container maxWidth="lg">
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, color: palette.titulos }}>Control de Pagos </Typography>
            
            {/* ✅ CONTENEDOR DE BUSCADOR + BOTONES */}
            <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, justifyContent: 'space-between', alignItems: { md: 'center' } }}>
              
              {/* Botones de Estado */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button 
                  variant={filtroPagosAdmin === 'todos' ? 'contained' : 'outlined'} 
                  onClick={() => setFiltroPagosAdmin('todos')}
                  sx={{ borderRadius: 8, borderColor: palette.botonPrincipal, color: filtroPagosAdmin === 'todos' ? 'white' : palette.botonPrincipal, bgcolor: filtroPagosAdmin === 'todos' ? palette.botonPrincipal : 'transparent', '&:hover': { bgcolor: palette.botonPrincipal, color: 'white' } }}
                >
                  Todos
                </Button>
                <Button 
                  variant={filtroPagosAdmin === 'pendientes' ? 'contained' : 'outlined'} 
                  onClick={() => setFiltroPagosAdmin('pendientes')}
                  sx={{ borderRadius: 8, borderColor: '#f57c00', color: filtroPagosAdmin === 'pendientes' ? 'white' : '#f57c00', bgcolor: filtroPagosAdmin === 'pendientes' ? '#f57c00' : 'transparent', '&:hover': { bgcolor: '#f57c00', color: 'white' } }}
                >
                  Pendientes
                </Button>
                <Button 
                  variant={filtroPagosAdmin === 'aprobados' ? 'contained' : 'outlined'} 
                  onClick={() => setFiltroPagosAdmin('aprobados')}
                  sx={{ borderRadius: 8, borderColor: '#2e7d32', color: filtroPagosAdmin === 'aprobados' ? 'white' : '#2e7d32', bgcolor: filtroPagosAdmin === 'aprobados' ? '#2e7d32' : 'transparent', '&:hover': { bgcolor: '#2e7d32', color: 'white' } }}
                >
                  Aprobados
                </Button>
                <Button 
                  variant={filtroPagosAdmin === 'rechazados' ? 'contained' : 'outlined'} 
                  onClick={() => setFiltroPagosAdmin('rechazados')}
                  sx={{ borderRadius: 8, borderColor: '#c62828', color: filtroPagosAdmin === 'rechazados' ? 'white' : '#c62828', bgcolor: filtroPagosAdmin === 'rechazados' ? '#c62828' : 'transparent', '&:hover': { bgcolor: '#c62828', color: 'white' } }}
                >
                  Rechazados
                </Button>
              </Box>

              {/* ✅ BARRA DE BÚSQUEDA DE TEXTO */}
              <TextField
                variant="outlined"
                size="small"
                placeholder="Buscar cliente, propiedad o mes..."
                value={busquedaPagos}
                onChange={(e) => setBusquedaPagos(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                }}
                sx={{ 
                  bgcolor: 'white', 
                  borderRadius: 2, 
                  minWidth: { xs: '100%', md: '320px' },
                  '& .MuiOutlinedInput-root': { borderRadius: 2 } 
                }}
              />
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: "15px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <Table>
                <TableHead sx={{ bgcolor: palette.fondoAlterno }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: palette.titulos }}>Inquilino / Comprador</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: palette.titulos }}>Propiedad</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: palette.titulos }}>Mes / Monto</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: palette.titulos }}>Comprobante</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: palette.titulos }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: palette.titulos, textAlign: 'center' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagosAdminFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                        <Typography color="textSecondary">
                          {busquedaPagos ? "No hay resultados para tu búsqueda." : "No hay pagos que coincidan con este filtro."}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagosAdminFiltrados.map((pago) => (
                      <TableRow key={pago.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{pago.nombre_cliente}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(pago.fecha_pago).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{pago.nombre_propiedad}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color={palette.botonPrincipal}>${pago.monto}</Typography>
                          <Typography variant="caption">Mes: {pago.mes}</Typography>
                        </TableCell>
                        <TableCell>
                          {pago.comprobante ? (
                            <Button size="small" variant="outlined" startIcon={<InsertPhoto />} onClick={() => setFotoComprobante(pago.comprobante)} sx={{ textTransform: 'none', borderRadius: 2 }}>
                              Ver Foto
                            </Button>
                          ) : (
                            <Typography variant="caption" color="textSecondary">Sin imagen</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={pago.estado} 
                            size="small" 
                            sx={{ 
                              bgcolor: pago.estado === 'aprobado' ? '#e8f5e9' : pago.estado === 'rechazado' ? '#ffebee' : '#fff3e0', 
                              color: pago.estado === 'aprobado' ? '#2e7d32' : pago.estado === 'rechazado' ? '#c62828' : '#ef6c00',
                              fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem'
                            }} 
                          />
                        </TableCell>
                        <TableCell align="center">
                          {pago.estado === 'pendiente' ? (
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <IconButton onClick={() => handleEstadoPago(pago.id, 'aprobado')} sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', '&:hover': { bgcolor: '#c8e6c9' } }} title="Aprobar">
                                <Check fontSize="small" />
                              </IconButton>
                              <IconButton onClick={() => handleEstadoPago(pago.id, 'rechazado')} sx={{ bgcolor: '#ffebee', color: '#c62828', '&:hover': { bgcolor: '#ffcdd2' } }} title="Rechazar">
                                <Close fontSize="small" />
                              </IconButton>
                            </Stack>
                          ) : (
                            <Typography variant="caption" color="textSecondary">Revisado</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        )}

        {aseccion === "mantenimiento" && (
          <Container maxWidth="lg">
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, color: palette.titulos }}>Reportes de Mantenimiento </Typography>
            
            <TableContainer component={Paper} sx={{ borderRadius: "15px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <Table>
                <TableHead sx={{ bgcolor: palette.fondoAlterno }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: palette.titulos }}>Inquilino</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: palette.titulos }}>Propiedad</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: palette.titulos }}>Descripción del Daño</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: palette.titulos }}>Foto</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: palette.titulos }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: palette.titulos, textAlign: 'center' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mantenimientosAdmin.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                        <Typography color="textSecondary">No hay reportes de mantenimiento. ¡Todo perfecto!</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    mantenimientosAdmin.map((m) => (
                      <TableRow key={m.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{m.nombre_inquilino}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(m.fecha_reporte).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{m.nombre_propiedad}</Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: '250px' }}>
                          <Typography variant="body2" sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                            {m.descripcion}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {m.foto_url ? (
                            <Button size="small" variant="outlined" startIcon={<InsertPhoto />} onClick={() => setFotoMantenimiento(m.foto_url)} sx={{ textTransform: 'none', borderRadius: 2 }}>
                              Ver Foto
                            </Button>
                          ) : (
                            <Typography variant="caption" color="textSecondary">Sin imagen</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={m.estado} 
                            size="small" 
                            sx={{ 
                              bgcolor: m.estado === 'Solucionado' ? '#e8f5e9' : m.estado === 'En Revisión' ? '#fff3e0' : '#ffebee', 
                              color: m.estado === 'Solucionado' ? '#2e7d32' : m.estado === 'En Revisión' ? '#ef6c00' : '#c62828',
                              fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem'
                            }} 
                          />
                        </TableCell>
                        <TableCell align="center">
                          {m.estado === 'Pendiente' && (
                            <Button 
                              size="small" 
                              variant="contained" 
                              onClick={() => handleEstadoMantenimiento(m.id, 'En Revisión')} 
                              sx={{ bgcolor: '#f57c00', textTransform: 'none', borderRadius: 2, '&:hover': { bgcolor: '#ef6c00' } }}
                            >
                              Marcar en Revisión
                            </Button>
                          )}
                          {m.estado === 'En Revisión' && (
                            <Button 
                              size="small" 
                              variant="contained" 
                              onClick={() => handleEstadoMantenimiento(m.id, 'Solucionado')} 
                              sx={{ bgcolor: '#2e7d32', textTransform: 'none', borderRadius: 2, '&:hover': { bgcolor: '#1b5e20' } }}
                            >
                              Marcar Solucionado
                            </Button>
                          )}
                          {m.estado === 'Solucionado' && (
                            <Typography variant="caption" color="textSecondary">Cerrado el {new Date(m.fecha_solucion).toLocaleDateString()}</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        )}

      </Box>
    </Box>
  );
};

export default AdminDashboard;