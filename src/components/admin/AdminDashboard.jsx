import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import authService from "../../services/authService";

// SE AGREGÓ Stack Y Container AQUÍ ABAJO PARA CORREGIR EL ERROR
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, AppBar,
  Toolbar, Typography, Button, Grid, Card, CardContent, CardMedia,
  TextField, InputAdornment, Paper, InputBase, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Chip, Divider,
  Stack, Container 
} from "@mui/material";

import {
  Add, Home, Mail, Description, Edit, Delete, Search as SearchIcon, 
  CloudUpload, EventAvailable, CalendarMonth, LocationOn
} from "@mui/icons-material";

// --- CONFIGURACIÓN DE ESTILO ---
const drawerWidth = 260;
const palette = {
  fondoPrincipal: "#E8DCCB",    // Beige suave
  fondoAlterno: "#F5EFE6",      // Crema claro
  titulos: "#4E5B3C",           // Verde oliva oscuro
  textoSecundario: "#BFA58A",    // Arena tostado
  botonPrincipal: "#C66A3D",     // Terracota
  textoBoton: "#FFFFFF",        // Blanco
  detallesDorado: "#C9A227"      // Dorado suave
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [aseccion, setSeccion] = useState("mis-departamentos");
  const [propiedades, setPropiedades] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [form, setForm] = useState({
    id: null,
    sector: "",
    ciudad: "",
    direccion: "", 
    precio_mensual: "",
    habitaciones: "",
    banos: "",
    metros_cuadrados: "",
    descripcion: "",
    imagen_url: "",
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
        await axios.delete(`${API_PROPIDIADES}/${id}`);
        cargarDatos();
        alert("Eliminado correctamente");
      } catch { alert("Error al eliminar"); }
    }
  };

  const prepararEdicion = (p) => {
    setForm({ ...p, precio_mensual: p.precio_mensual || "", habitaciones: p.habitaciones || "", banos: p.banos || "" });
    setSeccion("publicar");
  };

  // --- MODIFICACIÓN: FUNCIONAR CONTRATO (ENVÍO AL INQUILINO) ---
