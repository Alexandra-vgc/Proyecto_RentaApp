import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import jsPDF from "jspdf";
import authService from "../services/authService"; // ✅ MANTENIDO PARA SABER SI ESTÁ LOGUEADO

import {
  Box, Card, CardContent, CardMedia, Typography, Button, Chip, Container, 
  InputBase, Paper, IconButton, Stack, Link, Grid, Divider, CardActionArea
} from "@mui/material";
import { 
  Search as SearchIcon, LocationOn, Bed, Bathtub, Facebook, Instagram, 
  WhatsApp, VerifiedUser, Email, Phone, HelpOutline, PictureAsPdf, Favorite, 
  FavoriteBorder, HomeWork, CompareArrows, SentimentDissatisfied, Straighten
} from "@mui/icons-material";

// ✅ TU PALETA DE COLORES ORIGINAL RESTAURADA AL 100%
const palette = {
  fondoPrincipal: "#E8DCCB",    
  fondoAlterno: "#F5EFE6",      
  titulos: "#4E5B3C",           
  textoSecundario: "#BFA58A",    
  botonPrincipal: "#C66A3D",     
  textoBoton: "#FFFFFF",        
  detallesDorado: "#C9A227"      
};

// --- ✅ SECCIÓN: PROPIEDADES SUGERIDAS ---
const PropiedadesSugeridas = ({ propiedades, onVerDetalle, toggleFavorito, favoritos }) => {
  const sugeridas = propiedades.slice(0, 5);
  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, color: "#333", fontFamily: 'sans-serif' }}>
        Propiedades e Inmuebles en Alquiler que pueden interesarle
      </Typography>
      <Grid container spacing={2}>
        {sugeridas.map((p) => (
          <Grid item xs={12} sm={6} md={2.4} key={p.id}>
            <Card elevation={0} sx={{ bgcolor: 'transparent' }}>
              <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', height: 160 }}>
                <CardMedia 
                  component="img" 
                  height="160" 
                  image={p.imagen_url || "https://via.placeholder.com/400"} 
                  sx={{ cursor: 'pointer', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}
                  onClick={() => onVerDetalle(p.id)}
                />
                <IconButton 
                  onClick={(e) => { e.stopPropagation(); toggleFavorito(p.id); }}
                  sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.4)', color: 'white', padding: '6px' }}
                >
                  {favoritos.includes(p.id) ? <Favorite sx={{ fontSize: 18, color: '#ff1744' }} /> : <FavoriteBorder sx={{ fontSize: 18 }} />}
                </IconButton>
              </Box>
              <CardContent sx={{ px: 0, pt: 1.5 }}>
                <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 900 }}>${p.precio_mensual}/mes</Typography>
                <Stack direction="row" spacing={1} sx={{ color: '#666', my: 0.5 }}>
                  <Bed sx={{ fontSize: 16 }} /> <Typography variant="caption">{p.habitaciones}</Typography>
                  <Bathtub sx={{ fontSize: 16 }} /> <Typography variant="caption">{p.banos}</Typography>
                  <HomeWork sx={{ fontSize: 16 }} />
                </Stack>
                <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{p.sector}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

// --- ✅ SECCIÓN: PROPIEDADES MÁS POPULARES ---
const PropiedadesPopulares = ({ propiedades, onVerDetalle, toggleFavorito, favoritos }) => {
  const populares = propiedades.slice(5, 10); 
  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: "#333", fontFamily: 'sans-serif' }}>
        Las Propiedades e Inmuebles en alquiler más populares de MiRentaAPP en Ecuador
      </Typography>
      <Grid container spacing={2}>
        {populares.map((p) => (
          <Grid item xs={12} sm={6} md={2.4} key={p.id}>
            <Card elevation={0} sx={{ bgcolor: 'transparent' }}>
              <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', height: 160 }}>
                <CardMedia 
                  component="img" 
                  height="160" 
                  image={p.imagen_url || "https://via.placeholder.com/400"} 
                  sx={{ cursor: 'pointer', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}
                  onClick={() => onVerDetalle(p.id)}
                />
                <IconButton 
                  onClick={(e) => { e.stopPropagation(); toggleFavorito(p.id); }}
                  sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.4)', color: 'white', padding: '6px' }}
                >
                  {favoritos.includes(p.id) ? <Favorite sx={{ fontSize: 18, color: '#ff1744' }} /> : <FavoriteBorder sx={{ fontSize: 18 }} />}
                </IconButton>
              </Box>
              <CardContent sx={{ px: 0, pt: 1.5 }}>
                <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 900 }}>${p.precio_mensual}/mes</Typography>
                <Stack direction="row" spacing={1} sx={{ color: '#666', my: 0.5 }}>
                  <Bed sx={{ fontSize: 16 }} /> <Typography variant="caption">{p.habitaciones}</Typography>
                  <Bathtub sx={{ fontSize: 16 }} /> <Typography variant="caption">{p.banos}</Typography>
                  <HomeWork sx={{ fontSize: 16 }} />
                </Stack>
                <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{p.sector}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

// --- COMPONENTE DE REGIONES ---
const RegionesSeccion = ({ onRegionClick }) => {
  const sectoresQuito = [
    { 
      nombre: "Quito Norte", 
      img: "https://images.unsplash.com/photo-1661272363053-c8a80e23b984?q=80&w=865&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      desc: "La Carolina, Iñaquito y más" 
    },
    { 
      nombre: "Quito Centro", 
      img: "https://images.unsplash.com/photo-1634687914388-16ad16610f02?q=80&w=844&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      desc: "Casco Colonial y cercanías" 
    },
    { 
      nombre: "Quito Sur", 
      img: "https://images.unsplash.com/photo-1658874286042-63715473d181?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      desc: "Solanda, Quitumbe y más" 
    },
    { 
      nombre: "Cumbayá y Valles", 
      img: "https://plus.unsplash.com/premium_photo-1754251253993-a29cdc0b6c21?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      desc: "Tumbaco y Valle de los Chillos" 
    },
    { 
      nombre: "Pomasqui y Calderón", 
      img: "https://images.unsplash.com/photo-1648742864599-6c940f37c241?q=80&w=388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      desc: "Sector Mitad del Mundo" 
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 5 }}>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: palette.titulos, fontFamily: 'serif' }}>
        Sectores Populares en Quito
      </Typography>
      <Typography variant="body1" sx={{ color: palette.textoSecundario, mb: 4, fontSize: '1.1rem' }}>
        Encuentra departamentos en los mejores sectores de la capital y la provincia de Pichincha.
      </Typography>
      
      <Stack 
        direction="row" 
        spacing={3} 
        sx={{ 
          overflowX: 'auto', 
          pb: 3, 
          '&::-webkit-scrollbar': { height: '8px' }, 
          '&::-webkit-scrollbar-thumb': { bgcolor: palette.textoSecundario, borderRadius: '4px' } 
        }}
      >
        {sectoresQuito.map((sector, index) => (
          <Card 
            key={index} 
            sx={{ 
              minWidth: 260, 
              maxWidth: 260, 
              borderRadius: 4, 
              position: 'relative', 
              overflow: 'hidden', 
              aspectRatio: '3/4', 
              bgcolor: palette.titulos,
              transition: 'transform 0.3s', 
              '&:hover': { transform: 'scale(1.03)' }, 
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)' 
            }}
          >
            <CardActionArea onClick={() => onRegionClick(sector.nombre)} sx={{ height: '100%' }}>
              <CardMedia 
                component="img" 
                image={sector.img} 
                alt={sector.nombre} 
                sx={{ 
                  height: '100%', 
                  width: '100%', 
                  objectFit: 'cover',
                  filter: 'brightness(0.75)'
                }} 
              />
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  p: 3, 
                  color: 'white', 
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' 
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {sector.nombre}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontStyle: 'italic' }}>
                  {sector.desc}
                </Typography>
              </Box>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </Container>
  );
};
// --- ✅ TU FOOTER ORIGINAL RESTAURADO Y FUNCIONAL ---
const Footer = () => (
  <Box component="footer" sx={{ bgcolor: "white", pt: 10, pb: 6, mt: 10, borderTop: `2px solid ${palette.detallesDorado}` }}>
    <Container maxWidth="lg">
      <Grid container spacing={5}>
        <Grid item xs={12} md={4}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: palette.titulos, mb: 3, fontFamily: 'serif' }}>MiRentaAPP</Typography>
          <Typography variant="body1" sx={{ color: palette.textoSecundario, lineHeight: 1.8, fontSize: '1.1rem', maxWidth: 350 }}>
            La plataforma líder en Ecuador para la gestión digital de arriendos. Conectamos sueños con hogares de forma segura y transparente.
          </Typography>
        </Grid>
        <Grid item xs={6} md={2}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: palette.titulos, fontSize: '1.2rem' }}>Navegación</Typography>
          <Stack spacing={2}>
            <Link href="#" underline="none" sx={{ color: palette.textoSecundario, fontSize: '1.05rem', '&:hover': { color: palette.botonPrincipal } }}>Departamentos</Link>
            <Link href="#" underline="none" sx={{ color: palette.textoSecundario, fontSize: '1.05rem', '&:hover': { color: palette.botonPrincipal } }}>Publicar Inmueble</Link>
            <Link href="#" underline="none" sx={{ color: palette.textoSecundario, fontSize: '1.05rem', '&:hover': { color: palette.botonPrincipal } }}>Sobre Nosotros</Link>
          </Stack>
        </Grid>
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
          </Stack>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: palette.titulos, fontSize: '1.2rem' }}>Síguenos</Typography>
          <Stack direction="row" spacing={2.5}>
            <IconButton component="a" href="https://www.facebook.com" target="_blank" sx={{ bgcolor: palette.fondoAlterno, color: palette.titulos, '&:hover': { bgcolor: palette.titulos, color: 'white' } }}>
              <Facebook sx={{ fontSize: 30 }} />
            </IconButton>
            <IconButton component="a" href="https://www.instagram.com" target="_blank" sx={{ bgcolor: palette.fondoAlterno, color: palette.botonPrincipal, '&:hover': { bgcolor: palette.botonPrincipal, color: 'white' } }}>
              <Instagram sx={{ fontSize: 30 }} />
            </IconButton>
            <IconButton component="a" href="https://wa.me/593985475789" target="_blank" sx={{ bgcolor: palette.fondoAlterno, color: '#25D366', '&:hover': { bgcolor: '#25D366', color: 'white' } }}>
              <WhatsApp sx={{ fontSize: 30 }} />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
      <Divider sx={{ my: 6, borderColor: palette.fondoAlterno }} />
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="body2" sx={{ color: palette.textoSecundario, fontWeight: 700, fontSize: '1rem' }}>
          © 2026 MiRentaAPP. Desarrollado por Nathasha Machado y Vanessa Guaranda - Estudiantes de Software
        </Typography>
      </Box>
    </Container>
  </Box>
);

