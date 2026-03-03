import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Select,
  MenuItem,
  Chip,
  FormControl,
  Container,
  InputBase,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
  Stack,
  Link,
  Grid
} from "@mui/material";
import { 
  Search as SearchIcon, 
  LocationOn, 
  Bed, 
  Bathtub, 
  FilterList,
  DeleteOutline,
  Facebook,
  Instagram,
  WhatsApp,
  HomeWork // Icono para la bienvenida
} from "@mui/icons-material";

const primaryPurple = "#635BFF";
const secondaryBg = "#F8F9FC";

const Footer = () => (
  <Box component="footer" sx={{ bgcolor: "white", pt: 8, pb: 4, mt: 8, borderTop: "1px solid #E0E4EC" }}>
    <Container maxWidth="lg">
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={5}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: primaryPurple, mb: 2 }}>MiRentaAPP</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, lineHeight: 1.8 }}>
            Tu próximo hogar está a un clic de distancia. Seguridad, confianza y transparencia en cada contrato digital.
          </Typography>
        </Grid>
        
        <Grid item xs={6} md={2.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: "#1A1F36" }}>Servicios</Typography>
          <Stack spacing={1.5}>
            <Link href="#" color="text.secondary" underline="none" sx={{ '&:hover': { color: primaryPurple } }}>Alquiler</Link>
            <Link href="#" color="text.secondary" underline="none" sx={{ '&:hover': { color: primaryPurple } }}>Publicar inmueble</Link>
          </Stack>
        </Grid>

        <Grid item xs={6} md={2.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: "#1A1F36" }}>Legal</Typography>
          <Stack spacing={1.5}>
            <Link href="#" color="text.secondary" underline="none" sx={{ '&:hover': { color: primaryPurple } }}>Términos</Link>
            <Link href="#" color="text.secondary" underline="none" sx={{ '&:hover': { color: primaryPurple } }}>Privacidad</Link>
          </Stack>
        </Grid>

        <Grid item xs={12} md={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: "#1A1F36" }}>Síguenos</Typography>
          <Stack direction="row" spacing={1.5}>
            <IconButton component="a" href="https://facebook.com" target="_blank" sx={{ bgcolor: '#F0F2F5', color: '#1877F2' }}><Facebook fontSize="small" /></IconButton>
            <IconButton component="a" href="https://instagram.com" target="_blank" sx={{ bgcolor: '#FDF0F2', color: '#E4405F' }}><Instagram fontSize="small" /></IconButton>
            <IconButton component="a" href="https://wa.me/593000000000" target="_blank" sx={{ bgcolor: '#E8F9EE', color: '#25D366' }}><WhatsApp fontSize="small" /></IconButton>
          </Stack>
        </Grid>
      </Grid>
      <Box sx={{ textAlign: "center", pt: 4, borderTop: "1px solid #F1F3F7" }}>
        <Typography variant="caption" color="text.secondary">© 2026 MiRentaAPP Ecuador. Todos los derechos reservados.</Typography>
      </Box>
    </Container>
  </Box>
);

