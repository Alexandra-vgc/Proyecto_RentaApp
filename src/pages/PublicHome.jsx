import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Importación necesaria para la navegación
import {
  Box, Card, CardContent, CardMedia, Typography, Button, Select, 
  MenuItem, Chip, Container, InputBase, Paper, IconButton, 
  Stack, Link, Grid, Divider
} from "@mui/material";
import { 
  Search as SearchIcon, LocationOn, Bed, Bathtub, DeleteOutline,
  Facebook, Instagram, WhatsApp, VerifiedUser, Security, 
  Assignment, Email, Phone, HelpOutline
} from "@mui/icons-material";

// --- TU PALETA DE COLORES ---
const palette = {
  fondoPrincipal: "#E8DCCB",    
  fondoAlterno: "#F5EFE6",      
  titulos: "#4E5B3C",           
  textoSecundario: "#BFA58A",    
  botonPrincipal: "#C66A3D",     
  textoBoton: "#FFFFFF",        
  detallesDorado: "#C9A227"      
};

// --- COMPONENTE FOOTER MEJORADO Y FUNCIONAL ---
const Footer = () => (
  <Box component="footer" sx={{ bgcolor: "white", pt: 10, pb: 6, mt: 10, borderTop: `2px solid ${palette.detallesDorado}` }}>
    <Container maxWidth="lg">
      <Grid container spacing={5}>
        
        {/* Columna 1: Branding y Propósito */}
        <Grid item xs={12} md={4}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: palette.titulos, mb: 3, fontFamily: 'serif' }}>
            MiRentaAPP
          </Typography>
          <Typography variant="body1" sx={{ color: palette.textoSecundario, lineHeight: 1.8, fontSize: '1.1rem', maxWidth: 350 }}>
            La plataforma líder en Ecuador para la gestión digital de arriendos. Conectamos sueños con hogares de forma segura y transparente.
          </Typography>
        </Grid>

        {/* Columna 2: Enlaces Rápidos */}
        <Grid item xs={6} md={2}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: palette.titulos, fontSize: '1.2rem' }}>Navegación</Typography>
          <Stack spacing={2}>
            <Link href="#" underline="none" sx={{ color: palette.textoSecundario, fontSize: '1.05rem', '&:hover': { color: palette.botonPrincipal } }}>Departamentos</Link>
            <Link href="#" underline="none" sx={{ color: palette.textoSecundario, fontSize: '1.05rem', '&:hover': { color: palette.botonPrincipal } }}>Publicar Inmueble</Link>
            <Link href="#" underline="none" sx={{ color: palette.textoSecundario, fontSize: '1.05rem', '&:hover': { color: palette.botonPrincipal } }}>Sobre Nosotros</Link>
          </Stack>
        </Grid>

        {/* Columna 3: Contacto y Soporte */}
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
            <Stack direction="row" spacing={1.5} alignItems="center">
              <HelpOutline sx={{ color: palette.detallesDorado, fontSize: 24 }} />
              <Typography sx={{ color: palette.textoSecundario, fontSize: '1.05rem' }}>Centro de Ayuda</Typography>
            </Stack>
          </Stack>
        </Grid>

        {/* Columna 4: Redes Sociales FUNCIONALES */}
        <Grid item xs={12} md={3}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: palette.titulos, fontSize: '1.2rem' }}>Síguenos</Typography>
          <Stack direction="row" spacing={2.5}>
            <IconButton 
              component="a" 
              href="https://www.facebook.com" 
              target="_blank" 
              sx={{ bgcolor: palette.fondoAlterno, color: palette.titulos, '&:hover': { bgcolor: palette.titulos, color: 'white' } }}
            >
              <Facebook sx={{ fontSize: 30 }} />
            </IconButton>
            <IconButton 
              component="a" 
              href="https://www.instagram.com" 
              target="_blank" 
              sx={{ bgcolor: palette.fondoAlterno, color: palette.botonPrincipal, '&:hover': { bgcolor: palette.botonPrincipal, color: 'white' } }}
            >
              <Instagram sx={{ fontSize: 30 }} />
            </IconButton>
            <IconButton 
              component="a" 
              href="https://wa.me/593985475789" 
              target="_blank" 
              sx={{ bgcolor: palette.fondoAlterno, color: '#25D366', '&:hover': { bgcolor: '#25D366', color: 'white' } }}
            >
              <WhatsApp sx={{ fontSize: 30 }} />
            </IconButton>
          </Stack>
          <Typography variant="caption" sx={{ mt: 4, display: 'block', color: palette.textoSecundario, fontSize: '0.95rem', fontStyle: 'italic' }}>
            Proyecto Académico ISTS - Quito, Ecuador.
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 6, borderColor: palette.fondoAlterno }} />

      <Box sx={{ textAlign: "center" }}>
        <Typography variant="body2" sx={{ color: palette.textoSecundario, fontWeight: 700, fontSize: '1rem' }}>
          © 2026 MiRentaAPP. Desarrollado por Naty - Estudiante de Desarrollo de Software.
        </Typography>
      </Box>
    </Container>
  </Box>
);

