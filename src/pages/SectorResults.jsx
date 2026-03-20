import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Box, Typography, Card, CardMedia, CardContent, 
  IconButton, Stack, CircularProgress 
} from "@mui/material";
import { 
  Bed, Bathtub, LocationOn, ArrowBack, Straighten 
} from "@mui/icons-material";

// IMPORTACIONES DE LEAFLET
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ARREGLO DE ÍCONOS DE LEAFLET
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ 
  iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] 
});
L.Marker.prototype.options.icon = DefaultIcon;

const palette = {
  fondoPrincipal: "#E8DCCB",
  titulos: "#4E5B3C",
  botonPrincipal: "#C66A3D",
  textoSecundario: "#BFA58A"
};

// COMPONENTE QUE CENTRA EL MAPA AUTOMÁTICAMENTE
function MapUpdater({ propiedades }) {
  const map = useMap();
  useEffect(() => {
    if (propiedades.length > 0) {
      const bounds = L.latLngBounds(
        propiedades
          .filter(p => (p.latitud || p.lat) && (p.longitud || p.lng))
          .map(p => [Number(p.latitud || p.lat), Number(p.longitud || p.lng)])
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [propiedades, map]);
  return null;
}

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
        const normalizar = (texto) => (texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const term = normalizar(nombreSector);
        
        // ✅ EL NUEVO CEREBRO GEOGRÁFICO
        const filtradas = res.data.filter(p => {
          const lat = Number(p.latitud || p.lat);
          const lng = Number(p.longitud || p.lng);
          const tieneCoordenadas = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
          
          const textoCompleto = normalizar(`${p.sector} ${p.direccion} ${p.ciudad}`);
          let esDeLaZona = false;

          if (term.includes("norte")) {
            // LÓGICA QUITO NORTE: Latitud mayor a -0.215 y no es de los valles
            if (tieneCoordenadas) {
              esDeLaZona = lat > -0.215 && lng < -78.42;
            }
            if (!esDeLaZona) esDeLaZona = textoCompleto.includes("norte") || textoCompleto.includes("carolina") || textoCompleto.includes("inaquito");
          
          } else if (term.includes("sur")) {
            // LÓGICA QUITO SUR: Latitud menor a -0.250
            if (tieneCoordenadas) {
              esDeLaZona = lat <= -0.250 && lng < -78.42;
            }
            if (!esDeLaZona) esDeLaZona = textoCompleto.includes("sur") || textoCompleto.includes("recreo") || textoCompleto.includes("quitumbe");
          
          } else if (term.includes("centro")) {
            // LÓGICA QUITO CENTRO: Entre -0.215 y -0.250
            if (tieneCoordenadas) {
              esDeLaZona = lat <= -0.215 && lat > -0.250 && lng < -78.42;
            }
            if (!esDeLaZona) esDeLaZona = textoCompleto.includes("centro") || textoCompleto.includes("historico") || textoCompleto.includes("mariscal");
          
          } else if (term.includes("valle") || term.includes("cumbaya")) {
            // LÓGICA VALLES: Longitud mayor a -78.42 (Hacia el este)
            if (tieneCoordenadas) {
              esDeLaZona = lng >= -78.42;
            }
            if (!esDeLaZona) esDeLaZona = textoCompleto.includes("valle") || textoCompleto.includes("cumbaya") || textoCompleto.includes("tumbaco");
          
          } else {
            // Búsqueda genérica por si buscan otra cosa
            esDeLaZona = textoCompleto.includes(term);
          }

          return esDeLaZona;
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
      <Box sx={{ width: { xs: '100%', md: '50%', lg: '45%' }, overflowY: 'auto', p: 4, borderRight: '1px solid #ddd', bgcolor: 'white', zIndex: 10, boxShadow: '5px 0 15px rgba(0,0,0,0.05)' }}>
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
            <Typography variant="body1" sx={{ mb: 4, color: 'gray', fontWeight: 'bold' }}>
              {propiedades.length} propiedades encontradas en este sector por mapa.
            </Typography>

            <Stack spacing={3} sx={{ pb: 5 }}>
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
                      boxShadow: hoverId === p.id ? '0 12px 30px rgba(198,106,61,0.15)' : 'none',
                      borderColor: hoverId === p.id ? palette.botonPrincipal : '#e0e0e0'
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
                        {p.sector}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'gray', display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ fontSize: 14, mr: 0.5 }} /> {p.direccion || 'Sector no especificado'}, {p.ciudad}
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

                    </CardContent>
                  </Card>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', mt: 10, p: 4, bgcolor: '#f9f9f9', borderRadius: 4, border: '1px dashed #ccc' }}>
                  <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                    No hay departamentos en este sector todavía.
                  </Typography>
                </Box>
              )}
            </Stack>
          </>
        )}
      </Box>

      {/* COLUMNA DERECHA (EL MAPA MÁGICO) */}
      <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' }, position: 'relative', zIndex: 0 }}>
        <MapContainer 
          center={[-0.1807, -78.4678]} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {!loading && propiedades.length > 0 && <MapUpdater propiedades={propiedades} />}

          {!loading && propiedades.map(p => {
            const lat = Number(p.latitud || p.lat);
            const lng = Number(p.longitud || p.lng);

            if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

            return (
              <Marker key={p.id} position={[lat, lng]}>
                <Popup>
                  <Box 
                    sx={{ cursor: 'pointer', textAlign: 'center', minWidth: '150px' }} 
                    onClick={() => navigate(`/propiedad/${p.id}`)}
                  >
                    <img 
                      src={p.imagen_url || "https://via.placeholder.com/400"} 
                      alt="propiedad" 
                      style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} 
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: palette.botonPrincipal, m: 0 }}>
                      ${Number(p.precio_mensual).toFixed(0)}/mes
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#555', display: 'block', lineHeight: 1.2 }}>
                      {p.sector}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'gray', display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 0.5 }}>
                      <LocationOn sx={{ fontSize: 12 }} /> Ver detalles
                    </Typography>
                  </Box>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </Box>
    </Box>
  );
}