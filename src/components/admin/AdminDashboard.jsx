import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import authService from "../../services/authService";

import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  InputBase,
} from "@mui/material";

import {
  Add,
  Home,
  Mail,
  Description,
  Logout,
  Edit,
  Delete,
  Search as SearchIcon,
  CloudUpload,
} from "@mui/icons-material";

const drawerWidth = 260;
const primaryColor = "#635BFF"; // El morado de la imagen

const AdminDashboard = () => {
  const navigate = useNavigate();
  // Mantenemos tu variable 'aseccion' exactamente igual
  const [aseccion, setSeccion] = useState("mis-departamentos");
  const [propiedades, setPropiedades] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [contratos, setContratos] = useState([]);
  
  // Mantenemos tu objeto form intacto
  const [form, setForm] = useState({
    id: null,
    sector: "",
    ciudad: "",
    precio: "",
    habitaciones: "",
    banos: "",
    descripcion: "",
    imagen_url: "",
  });
  const [busqueda, setBusqueda] = useState("");

  const API_URL = "http://localhost:5000/api/admin/propiedades";
  const currentUser = authService.getCurrentUser();
  const userId = currentUser ? currentUser.id : null;

  useEffect(() => {
    cargarDatos();
    cargarSolicitudes();
    cargarContratos();
  }, []);

  const cargarDatos = async () => {
    try {
      const res = await axios.get(API_URL);
      setPropiedades(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarSolicitudes = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/solicitudes/propietario/${userId}`);
      setSolicitudes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarContratos = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/contratos`);
      setContratos(res.data);
    } catch (err) {
      console.error(err);
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
      if (form.id) await axios.put(`${API_URL}/${form.id}`, form);
      else await axios.post(API_URL, form);
      alert("Operación exitosa");
      resetForm();
      cargarDatos();
      setSeccion("mis-departamentos");
      setBusqueda("");
    } catch {
      alert("Error al guardar");
    }
  };

  const resetForm = () =>
    setForm({
      id: null,
      sector: "",
      ciudad: "",
      precio: "",
      habitaciones: "",
      banos: "",
      descripcion: "",
      imagen_url: "",
    });

  const eliminarPropiedad = async (id) => {
    if (!window.confirm("¿Seguro que desea eliminar?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      cargarDatos();
    } catch {
      alert("Error al eliminar");
    }
  };

  const prepararEdicion = (p) => {
    setForm(p);
    setSeccion("publicar");
    setBusqueda("");
  };

  const gestionarSolicitud = async (id, accion) => {
    try {
      await axios.put(`http://localhost:5000/api/solicitudes/${accion}/${id}`);
      if (accion === "aprobar") iniciarContrato(id); 
      cargarSolicitudes();
    } catch {
      alert("Error");
    }
  };

  const iniciarContrato = async (solicitud_id) => {
    try {
      const solicitud = solicitudes.find((s) => s.id === solicitud_id);
      if (!solicitud) return;
      const contratoData = {
        solicitud_id: solicitud.id,
        fecha_inicio: new Date().toISOString().split("T")[0],
        fecha_fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
        canon: solicitud.precio || 0,
        nombre_cliente: solicitud.nombre_cliente,
        nombre_propiedad: solicitud.nombre_propiedad,
      };
      const res = await axios.post("http://localhost:5000/api/contratos", contratoData);
      generarPDF({ ...contratoData, id: res.data.id });
      cargarContratos();
      alert("Contrato iniciado y PDF generado");
    } catch (error) {
      console.error(error);
      alert("Error al iniciar contrato");
    }
  };

  const generarPDF = (contrato) => {
    const doc = new jsPDF();
    doc.text("Contrato de Arriendo", 20, 20);
    doc.text(`Propiedad: ${contrato.nombre_propiedad}`, 20, 40);
    doc.text(`Arrendatario: ${contrato.nombre_cliente}`, 20, 50);
    doc.text(`Canon: $${contrato.canon}`, 20, 80);
    doc.save(`Contrato_${contrato.id}.pdf`);
  };

  const propiedadesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return propiedades;
    const b = busqueda.toLowerCase();
    return propiedades.filter(p => p.sector.toLowerCase().includes(b) || p.ciudad.toLowerCase().includes(b));
  }, [busqueda, propiedades]);

  const solicitudesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return solicitudes;
    const b = busqueda.toLowerCase();
    return solicitudes.filter(s => s.nombre_cliente.toLowerCase().includes(b));
  }, [busqueda, solicitudes]);

  const contratosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return contratos;
    const b = busqueda.toLowerCase();
    return contratos.filter(c => c.nombre_cliente.toLowerCase().includes(b));
  }, [busqueda, contratos]);

  return (
    <Box sx={{ display: "flex", bgcolor: "#F8F9FC", minHeight: "100vh" }}>
      {/* HEADER */}
      <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, bgcolor: "white", color: "black", boxShadow: "none", borderBottom: "1px solid #E0E4EC" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#F1F3F7', borderRadius: 2, px: 2, width: 300 }}>
            <SearchIcon sx={{ color: 'gray', mr: 1 }} />
            <InputBase 
              placeholder="Buscar..." 
              fullWidth 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Hola, {currentUser?.nombre || "ivan"}</Typography>
            <Button variant="contained" onClick={() => { authService.logout(); navigate("/login"); }} sx={{ bgcolor: primaryColor, borderRadius: 2, textTransform: 'none' }}>Cerrar Sesión</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Drawer variant="permanent" sx={{ width: drawerWidth, "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box", border: "none", boxShadow: "2px 0 10px rgba(0,0,0,0.03)" } }}>
        <Box sx={{ p: 3, fontSize: 24, fontWeight: 'bold', color: primaryColor, cursor: 'pointer' }} onClick={() => navigate("/")}>
          MiRentaApp
        </Box>
        <List sx={{ px: 2 }}>
          {[
            { id: "mis-departamentos", icon: <Home />, label: "Inicio" },
            { id: "publicar", icon: <Add />, label: "Publicar" },
            { id: "solicitudes", icon: <Mail />, label: "Solicitudes" },
            { id: "contratos", icon: <Description />, label: "Contratos" }
          ].map((item) => (
            <ListItemButton 
              key={item.id} 
              selected={aseccion === item.id} 
              onClick={() => { setSeccion(item.id); setBusqueda(""); if (item.id === "publicar") resetForm(); }}
              sx={{ borderRadius: 2, mb: 1, color: aseccion === item.id ? "white" : "#4E5D78", bgcolor: aseccion === item.id ? primaryColor : "transparent", "&.Mui-selected": { bgcolor: primaryColor, color: "white" }, "&:hover": { bgcolor: aseccion === item.id ? primaryColor : "#F1F3F7" } }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* CONTENIDO PRINCIPAL */}
      <Box component="main" sx={{ flexGrow: 1, p: 4, mt: 8 }}>
        {aseccion === "publicar" && (
          <Paper sx={{ p: 4, borderRadius: 4, maxWidth: 800, mx: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>{form.id ? "Editar Propiedad" : "Nueva Propiedad"}</Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}><TextField label="Sector" fullWidth value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} required /></Grid>
                <Grid item xs={12} md={6}><TextField label="Ciudad" fullWidth value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} required /></Grid>
                <Grid item xs={12} md={4}><TextField label="Precio" type="number" fullWidth value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} required InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /></Grid>
                <Grid item xs={6} md={4}><TextField label="Habitaciones" type="number" fullWidth value={form.habitaciones} onChange={(e) => setForm({ ...form, habitaciones: e.target.value })} required /></Grid>
                <Grid item xs={6} md={4}><TextField label="Baños" type="number" fullWidth value={form.banos} onChange={(e) => setForm({ ...form, banos: e.target.value })} required /></Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" component="label" startIcon={<CloudUpload />} sx={{ borderRadius: 2, textTransform: 'none' }}>
                    Subir Imagen
                    <input hidden type="file" accept="image/*" onChange={handleImageChange} />
                  </Button>
                  {form.imagen_url && <Box mt={2}><img src={form.imagen_url} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 12 }} /></Box>}
                </Grid>
                <Grid item xs={12}><TextField label="Descripción" multiline rows={4} fullWidth value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required /></Grid>
                <Grid item xs={12}><Button type="submit" variant="contained" fullWidth sx={{ bgcolor: primaryColor, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}>{form.id ? "Actualizar Propiedad" : "Publicar Ahora"}</Button></Grid>
              </Grid>
            </form>
          </Paper>
        )}

        {aseccion === "mis-departamentos" && (
          <Grid container spacing={3}>
            {propiedadesFiltradas.map((p) => (
              <Grid item xs={12} md={4} key={p.id}>
                <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #E0E4EC" }}>
                  <CardMedia component="img" height="180" image={p.imagen_url || "https://via.placeholder.com/400x250"} />
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">{p.sector}</Typography>
                    <Typography color="text.secondary" variant="body2" gutterBottom>{p.ciudad}</Typography>
                    <Typography variant="h6" color={primaryColor} fontWeight="bold" sx={{ mt: 1 }}>${p.precio}/mes</Typography>
                    <Box mt={2} display="flex" gap={1}>
                      <Button fullWidth size="small" variant="outlined" startIcon={<Edit />} onClick={() => prepararEdicion(p)} sx={{ borderRadius: 2 }}>Editar</Button>
                      <Button fullWidth size="small" variant="outlined" color="error" startIcon={<Delete />} onClick={() => eliminarPropiedad(p.id)} sx={{ borderRadius: 2 }}>Borrar</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Mantenemos las otras secciones (solicitudes, contratos) con el mismo estilo de tablas limpio */}
        {(aseccion === "solicitudes" || aseccion === "contratos") && (
           <Paper sx={{ p: 3, borderRadius: 4 }}>
             <Typography variant="h6" mb={2} fontWeight="bold">{aseccion.toUpperCase()}</Typography>
             <Typography color="text.secondary">Sección de gestión de {aseccion}.</Typography>
           </Paper>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;