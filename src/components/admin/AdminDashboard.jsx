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
  Stack, Container 
} from "@mui/material";

import {
  Add, Home, Mail, Description, Edit, Delete, Search as SearchIcon, 
  CloudUpload, EventAvailable, CalendarMonth, LocationOn, CheckCircle
} from "@mui/icons-material";

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
  const [aseccion, setSeccion] = useState("mis-departamentos");
  const [propiedades, setPropiedades] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [form, setForm] = useState({
    id: null, sector: "", ciudad: "", direccion: "", precio_mensual: "", 
    habitaciones: "", banos: "", metros_cuadrados: "", descripcion: "", imagen_url: "",
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

  const handleAceptarCita = async (id, correo, nombre) => {
  try {
    // Asegúrate de que esta URL coincida con tu backend
    await axios.put(`http://localhost:5000/api/solicitudes/aceptar/${id}`);
    alert(`✅ Cita aceptada. Se ha enviado el correo a ${correo}.`);
    cargarSolicitudes(); // Recarga la tabla para ver el cambio
  } catch (error) {
    console.error("Error al aceptar:", error);
    alert("Error al aceptar la cita. Revisa que la ruta /api/solicitudes/aceptar/ esté bien configurada.");
  }
};


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, imagen_url: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...form,
        codigo: form.id ? form.codigo : `PROP-${Math.floor(Math.random() * 9000 + 1000)}`,
        precio_mensual: parseFloat(form.precio_mensual) || 0,
        habitaciones: parseInt(form.habitaciones) || 0,
        banos: parseInt(form.banos) || 0,
        metros_cuadrados: parseFloat(form.metros_cuadrados) || 0,
        direccion: form.direccion.trim() || "Dirección no especificada",
        estado: form.estado || "disponible"
      };

      if (form.id) {
        await axios.put(`${API_PROPIEDADES}/${form.id}`, dataToSend);
        alert("Propiedad actualizada");
      } else {
        await axios.post(API_PROPIEDADES, dataToSend);
        alert("Propiedad publicada");
      }
      resetForm();
      cargarDatos();
      setSeccion("mis-departamentos");
    } catch (error) { console.error(error); }
  };

  const resetForm = () => setForm({ id: null, sector: "", ciudad: "", direccion: "", precio_mensual: "", habitaciones: "", banos: "", metros_cuadrados: "", descripcion: "", imagen_url: "" });

  const eliminarPropiedad = async (id) => {
    if (window.confirm("¿Seguro que desea eliminar esta propiedad?")) {
      try {
        await axios.delete(`${API_PROPIEDADES}/${id}`);
        cargarDatos();
        alert("Eliminado correctamente");
      } catch { alert("Error al eliminar"); }
    }
  };

  const prepararEdicion = (p) => {
    setForm({ ...p, precio_mensual: p.precio_mensual || "", habitaciones: p.habitaciones || "", banos: p.banos || "" });
    setSeccion("publicar");
  };

  const iniciarContrato = async (solicitud_id) => {
    const solicitud = solicitudes.find((s) => s.id === solicitud_id);
    if (!solicitud) return;

    if (!solicitud.arrendatario_id) {
      alert(`📢 INVITADO DETECTADO: El cliente ${solicitud.nombre_cliente} debe registrarse con el correo ${solicitud.correo_cliente} para habilitar el contrato digital.`);
      return;
    }

    try {
      const contratoData = {
        solicitud_id: solicitud.id,
        arrendatario_id: solicitud.arrendatario_id,
        propiedad_id: solicitud.propiedad_id,
        fecha_inicio: new Date().toISOString().split("T")[0],
        fecha_fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
        canon: solicitud.precio_mensual || 0,
        nombre_cliente: solicitud.nombre_cliente,
        nombre_propiedad: solicitud.sector_propiedad || "Departamento",
      };

      const res = await axios.post("http://localhost:5000/api/contratos", contratoData);
      generarPDF({ ...contratoData, id: res.data.id });
      alert("✅ Contrato enviado exitosamente al Inquilino.");
      cargarContratos();
      cargarSolicitudes();
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un error al generar el contrato digital.");
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
          <Typography variant="h5" sx={{ fontWeight: 900, color: palette.titulos }} onClick={() => navigate("/")}>MiRentaAPP</Typography>
        </Box>
        <List sx={{ px: 2 }}>
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
        {aseccion === "mis-departamentos" && (
          <Grid container spacing={4}>
            {propiedadesFiltradas.map((p) => (
              <Grid item xs={12} md={4} key={p.id}>
                <Card sx={{ borderRadius: 0, border: `1px solid ${palette.textoSecundario}33` }}>
                  <CardMedia component="img" height="200" image={p.imagen_url || "https://via.placeholder.com/400"} />
                  <CardContent>
                    <Typography variant="h6">{p.sector}</Typography>
                    <Typography variant="h5" color={palette.botonPrincipal}>${p.precio_mensual}</Typography>
                    <Stack direction="row" spacing={1} mt={2}>
                      <Button fullWidth onClick={() => prepararEdicion(p)}>Editar</Button>
                      <Button fullWidth color="error" onClick={() => eliminarPropiedad(p.id)}>Borrar</Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {aseccion === "publicar" && (
          <Paper sx={{ p: 5, maxWidth: 800, mx: "auto" }}>
            <Typography variant="h4" mb={4}>{form.id ? "Editar Propiedad" : "Nueva Propiedad"}</Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={6}><TextField label="Sector" fullWidth value={form.sector} onChange={(e) => setForm({...form, sector: e.target.value})} /></Grid>
                <Grid item xs={6}><TextField label="Ciudad" fullWidth value={form.ciudad} onChange={(e) => setForm({...form, ciudad: e.target.value})} /></Grid>
                <Grid item xs={4}><TextField label="Precio" fullWidth value={form.precio_mensual} onChange={(e) => setForm({...form, precio_mensual: e.target.value})} /></Grid>
                <Grid item xs={4}><TextField label="Habitaciones" fullWidth value={form.habitaciones} onChange={(e) => setForm({...form, habitaciones: e.target.value})} /></Grid>
                <Grid item xs={4}><TextField label="Baños" fullWidth value={form.banos} onChange={(e) => setForm({...form, banos: e.target.value})} /></Grid>
                <Grid item xs={12}><TextField label="Descripción" multiline rows={3} fullWidth value={form.descripcion} onChange={(e) => setForm({...form, descripcion: e.target.value})} /></Grid>
                <Grid item xs={12}><Button type="submit" variant="contained" fullWidth sx={{ bgcolor: palette.botonPrincipal }}>Guardar</Button></Grid>
              </Grid>
            </form>
          </Paper>
        )}

        {aseccion === "solicitudes" && (
          <Box>
            <Typography variant="h4" mb={4}>Gestión de Citas y Agendas</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: palette.fondoAlterno }}>
                  <TableRow>
                    <TableCell>Inmueble</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Fecha / Hora</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {solicitudes.map((sol) => (
                    <TableRow key={sol.id}>
                      <TableCell>#{sol.propiedad_id}</TableCell>
                      <TableCell>
                        {sol.nombre_cliente} <br/>
                        <Typography variant="caption" color="textSecondary">{sol.correo_cliente}</Typography>
                      </TableCell>
                      <TableCell>{sol.fecha_cita} | {sol.hora_cita}</TableCell>
                      <TableCell><Chip label={sol.estado} color={sol.estado === 'aceptada' ? 'success' : 'default'} /></TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {sol.estado === 'pendiente' && (
                            <Button variant="contained" size="small" sx={{ bgcolor: palette.titulos }} onClick={() => handleAceptarCita(sol.id, sol.correo_cliente, sol.nombre_cliente)}>Aceptar Cita</Button>
                          )}
                          <Button 
                            variant="contained" size="small" sx={{ bgcolor: palette.botonPrincipal }} 
                            onClick={() => iniciarContrato(sol.id)}
                            disabled={sol.estado !== 'aceptada'}
                          >
                            Generar Contrato
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {aseccion === "contratos" && (
          <Box>
            <Typography variant="h4" mb={4}>Historial de Contratos</Typography>
            {contratos.map(c => (
              <Paper key={c.id} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography fontWeight="bold">{c.nombre_cliente}</Typography>
                  <Typography variant="caption">{c.nombre_propiedad}</Typography>
                </Box>
                <Button onClick={() => generarPDF(c)}>PDF</Button>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;