export default function PublicHome() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState("");
  const [tipoOperacion, setTipoOperacion] = useState("Alquiler");
  const [favoritos, setFavoritos] = useState([]);

  const currentUser = authService.getCurrentUser();
  const isLogged = authService.isAuthenticated() && currentUser;

  useEffect(() => {
    axios.get("http://localhost:5000/api/admin/propiedades")
      .then(res => { setProperties(res.data); })
      .catch(() => { console.error("Error al cargar propiedades"); });

    if (isLogged) {
      axios.get(`http://localhost:5000/api/favoritos/${currentUser.id}`)
        .then(res => { setFavoritos(res.data.map(fav => fav.id)); })
        .catch(err => console.error("Error al cargar favoritos", err));
    }
  }, [isLogged, currentUser]);

  const toggleFavorito = async (prop_id) => {
    if (!isLogged) { navigate('/login'); return; }
    try {
      const res = await axios.post("http://localhost:5000/api/favoritos", { usuario_id: currentUser.id, propiedad_id: prop_id });
      if (res.data.guardado) setFavoritos([...favoritos, prop_id]);
      else setFavoritos(favoritos.filter(id => id !== prop_id));
    } catch (error) { console.error("Error en favorito"); }
  };

  const filtered = properties.filter(p => {
    const matchSearch = (p.ciudad || "").toLowerCase().includes(search.toLowerCase()) || 
                        (p.sector || "").toLowerCase().includes(search.toLowerCase());
    const matchOperacion = p.tipo_operacion === tipoOperacion; 
    return matchSearch && matchOperacion;
  });

  return (
    <Box sx={{ background: palette.fondoPrincipal, minHeight: "100vh" }}>
      
      {/* 1. SECCIÓN HERO */}
      <Box sx={{ position: 'relative', height: '550px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', color: 'white', textAlign: 'center' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200)', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 1 }} />
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(78,91,60,0.5))`, zIndex: 2 }} />
        <Box sx={{ position: 'relative', zIndex: 3, px: 2, width: '100%', maxWidth: '900px' }}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, fontFamily: 'serif', letterSpacing: '1px' }}>Las mejores propiedades en alquiler de Ecuador</Typography>
            <Stack direction="row" justifyContent="center" spacing={0} sx={{ mb: -0.5, mt: 4 }}>
                <Button onClick={() => setTipoOperacion("Venta")} sx={{ bgcolor: tipoOperacion === "Venta" ? 'white' : 'rgba(0,0,0,0.5)', color: tipoOperacion === "Venta" ? palette.titulos : 'white', px: 4, borderRadius: '8px 8px 0 0', fontWeight: 'bold' }}>Comprar</Button>
                <Button onClick={() => setTipoOperacion("Alquiler")} sx={{ bgcolor: tipoOperacion === "Alquiler" ? 'white' : 'rgba(0,0,0,0.5)', color: tipoOperacion === "Alquiler" ? palette.titulos : 'white', px: 4, borderRadius: '8px 8px 0 0', fontWeight: 'bold' }}>Alquiler</Button>
            </Stack>
            <Paper elevation={15} sx={{ p: '5px', display: 'flex', alignItems: 'center', borderRadius: '0 8px 8px 8px', bgcolor: 'rgba(255,255,255,0.95)' }}>
              <InputBase fullWidth placeholder="¿Búsqueda por ubicación o proyecto?" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ ml: 3, fontSize: '1.1rem' }} />
              <IconButton sx={{ p: '15px', bgcolor: palette.botonPrincipal, color: 'white' }}><SearchIcon /></IconButton>
            </Paper>
        </Box>
      </Box>

      {/* 2. SUGERIDAS (Independiente de búsqueda para que no se vea vacía) */}
      <PropiedadesSugeridas propiedades={properties} onVerDetalle={(id) => navigate(`/propiedad/${id}`)} toggleFavorito={toggleFavorito} favoritos={favoritos} />

      {/* 3. REGIONES */}
      <RegionesSeccion onRegionClick={(nombre) => navigate(`/sector/${nombre}`)} />

      {/* 4. POPULARES */}
      <PropiedadesPopulares propiedades={properties} onVerDetalle={(id) => navigate(`/propiedad/${id}`)} toggleFavorito={toggleFavorito} favoritos={favoritos} />

      
      <Footer />
    </Box>
  );
}