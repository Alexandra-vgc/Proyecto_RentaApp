import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Box, Typography, Card, CardMedia, CardContent, 
  IconButton, Stack, CircularProgress 
} from "@mui/material";
import { 
  Bed, Bathtub, LocationOn, ArrowBack, FavoriteBorder, HomeWork, Straighten 
} from "@mui/icons-material";

const palette = {
  fondoPrincipal: "#E8DCCB",
  titulos: "#4E5B3C",
  botonPrincipal: "#C66A3D",
  textoSecundario: "#BFA58A"
};

export default function SectorResults() {
  const { nombreSector } = useParams(); 
  const navigate = useNavigate();
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoverId, setHoverId] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:5000/api/admin/propiedades`)
      .then(res => {
        const term = nombreSector.toLowerCase();
        
        // FILTRADO USANDO TUS COLUMNAS REALES: .sector y .ciudad
        const filtradas = res.data.filter(p => {
          const sectorP = (p.sector || "").toLowerCase();
          const ciudadP = (p.ciudad || "").toLowerCase();

          // Lógica para agrupar por las zonas que pusiste en el Home
          if (term.includes("norte")) return sectorP.includes("carolina") || sectorP.includes("norte") || sectorP.includes("iñaquito");
          if (term.includes("sur")) return sectorP.includes("recreo") || sectorP.includes("sur") || sectorP.includes("quitumbe");
          if (term.includes("centro")) return sectorP.includes("centro") || sectorP.includes("histórico");
          
          return sectorP.includes(term) || ciudadP.includes(term);
        });

        setPropiedades(filtradas);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [nombreSector]);

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: "#F5EFE6", overflow: 'hidden' }}>
      
      {/* COLUMNA IZQUIERDA */}
      <Box sx={{ width: { xs: '100%', md: '50%' }, overflowY: 'auto', p: 4, borderRight: '1px solid #ddd' }}>
        <IconButton onClick={() => navigate('/')} sx={{ mb: 2, color: palette.titulos }}>
          <ArrowBack /> <Typography sx={{ ml: 1, fontWeight: 900 }}>VOLVER AL INICIO</Typography>
        </IconButton>

        <Typography variant="h3" sx={{ fontWeight: 900, color: palette.titulos, mb: 1, fontFamily: 'serif' }}>
          {nombreSector}
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress sx={{ color: palette.botonPrincipal }} /></Box>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 4, color: 'gray' }}>
              {propiedades.length} departamentos encontrados.
            </Typography>

            <Stack spacing={3}>
              {propiedades.length > 0 ? (
                propiedades.map((p) => (
                  <Card 
                    key={p.id}
                    onMouseEnter={() => setHoverId(p.id)}
                    onMouseLeave={() => setHoverId(null)}
                    sx={{ 
                      display: 'flex', borderRadius: 4, cursor: 'pointer',
                      border: '1px solid #e0e0e0', transition: 'all 0.3s ease',
                      transform: hoverId === p.id ? 'translateY(-5px)' : 'none',
                      boxShadow: hoverId === p.id ? '0 12px 30px rgba(0,0,0,0.1)' : 'none',
                    }}
                    onClick={() => navigate(`/propiedad/${p.id}`)}
                  >
                    <CardMedia
                      component="img"
                      sx={{ width: 220, height: 180 }}
                      image={p.imagen_url || "https://via.placeholder.com/400"}
                    />
                    <CardContent sx={{ flex: 1, p: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: palette.botonPrincipal, mb: 1 }}>
                        ${Number(p.precio_mensual).toFixed(0)}/mes
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#333' }}>
                        {p.sector} {/* Muestra tu columna 'sector' */}
                      </Typography>
                      
                      <Stack direction="row" spacing={2} sx={{ my: 1.5, color: '#666' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Bed fontSize="small" /> <Typography variant="caption" sx={{ fontWeight: 700 }}>{p.habitaciones}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Bathtub fontSize="small" /> <Typography variant="caption" sx={{ fontWeight: 700 }}>{p.banos}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Straighten fontSize="small" /> <Typography variant="caption" sx={{ fontWeight: 700 }}>{p.metros_cuadrados}m²</Typography>
                        </Box>
                      </Stack>

                      <Typography variant="caption" sx={{ color: 'gray', display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ fontSize: 14, mr: 0.5 }} /> {p.ciudad}, Ecuador
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="h6" color="textSecondary" sx={{ textAlign: 'center', mt: 10 }}>
                  No hay departamentos en este sector todavía.
                </Typography>
              )}
            </Stack>
          </>
        )}
      </Box>

      {/* MAPA PLACEHOLDER */}
      <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' }, bgcolor: '#e5e3df' }}>
        <Box 
          sx={{ 
            width: '100%', height: '100%', 
            backgroundImage: 'url(https://user-images.githubusercontent.com/1781251/111036815-b7447200-8431-11eb-9807-6c072c41c7a4.png)',
            backgroundSize: 'cover', opacity: 0.8
          }}
        />
      </Box>
    </Box>
  );
}