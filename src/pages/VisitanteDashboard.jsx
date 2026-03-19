import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';
import {
  Box, Typography, Button, Grid, Card, CardMedia, CardContent,
  IconButton, Stack, Container, Chip, Paper
} from '@mui/material';
import { Favorite, LocationOn, ArrowBack, VerifiedUser, Bed, Bathtub } from '@mui/icons-material';

const palette = {
  fondoPrincipal: "#E8DCCB", 
  fondoAlterno: "#F5EFE6",
  titulos: "#4E5B3C", 
  botonPrincipal: "#C66A3D", 
  textoSecundario: "#BFA58A"
};

export default function VisitanteDashboard() {
  const navigate = useNavigate();
  const [favoritos, setFavoritos] = useState([]);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (currentUser) cargarFavoritos();
  }, [currentUser]);

  const cargarFavoritos = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/favoritos/${currentUser.id}`);
      setFavoritos(res.data);
    } catch (error) {
      console.error('Error al cargar favoritos');
    }
  };

  const quitarFavorito = async (propiedad_id) => {
    try {
      await axios.post("http://localhost:5000/api/favoritos", {
        usuario_id: currentUser.id,
        propiedad_id: propiedad_id
      });
      cargarFavoritos(); 
    } catch (error) {
      console.error("Error al quitar favorito");
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <Box sx={{ background: palette.fondoPrincipal, minHeight: '100vh', pb: 10 }}>
      
      {/* 🌟 BARRA SUPERIOR ELEGANTE */}
      <Box sx={{ bgcolor: 'white', p: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ddd", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: palette.titulos, fontFamily: 'serif', cursor: 'pointer' }} onClick={() => navigate('/')}>
          MiRentaAPP
        </Typography>
        <Button onClick={handleLogout} sx={{ color: palette.botonPrincipal, fontWeight: 'bold' }}>
          Cerrar Sesión
        </Button>
      </Box>

      {/* 🌟 HERO BANNER PREMIUM */}
      <Box sx={{ bgcolor: palette.fondoAlterno, borderBottom: `2px solid ${palette.textoSecundario}55`, py: 6, mb: 5 }}>
        <Container maxWidth="lg">
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} sx={{ color: palette.titulos, mb: 3, fontWeight: 'bold' }}>
            Volver al Catálogo
          </Button>
          <Typography variant="h3" sx={{ fontWeight: 900, color: palette.titulos, mb: 1, fontFamily: 'serif' }}>
            Tu Colección de Favoritos ❤️
          </Typography>
          <Typography variant="h6" sx={{ color: '#666', fontWeight: 'normal' }}>
            Hola <strong style={{color: palette.botonPrincipal}}>{currentUser?.nombre}</strong>, aquí guardamos las propiedades que más te gustaron.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {favoritos.length === 0 ? (
          <Paper elevation={0} sx={{ textAlign: 'center', p: 10, bgcolor: 'white', borderRadius: 4, border: '2px dashed #ccc' }}>
            <Favorite sx={{ fontSize: 80, color: '#ffebee', mb: 2 }} />
            <Typography variant="h5" sx={{ color: palette.titulos, fontWeight: 'bold', mb: 1 }}>Aún no has guardado propiedades</Typography>
            <Typography variant="body1" sx={{ color: '#888', mb: 4 }}>Explora nuestro catálogo y dale clic al corazón de las que más te gusten.</Typography>
            <Button variant="contained" size="large" onClick={() => navigate('/')} sx={{ bgcolor: palette.botonPrincipal, borderRadius: 2, fontWeight: 'bold', px: 5 }}>
              Explorar Catálogo
            </Button>
          </Paper>
        ) : (
          <Stack spacing={4}>
            {/* 🌟 TARJETAS IDÉNTICAS AL CATÁLOGO PÚBLICO */}
            {favoritos.map((p) => (
              <Card key={p.id} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, borderRadius: 3, border: `1px solid ${palette.textoSecundario}33`, boxShadow: "0 4px 15px rgba(0,0,0,0.05)", overflow: 'hidden' }}>
                <Box sx={{ position: 'relative', width: { md: 350 } }}>
                  <CardMedia component="img" sx={{ height: '100%', minHeight: 250 }} image={p.imagen_url || "https://via.placeholder.com/400"} />
                  <Chip label="Verificado" size="small" icon={<VerifiedUser sx={{ fontSize: '14px !important', color: 'white !important' }}/>} sx={{ position: 'absolute', top: 15, left: 15, bgcolor: palette.titulos, color: 'white', borderRadius: 1 }} />
                  
                  {/* BOTÓN QUITAR FAVORITO */}
                  <IconButton 
                    onClick={() => quitarFavorito(p.id)}
                    sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' }, transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                  >
                    <Favorite sx={{ color: '#d32f2f' }} />
                  </IconButton>
                </Box>

                <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: palette.titulos, fontFamily: 'serif' }}>{p.sector || "Departamento"}</Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center" color={palette.textoSecundario}>
                        <LocationOn fontSize="small" />
                        <Typography variant="body2">{p.ciudad}, Ecuador</Typography>
                      </Stack>
                    </Box>
                    <Typography variant="h4" sx={{ color: palette.botonPrincipal, fontWeight: 900 }}>${p.precio_mensual}</Typography>
                  </Box>

                  <Stack direction="row" spacing={3} sx={{ my: 3, p: 2, bgcolor: palette.fondoAlterno, borderRadius: 2, width: 'fit-content' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Bed sx={{ color: palette.detallesDorado }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: palette.titulos }}>{p.habitaciones || "?"} Hab.</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Bathtub sx={{ color: palette.detallesDorado }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: palette.titulos }}>{p.banos || "?"} Baños</Typography>
                    </Stack>
                  </Stack>

                  <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" sx={{ bgcolor: palette.titulos, borderRadius: 2, px: 5, py: 1.5, fontWeight: 700, textTransform: 'none', fontSize: '1rem' }} onClick={() => navigate(`/propiedad/${p.id}`)}>
                      Ver Detalles y Agendar Visita
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}