const iniciarContrato = async (solicitud_id) => {
  const solicitud = solicitudes.find((s) => s.id === solicitud_id);
  
  if (!solicitud) return;

  // Si no tiene arrendatario_id, es un invitado
  if (!solicitud.arrendatario_id) {
    alert(`📢 CONTACTO DE INVITADO: El cliente ${solicitud.nombre_cliente} no está registrado. 
    \nPor favor, contáctelo para que cree una cuenta y así poder enviarle el contrato digital.`);
    return;
  }

  // Si tiene ID, procedemos con el contrato digital
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

    // 1. Guardar en la BD para que le aparezca al inquilino
    const res = await axios.post("http://localhost:5000/api/contratos", contratoData);
    
    // 2. Generar el PDF para el administrador
    generarPDF({ ...contratoData, id: res.data.id });
    
    alert("✅ Contrato enviado exitosamente al Inquilino.");
    cargarContratos(); // Recargar lista
  } catch (error) {
    console.error("Error:", error);
    alert("Hubo un error al generar el contrato digital.");
  }
};

  // --- MODIFICACIÓN: PDF SIMULADO NOTARIADO ---
  const generarPDF = (contrato) => {
    const doc = new jsPDF();
    const fechaHoy = new Date().toLocaleDateString();

    // Bordes de documento oficial
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 277); 
    doc.rect(12, 12, 186, 273);

    // Encabezado
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text("REPÚBLICA DEL ECUADOR", 105, 22, { align: "center" });
    doc.text("CONSEJO DE LA JUDICATURA - NOTARÍA DIGITAL MiRentaApp", 105, 27, { align: "center" });
    
    doc.setFontSize(18);
    doc.setTextColor(78, 91, 60); // Verde Oliva
    doc.text("CONTRATO DE ARRENDAMIENTO NOTARIADO", 105, 45, { align: "center" });
    
    doc.setDrawColor(198, 106, 61); // Terracota
    doc.line(35, 50, 175, 50);

    // Contenido Legal
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    const cuerpoTexto = `En la ciudad de Quito, a los ${fechaHoy}, comparecen libre y voluntariamente por una parte el Administrador de MiRentaApp en representación del Propietario, y por otra parte el Sr./Sra. ${contrato.nombre_cliente.toUpperCase()}, en calidad de ARRENDATARIO.

    PRIMERA: OBJETO.- El propietario entrega en arrendamiento el inmueble ubicado en ${contrato.nombre_propiedad}.
    
    SEGUNDA: CANON.- El precio mensual pactado es de $${contrato.canon} USD, el cual será gestionado digitalmente.

    TERCERA: PLAZO.- La vigencia del presente instrumento es de 12 meses, iniciando el ${contrato.fecha_inicio} hasta el ${contrato.fecha_fin}.

    Este documento tiene validez digital simulada para fines académicos.`;

    const textLines = doc.splitTextToSize(cuerpoTexto, 160);
    doc.text(textLines, 25, 65);

    // Firmas
    doc.setFont("times", "bold");
    doc.text("F. __________________________", 45, 230);
    doc.text("EL PROPIETARIO", 55, 240);
    
    doc.text("F. __________________________", 125, 230);
    doc.text("EL ARRENDATARIO", 132, 240);

    // Sello Notarial Digital
    doc.setDrawColor(78, 91, 60);
    doc.setLineWidth(1);
    doc.ellipse(160, 260, 22, 12);
    doc.setFontSize(8);
    doc.text("NOTARÍA DIGITAL", 160, 259, { align: "center" });
    doc.text("VERIFICADO", 160, 263, { align: "center" });

    doc.save(`Contrato_MiRenta_${contrato.nombre_cliente}.pdf`);
  };

  const propiedadesFiltradas = useMemo(() => {
    const b = busqueda.toLowerCase();
    return propiedades.filter(p => p.sector?.toLowerCase().includes(b) || p.ciudad?.toLowerCase().includes(b));
  }, [busqueda, propiedades]);

  return (
    <Box sx={{ display: "flex", bgcolor: palette.fondoPrincipal, minHeight: "100vh" }}>
      
      {/* HEADER SUPERIOR */}
      <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, bgcolor: "white", color: palette.titulos, boxShadow: "none", borderBottom: `1px solid ${palette.textoSecundario}33` }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: palette.fondoAlterno, borderRadius: 1, px: 2, width: 350 }}>
            <SearchIcon sx={{ color: palette.textoSecundario, mr: 1 }} />
            <InputBase placeholder="Buscar en mis registros..." fullWidth value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{currentUser?.nombre || "Propietario"}</Typography>
            <Button variant="contained" onClick={() => { authService.logout(); navigate("/login"); }} sx={{ bgcolor: palette.botonPrincipal, textTransform: 'none', borderRadius: 0 }}>Cerrar Sesión</Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR LATERAL */}
      <Drawer variant="permanent" sx={{ width: drawerWidth, "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box", border: "none", bgcolor: palette.fondoAlterno } }}>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: palette.titulos, letterSpacing: '-1px', cursor: 'pointer' }} onClick={() => navigate("/")}>MiRentaAPP</Typography>
          <Typography variant="caption" sx={{ color: palette.textoSecundario }}>Panel Administrativo</Typography>
        </Box>
        <Divider sx={{ mx: 2, mb: 2 }} />
        <List sx={{ px: 2 }}>
          {[
            { id: "mis-departamentos", icon: <Home />, label: "Mis Propiedades" },
            { id: "publicar", icon: <Add />, label: "Publicar Nuevo" },
            { id: "solicitudes", icon: <Mail />, label: "Citas / Agendas" },
            { id: "contratos", icon: <Description />, label: "Contratos Generados" }
          ].map((item) => (
            <ListItemButton 
              key={item.id} 
              selected={aseccion === item.id} 
              onClick={() => { setSeccion(item.id); if (item.id === "publicar") resetForm(); }}
              sx={{ borderRadius: 1, mb: 1, color: palette.titulos, "&.Mui-selected": { bgcolor: palette.titulos, color: "white", "& .MuiListItemIcon-root": { color: "white" } } }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* CONTENIDO DINÁMICO */}
      <Box component="main" sx={{ flexGrow: 1, p: 5, mt: 10 }}>
        
        {aseccion === "mis-departamentos" && (
          <Grid container spacing={4}>
            {propiedadesFiltradas.map((p) => (
              <Grid item xs={12} md={4} key={p.id}>
                <Card sx={{ borderRadius: 0, border: `1px solid ${palette.textoSecundario}33`, boxShadow: "none" }}>
                  <CardMedia component="img" height="200" image={p.imagen_url || "https://via.placeholder.com/400"} />
                  <CardContent sx={{ bgcolor: "white" }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: palette.titulos }}>{p.sector}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" color={palette.textoSecundario} mb={2}>
                      <LocationOn fontSize="small" /><Typography variant="caption">{p.ciudad}</Typography>
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: palette.botonPrincipal, mb: 2 }}>${p.precio_mensual}</Typography>
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" startIcon={<Edit />} onClick={() => prepararEdicion(p)} sx={{ borderRadius: 0, borderColor: palette.titulos, color: palette.titulos }}>Editar</Button>
                      <Button fullWidth variant="outlined" color="error" startIcon={<Delete />} onClick={() => eliminarPropiedad(p.id)} sx={{ borderRadius: 0 }}>Borrar</Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {aseccion === "publicar" && (
          <Paper elevation={0} sx={{ p: 5, borderRadius: 0, border: `1px solid ${palette.textoSecundario}33`, maxWidth: 900, mx: "auto" }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, color: palette.titulos, fontFamily: 'serif' }}>{form.id ? "Actualizar Registro" : "Publicar Nuevo Inmueble"}</Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}><TextField label="Sector / Barrio" fullWidth value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} required /></Grid>
                <Grid item xs={12} md={6}><TextField label="Ciudad" fullWidth value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} required /></Grid>
                <Grid item xs={12}><TextField label="Dirección Exacta" fullWidth value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} required /></Grid>
                <Grid item xs={12} md={4}><TextField label="Precio Mensual" type="number" fullWidth value={form.precio_mensual} onChange={(e) => setForm({ ...form, precio_mensual: e.target.value })} required /></Grid>
                <Grid item xs={6} md={4}><TextField label="Habitaciones" type="number" fullWidth value={form.habitaciones} onChange={(e) => setForm({ ...form, habitaciones: e.target.value })} required /></Grid>
                <Grid item xs={6} md={4}><TextField label="Baños" type="number" fullWidth value={form.banos} onChange={(e) => setForm({ ...form, banos: e.target.value })} required /></Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" component="label" startIcon={<CloudUpload />} sx={{ borderColor: palette.detallesDorado, color: palette.detallesDorado }}>
                    Subir Fotografía Principal
                    <input hidden type="file" accept="image/*" onChange={handleImageChange} />
                  </Button>
                  {form.imagen_url && <Box mt={2}><img src={form.imagen_url} alt="Vista previa" style={{ width: '100%', maxHeight: 250, objectFit: 'cover', borderRadius: 0 }} /></Box>}
                </Grid>
                <Grid item xs={12}><TextField label="Descripción detallada" multiline rows={3} fullWidth value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required /></Grid>
                <Grid item xs={12}><Button type="submit" variant="contained" fullWidth sx={{ bgcolor: palette.botonPrincipal, py: 2, fontWeight: 'bold', fontSize: '1.1rem', borderRadius: 0 }}>{form.id ? "Guardar Cambios" : "Publicar Ahora"}</Button></Grid>
              </Grid>
            </form>
          </Paper>
        )}

        {aseccion === "solicitudes" && (
  <Box>
    <Typography variant="h4" sx={{ fontWeight: 800, color: palette.titulos, mb: 4, fontFamily: 'serif' }}>
      Gestión de Citas y Agendas
    </Typography>
    <TableContainer component={Paper} sx={{ borderRadius: 0, boxShadow: "none", border: `1px solid ${palette.textoSecundario}33` }}>
      <Table>
        <TableHead sx={{ bgcolor: palette.fondoAlterno }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 800 }}>Inmueble</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Cliente Interesado</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Fecha Cita</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Hora</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Estado</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Acción</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {solicitudes.length > 0 ? solicitudes.map((sol) => (
            <TableRow key={sol.id} sx={{ "&:hover": { bgcolor: palette.fondoAlterno } }}>
              <TableCell>#{sol.propiedad_id}</TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{sol.nombre_cliente}</Typography>
                {!sol.arrendatario_id && (
                  <Typography variant="caption" sx={{ color: palette.botonPrincipal, fontStyle: 'italic' }}>
                    (Invitado sin cuenta)
                  </Typography>
                )}
              </TableCell>
              <TableCell>{sol.fecha_cita || "Pendiente"}</TableCell>
              <TableCell>{sol.hora_cita || "--:--"}</TableCell>
              <TableCell>
                <Chip 
                  label={sol.estado || "pendiente"} 
                  size="small" 
                  sx={{ bgcolor: palette.fondoPrincipal, color: palette.titulos, fontWeight: 'bold', borderRadius: 0 }} 
                />
              </TableCell>
              <TableCell>
                {/* LÓGICA DE BOTÓN SEGÚN TIPO DE USUARIO */}
                {sol.arrendatario_id ? (
                  <Button 
                    variant="contained" 
                    size="small" 
                    onClick={() => iniciarContrato(sol.id)} 
                    sx={{ bgcolor: palette.botonPrincipal, borderRadius: 0, textTransform: 'none', fontWeight: 'bold' }}
                  >
                    Generar Contrato
                  </Button>
                ) : (
                  <Stack direction="column" spacing={0.5}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => alert(`El cliente ${sol.nombre_cliente} debe registrarse para procesar su contrato legal.`)}
                      sx={{ borderColor: palette.botonPrincipal, color: palette.botonPrincipal, borderRadius: 0, textTransform: 'none', fontSize: '0.7rem' }}
                    >
                      Solicitar Registro
                    </Button>
                  </Stack>
                )}
              </TableCell>
            </TableRow>
          )) : (
            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 10 }}>No se han recibido agendas de citas aún.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
)}
        {aseccion === "contratos" && (
           <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: palette.titulos, mb: 4, fontFamily: 'serif' }}>Historial de Contratos Digitales</Typography>
              <Grid container spacing={2}>
                 {contratos.length > 0 ? contratos.map(c => (
                    <Grid item xs={12} key={c.id}>
                       <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 0, borderLeft: `5px solid ${palette.detallesDorado}`, bgcolor: "white" }}>
                          <Box>
                             <Typography variant="subtitle1" fontWeight="bold">{c.nombre_cliente}</Typography>
                             <Typography variant="caption" color="text.secondary">Propiedad: {c.nombre_propiedad} | Fecha: {c.fecha_inicio}</Typography>
                          </Box>
                          <Button variant="outlined" size="small" sx={{ borderColor: palette.titulos, color: palette.titulos, borderRadius: 0, fontWeight: 'bold' }} onClick={() => generarPDF(c)}>Descargar PDF</Button>
                       </Paper>
                    </Grid>
                 )) : <Typography sx={{ p: 4 }}>No hay contratos generados.</Typography>}
              </Grid>
           </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;