export default function PublicHome() {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [habs, setHabs] = useState("");
  const [banos, setBanos] = useState("");

  // --- ESTADO PARA LA PANTALLA DE BIENVENIDA ---
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/admin/propiedades")
      .then(res => setProperties(res.data))
      .catch(err => console.error(err));
  }, []);

  const enviarSolicitud = async (propiedadId) => {
    const nombre = prompt("Para contactar al propietario, ingresa tu nombre completo:");
    if (!nombre) return;
    try {
      await axios.post("http://localhost:5000/api/solicitudes", {
        propiedad_id: propiedadId,
        nombre_cliente: nombre
      });
      alert("✅ Solicitud enviada con éxito.");
    } catch (error) {
      alert("❌ Error al enviar solicitud.");
    }
  };

  const filtered = properties.filter(p => {
    const matchSearch = (p.ciudad || "").toLowerCase().includes(search.toLowerCase()) || 
                        (p.sector || "").toLowerCase().includes(search.toLowerCase());
    const matchPrice = priceTo === "" || Number(p.precio) <= Number(priceTo);
    const matchHabs = habs === "" || Number(p.habitaciones) >= Number(habs);
    const matchBanos = banos === "" || Number(p.banos) >= Number(banos);
    return matchSearch && matchPrice && matchHabs && matchBanos;
  });

  return (
    <Box sx={{ background: secondaryBg, minHeight: "100vh" }}>

      {/* --- SECCIÓN DE BIENVENIDA INICIAL (SPLASH SCREEN) --- */}
      {showWelcome && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: 'white',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          p: 3
        }}>
          <HomeWork sx={{ fontSize: 100, color: primaryPurple, mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 900, color: "#1A1F36", mb: 2 }}>
            ¡Bienvenido a MiRentaAPP!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 6, maxWidth: 600 }}>
            Descubre la forma más fácil y segura de alquilar tu próximo hogar en Ecuador. 
            Sin complicaciones, totalmente digital.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => setShowWelcome(false)}
            sx={{ 
              bgcolor: primaryPurple, 
              px: 8, 
              py: 2.5, 
              borderRadius: 4, 
              fontSize: '1.4rem', 
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0 12px 24px rgba(99, 91, 255, 0.4)',
              '&:hover': { bgcolor: '#5148D1' }
            }}
          >
            Empezar búsqueda
          </Button>
        </Box>
      )}

      {/* NAVBAR */}
      <AppBar position="sticky" sx={{ bgcolor: "white", color: "black", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: 1, gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: primaryPurple, mr: 4 }}>MiRentaAPP</Typography>
            <Paper sx={{ p: '2px 10px', display: 'flex', alignItems: 'center', flexGrow: 1, maxWidth: 600, bgcolor: '#F1F3F7', borderRadius: 3, boxShadow: 'none' }}>
              <SearchIcon sx={{ color: 'gray', mr: 1 }} />
              <InputBase fullWidth placeholder="¿En qué ciudad o sector buscas?" value={search} onChange={(e) => setSearch(e.target.value)} />
            </Paper>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 4, border: "1px solid #E0E4EC", boxShadow: "none" }}>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
            <Select displayEmpty value={priceTo} onChange={(e) => setPriceTo(e.target.value)} sx={{ height: 45, borderRadius: 2.5, minWidth: 160, bgcolor: '#F8F9FC' }}>
              <MenuItem value="">Precio Máximo</MenuItem>
              <MenuItem value="300">Hasta $300</MenuItem>
              <MenuItem value="500">Hasta $500</MenuItem>
              <MenuItem value="1000">Hasta $1000</MenuItem>
            </Select>

            <Select displayEmpty value={habs} onChange={(e) => setHabs(e.target.value)} sx={{ height: 45, borderRadius: 2.5, minWidth: 160, bgcolor: '#F8F9FC' }}>
              <MenuItem value="">Habitaciones</MenuItem>
              <MenuItem value="1">1+ Habitación</MenuItem>
              <MenuItem value="2">2+ Habitaciones</MenuItem>
            </Select>

            <Select displayEmpty value={banos} onChange={(e) => setBanos(e.target.value)} sx={{ height: 45, borderRadius: 2.5, minWidth: 140, bgcolor: '#F8F9FC' }}>
              <MenuItem value="">Baños</MenuItem>
              <MenuItem value="1">1+ Baño</MenuItem>
              <MenuItem value="2">2+ Baños</MenuItem>
            </Select>

            <Button variant="outlined" color="error" startIcon={<DeleteOutline />} onClick={() => {setPriceTo(""); setHabs(""); setBanos(""); setSearch("");}} sx={{ height: 45, borderRadius: 2.5, textTransform: 'none', fontWeight: 600, px: 3 }}>
              Limpiar filtros
            </Button>
          </Stack>
        </Paper>
      </Container>

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Departamentos disponibles</Typography>
          <Chip label={`${filtered.length} resultados`} sx={{ bgcolor: primaryPurple, color: 'white', fontWeight: 'bold' }} />
        </Box>

        <Stack spacing={3}>
          {filtered.map((p) => (
            <Card 
              key={p.id} 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' }, 
                borderRadius: 4, 
                border: "1px solid #E0E4EC", 
                boxShadow: "none",
                overflow: 'hidden'
              }}
            >
              <CardMedia 
                component="img" 
                sx={{ width: { md: 350 }, height: { xs: 220, md: 'auto' } }} 
                image={p.imagen_url || "https://via.placeholder.com/300"} 
              />
              <CardContent sx={{ p: 4, flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{p.sector || "Sector"}</Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary" mb={3}>
                    <LocationOn sx={{ fontSize: 18 }} />
                    <Typography variant="body1">{p.ciudad || "Ubicación"}</Typography>
                  </Stack>
                  
                  <Stack direction="row" spacing={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Bed sx={{ color: primaryPurple, fontSize: 24 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{p.habitaciones || 0} Hab.</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Bathtub sx={{ color: primaryPurple, fontSize: 24 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{p.banos || 0} Baños</Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" sx={{ color: primaryPurple, fontWeight: 800, mb: 0.5 }}>
                    ${p.precio || "0"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>Por mes</Typography>
                  
                  <Button 
                    variant="contained" 
                    onClick={() => enviarSolicitud(p.id)}
                    sx={{ 
                      bgcolor: primaryPurple, 
                      borderRadius: 2.5, 
                      px: 4, 
                      py: 1.2, 
                      textTransform: 'none', 
                      fontWeight: 'bold' 
                    }}
                  >
                    Contactar ahora
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}