export default function PublicHome() {
  const navigate = useNavigate(); // Hook inicializado para navegar
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [habs, setHabs] = useState("");
  const [banos, setBanos] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/admin/propiedades")
      .then(res => {
        console.log("Propiedades cargadas del backend:", res.data);
        setProperties(res.data);
        setError(null);
      })
      .catch(err => {
        console.error("Error al cargar propiedades:", err);
        setError("No hay conexión con el servidor. Intenta más tarde.");
      });
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
    const matchPrice = priceTo === "" || Number(p.precio_mensual) <= Number(priceTo);
    const matchHabs = habs === "" || Number(p.habitaciones) >= Number(habs);
    const matchBanos = banos === "" || Number(p.banos) >= Number(banos);
    return matchSearch && matchPrice && matchHabs && matchBanos;
  });

  return (
    <Box sx={{ background: palette.fondoPrincipal, minHeight: "100vh" }}>

      {/* 1. SECCIÓN HERO */}
      <Box sx={{ 
        position: 'relative',
        height: '450px', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        color: 'white',
        textAlign: 'center'
      }}>
        <Box sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(4px)', 
            zIndex: 1
        }} />
        <Box sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.3))',
            zIndex: 2
        }} />

        <Box sx={{ position: 'relative', zIndex: 3, px: 2 }}>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, fontFamily: 'serif', letterSpacing: '-1px' }}>
              MiRentaAPP
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 400, mb: 5 }}>Busca tu departamento ideal</Typography>
            
            <Paper elevation={10} sx={{ 
                p: '3px 6px', 
                display: 'flex', 
                alignItems: 'center', 
                width: '100%', 
                maxWidth: 550, 
                borderRadius: '50px', 
                bgcolor: 'rgba(255,255,255,0.98)' 
            }}>
              <SearchIcon sx={{ color: palette.titulos, ml: 2, fontSize: 20 }} />
              <InputBase 
                fullWidth 
                placeholder="¿En qué ciudad o sector buscas?" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                sx={{ ml: 2, fontSize: '0.95rem', color: palette.titulos }}
              />
              <Button variant="contained" sx={{ 
                  bgcolor: palette.botonPrincipal, 
                  borderRadius: '50px', 
                  ml: 1, px: 4, py: 1, 
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  textTransform: 'none'
              }}>
                Buscar
              </Button>
            </Paper>
        </Box>
      </Box>

      {/* 2. SECCIÓN DE FILTROS */}
      <Container maxWidth="md" sx={{ mt: 6, mb: 4 }}>
        <Paper elevation={4} sx={{ 
          p: 2, 
          borderRadius: '16px', 
          bgcolor: 'white', 
          border: `1px solid ${palette.textoSecundario}33` 
        }}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" sx={{ color: palette.titulos, fontWeight: 700, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                PRECIO MÁXIMO
              </Typography>
              <Select fullWidth displayEmpty size="small" value={priceTo} onChange={(e) => setPriceTo(e.target.value)} sx={{ borderRadius: '8px' }}>
                <MenuItem value="">Cualquier precio</MenuItem>
                <MenuItem value="300">Hasta $300</MenuItem>
                <MenuItem value="500">Hasta $500</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" sx={{ color: palette.titulos, fontWeight: 700, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                HABITACIONES
              </Typography>
              <Select fullWidth displayEmpty size="small" value={habs} onChange={(e) => setHabs(e.target.value)} sx={{ borderRadius: '8px' }}>
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="1">1+ Hab.</MenuItem>
                <MenuItem value="2">2+ Hab.</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" sx={{ color: palette.titulos, fontWeight: 700, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                BAÑOS
              </Typography>
              <Select fullWidth displayEmpty size="small" value={banos} onChange={(e) => setBanos(e.target.value)} sx={{ borderRadius: '8px' }}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="1">1+ Baño</MenuItem>
                <MenuItem value="2">2+ Baños</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button 
                fullWidth 
                variant="text" 
                color="error" 
                size="small"
                startIcon={<DeleteOutline />} 
                onClick={() => {setPriceTo(""); setHabs(""); setBanos(""); setSearch("");}} 
                sx={{ fontWeight: 700, textTransform: 'none', mb: 0.2 }}
              >
                Limpiar filtros
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* 3. LISTADO DE PROPIEDADES */}
      <Container maxWidth="lg">
        {error && (
          <Box sx={{ 
            bgcolor: '#ffebee', 
            border: '2px solid #ef5350', 
            borderRadius: 2, 
            p: 3, 
            mb: 4, 
            textAlign: 'center' 
          }}>
            <Typography variant="body1" sx={{ color: '#c62828', fontWeight: 'bold' }}>
              🔴 {error}
            </Typography>
          </Box>
        )}
        
        {properties.length === 0 && !error ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: palette.textoSecundario }}>
              Cargando propiedades...
            </Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="body1" sx={{ color: palette.textoSecundario }}>
              No se encontraron propiedades que coincidan con los filtros.
            </Typography>
          </Box>
        ) : (
        <Stack spacing={4}>
          {filtered.map((p) => (
            <Card key={p.id} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, borderRadius: 2, border: `1px solid ${palette.textoSecundario}33`, boxShadow: "none", overflow: 'hidden' }}>
              <Box sx={{ position: 'relative', width: { md: 400 } }}>
                <CardMedia component="img" sx={{ height: '100%', minHeight: 250 }} image={p.imagen_url || "https://via.placeholder.com/400?text=Sin+imagen"} />
                <Chip label="Verificado" size="small" icon={<VerifiedUser sx={{ fontSize: '14px !important', color: 'white !important' }}/>} sx={{ position: 'absolute', top: 15, left: 15, bgcolor: palette.titulos, color: 'white', borderRadius: 1 }} />
              </Box>
              <CardContent sx={{ p: 4, flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: palette.titulos, fontFamily: 'serif' }}>{p.sector || p.codigo || "Departamento"}</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center" color={palette.textoSecundario}>
                      <LocationOn fontSize="small" />
                      <Typography variant="body2">{p.ciudad || "Quito"}, Ecuador</Typography>
                    </Stack>
                  </Box>
                  <Typography variant="h4" sx={{ color: palette.botonPrincipal, fontWeight: 900 }}>${p.precio_mensual || "N/A"}</Typography>
                </Box>
                <Stack direction="row" spacing={3} sx={{ mb: 4, p: 2, bgcolor: palette.fondoAlterno }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Bed sx={{ color: palette.detallesDorado }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: palette.titulos }}>{p.habitaciones || "?"} Hab.</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Bathtub sx={{ color: palette.detallesDorado }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: palette.titulos }}>{p.banos || "?"} Baños</Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                   {/* BOTÓN DETALLES FUNCIONAL */}
                   <Button 
                    variant="outlined" 
                    sx={{ borderRadius: 1, borderColor: palette.titulos, color: palette.titulos, px: 4, fontWeight: 700, textTransform: 'none' }}
                    onClick={() => navigate(`/propiedad/${p.id}`)}>
                     Detalles
                   </Button>
                   <Button variant="contained" onClick={() => enviarSolicitud(p.id)} sx={{ bgcolor: palette.botonPrincipal, borderRadius: 1, px: 4, fontWeight: 700, textTransform: 'none' }}>Contactar ahora</Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
        )}
      </Container>

      <Footer />
    </Box>
  );
}