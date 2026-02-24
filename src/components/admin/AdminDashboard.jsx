import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

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
  Divider,
  Tooltip,
  InputBase,
  alpha,
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
} from "@mui/icons-material";

const drawerWidth = 260;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState("mis-departamentos");
  const [propiedades, setPropiedades] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [contratos, setContratos] = useState([]);
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
  const userId = localStorage.getItem("userId");

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
      const res = await axios.get(
        `http://localhost:5000/api/solicitudes/propietario/${userId}`
      );
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
      if (accion === "aprobar") iniciarContrato(id); // Inicia el contrato al aprobar
      cargarSolicitudes();
    } catch {
      alert("Error");
    }
  };

  // -------------------- FUNCIONES DE CONTRATOS --------------------
  const iniciarContrato = async (solicitud_id) => {
    try {
      // Buscar info de la solicitud
      const solicitud = solicitudes.find((s) => s.id === solicitud_id);
      if (!solicitud) return;

      const contratoData = {
        solicitud_id: solicitud.id,
        fecha_inicio: new Date().toISOString().split("T")[0],
        fecha_fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          .toISOString()
          .split("T")[0],
        canon: solicitud.precio || 0,
        nombre_cliente: solicitud.nombre_cliente,
        nombre_propiedad: solicitud.nombre_propiedad,
      };

      // Crear contrato en backend
      const res = await axios.post("http://localhost:5000/api/contratos", contratoData);
      const nuevoContrato = res.data;

      // Generar PDF
      generarPDF({ ...contratoData, id: nuevoContrato.id });

      // Recargar contratos
      cargarContratos();
      alert("Contrato iniciado y PDF generado");
    } catch (error) {
      console.error(error);
      alert("Error al iniciar contrato");
    }
  };

  const generarPDF = (contrato) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Contrato de Arriendo", 20, 20);
    doc.setFontSize(12);
    doc.text(`Propiedad: ${contrato.nombre_propiedad}`, 20, 40);
    doc.text(`Arrendatario: ${contrato.nombre_cliente}`, 20, 50);
    doc.text(
      `Fecha Inicio: ${new Date(contrato.fecha_inicio).toLocaleDateString()}`,
      20,
      60
    );
    doc.text(
      `Fecha Fin: ${new Date(contrato.fecha_fin).toLocaleDateString()}`,
      20,
      70
    );
    doc.text(`Canon: $${contrato.canon}`, 20, 80);
    doc.save(`Contrato_${contrato.id}.pdf`);
  };

  const actualizarContrato = async (id) => {
    alert(`Funcionalidad de actualización para contrato ${id} en desarrollo`);
  };

  const descargarPDF = (contrato) => {
    generarPDF(contrato);
  };

  // -------------------- FILTROS --------------------
  const propiedadesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return propiedades;
    const b = busqueda.toLowerCase();
    return propiedades.filter(
      (p) =>
        p.sector.toLowerCase().includes(b) ||
        p.ciudad.toLowerCase().includes(b) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(b))
    );
  }, [busqueda, propiedades]);

  const solicitudesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return solicitudes;
    const b = busqueda.toLowerCase();
    return solicitudes.filter(
      (s) =>
        s.nombre_cliente.toLowerCase().includes(b) ||
        s.nombre_propiedad.toLowerCase().includes(b) ||
        s.estado.toLowerCase().includes(b)
    );
  }, [busqueda, solicitudes]);

  const contratosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return contratos;
    const b = busqueda.toLowerCase();
    return contratos.filter(
      (c) =>
        c.nombre_cliente.toLowerCase().includes(b) ||
        c.nombre_propiedad.toLowerCase().includes(b)
    );
  }, [busqueda, contratos]);

  // -------------------- COMPONENTE BUSCADOR --------------------
  const Buscador = () => (
    <Box
      sx={{
        position: "relative",
        borderRadius: 1,
        backgroundColor: (theme) => alpha(theme.palette.common.white, 0.15),
        "&:hover": {
          backgroundColor: (theme) => alpha(theme.palette.common.white, 0.25),
        },
        marginLeft: 2,
        width: "auto",
        flexGrow: 1,
        maxWidth: 400,
      }}
    >
      <Box
        sx={{
          padding: (theme) => theme.spacing(0, 2),
          height: "100%",
          position: "absolute",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "inherit",
        }}
      >
        <SearchIcon />
      </Box>
      <InputBase
        placeholder={
          seccion === "mis-departamentos"
            ? "Buscar propiedades..."
            : seccion === "solicitudes"
            ? "Buscar solicitudes..."
            : seccion === "historial-contratos"
            ? "Buscar contratos..."
            : ""
        }
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        sx={{
          color: "inherit",
          width: "100%",
          paddingLeft: (theme) => theme.spacing(5),
          paddingY: 0.5,
        }}
      />
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* APPBAR */}
      <AppBar
        position="fixed"
        color="primary"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Typography variant="h6" fontWeight={600} noWrap>
            Panel Propietario
          </Typography>
          <Buscador />
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <Box
          sx={{
            px: 2,
            py: 3,
            borderBottom: 1,
            borderColor: "divider",
            fontWeight: "bold",
            fontSize: 24,
            color: "primary.main",
            textAlign: "center",
            userSelect: "none",
          }}
        >
          MiRentaAPP
        </Box>

        <List>
          {[{ id: "publicar", icon: <Add />, label: "Publicar" },
            { id: "mis-departamentos", icon: <Home />, label: "Mis Propiedades" },
            { id: "solicitudes", icon: <Mail />, label: "Solicitudes" },
            { id: "contratos", icon: <Description />, label: "Contratos" }
          ].map(({ id, icon, label }) => (
            <Tooltip key={id} title={`Ir a ${label}`} placement="right">
              <ListItemButton
                selected={seccion === id}
                onClick={() => {
                  setSeccion(id);
                  setBusqueda("");
                  if (id === "publicar") resetForm();
                }}
              >
                <ListItemIcon sx={{ color: seccion === id ? "primary.main" : "inherit" }}>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            </Tooltip>
          ))}

          {/* SUB BOTON HISTORIAL CONTRATOS */}
          {seccion === "contratos" && (
            <ListItemButton
              sx={{ pl: 4 }}
              selected={seccion === "historial-contratos"}
              onClick={() => setSeccion("historial-contratos")}
            >
              <ListItemText primary="Historial de Contratos" />
            </ListItemButton>
          )}
        </List>

        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ px: 2, py: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Logout />}
            onClick={() => navigate("/login")}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Drawer>

      {/* CONTENIDO */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          minHeight: "100vh",
          backgroundColor: (theme) => theme.palette.grey[100],
        }}
      >
        <Toolbar />

        {/* PUBLICAR */}
        {seccion === "publicar" && (
          <Paper sx={{ p: 4, maxWidth: 900, mx: "auto" }}>
            {/* FORMULARIO */}
            <Typography variant="h5" gutterBottom>{form.id ? "Editar Propiedad" : "Nueva Propiedad"}</Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField label="Sector" fullWidth value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} required />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Ciudad" fullWidth value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} required />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="Precio" type="number" fullWidth value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} required />
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField label="Habitaciones" type="number" fullWidth value={form.habitaciones} onChange={(e) => setForm({ ...form, habitaciones: e.target.value })} required />
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField label="Baños" type="number" fullWidth value={form.banos} onChange={(e) => setForm({ ...form, banos: e.target.value })} required />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" component="label">
                    Subir Imagen
                    <input hidden type="file" accept="image/*" onChange={handleImageChange} />
                  </Button>
                  {form.imagen_url && (
                    <Box mt={2}><img src={form.imagen_url} alt="preview" style={{ width: 200, borderRadius: 8 }} /></Box>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Descripción" multiline rows={4} fullWidth value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
                </Grid>
                <Grid item xs={12} textAlign="right">
                  <Button type="submit" variant="contained">{form.id ? "Actualizar" : "Publicar"}</Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}

        {/* MIS DEPARTAMENTOS */}
        {seccion === "mis-departamentos" && (
          <Grid container spacing={3}>
            {propiedadesFiltradas.length === 0 ? (
              <Typography variant="body1" color="text.secondary" textAlign="center" mt={10}>No se encontraron propiedades que coincidan.</Typography>
            ) : (
              propiedadesFiltradas.map((p) => (
                <Grid item xs={12} md={4} key={p.id}>
                  <Card>
                    <CardMedia component="img" height="200" image={p.imagen_url || "https://via.placeholder.com/400x250"} alt="Propiedad" />
                    <CardContent>
                      <Typography variant="h6">{p.sector}</Typography>
                      <Typography color="text.secondary">{p.ciudad}</Typography>
                      <Chip label={`$${p.precio}/mes`} sx={{ mt: 1 }} />
                      <Box mt={2} display="flex" gap={1}>
                        <Button startIcon={<Edit />} onClick={() => prepararEdicion(p)}>Editar</Button>
                        <Button color="error" startIcon={<Delete />} onClick={() => eliminarPropiedad(p.id)}>Eliminar</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}

        {/* SOLICITUDES */}
        {seccion === "solicitudes" && (
          <Paper>
            {solicitudesFiltradas.length === 0 ? (
              <Typography variant="body1" color="text.secondary" textAlign="center" mt={10}>No se encontraron solicitudes.</Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Propiedad</TableCell>
                    <TableCell>Solicitante</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {solicitudesFiltradas.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.nombre_propiedad}</TableCell>
                      <TableCell>{s.nombre_cliente}</TableCell>
                      <TableCell>{new Date(s.fecha).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip label={s.estado.toUpperCase()} color={s.estado === "aprobada" ? "success" : s.estado === "rechazada" ? "error" : "warning"} />
                      </TableCell>
                      <TableCell align="right">
                        {s.estado === "pendiente" ? (
                          <>
                            <Button size="small" onClick={() => gestionarSolicitud(s.id, "aprobar")}>Aprobar</Button>
                            <Button size="small" color="error" onClick={() => gestionarSolicitud(s.id, "rechazar")}>Rechazar</Button>
                          </>
                        ) : (
                          <Typography variant="caption" color="text.secondary" fontStyle="italic">Gestión finalizada</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        )}

        {/* CONTRATOS */}
        {seccion === "contratos" && (
          <Paper sx={{ p: 5, textAlign: "center" }}>
            <Typography variant="h5" gutterBottom>Módulo de Contratos</Typography>
            <Typography color="text.secondary">Para iniciar un trámite, aprueba primero una solicitud.</Typography>
          </Paper>
        )}

        {/* HISTORIAL DE CONTRATOS */}
        {seccion === "historial-contratos" && (
          <Paper sx={{ p: 4 }}>
            {contratosFiltrados.length === 0 ? (
              <Typography variant="body1" color="text.secondary" textAlign="center" mt={5}>No hay contratos registrados.</Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Propiedad</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Inicio</TableCell>
                    <TableCell>Fin</TableCell>
                    <TableCell>Canon</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contratosFiltrados.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.id}</TableCell>
                      <TableCell>{c.nombre_propiedad}</TableCell>
                      <TableCell>{c.nombre_cliente}</TableCell>
                      <TableCell>{new Date(c.fecha_inicio).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(c.fecha_fin).toLocaleDateString()}</TableCell>
                      <TableCell>${c.canon}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => descargarPDF(c)}>PDF</Button>
                        <Button size="small" onClick={() => actualizarContrato(c.id)}>Actualizar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
