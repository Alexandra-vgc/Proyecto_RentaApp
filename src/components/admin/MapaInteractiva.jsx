import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corregir iconos que no cargan en React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const MapaInteractiva = ({ lat, lng, onLocationSelect, soloLectura = false }) => {
  const centroEcuador = [-0.1807, -78.4678]; // Quito por defecto

  const latNum = Number(lat);
  const lngNum = Number(lng);
  const hasCoords = lat !== null && lat !== undefined && lat !== "" && lng !== null && lng !== undefined && lng !== "" && !Number.isNaN(latNum) && !Number.isNaN(lngNum);

  // Función para capturar el clic
  function LocationMarker() {
    useMapEvents({
      click(e) {
        if (!soloLectura && onLocationSelect) {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
      },
    });
    return hasCoords ? <Marker position={[latNum, lngNum]} /> : null;
  }

  return (
    <div style={{ height: '350px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid #C66A3D' }}>
      <MapContainer 
        center={hasCoords ? [latNum, lngNum] : centroEcuador} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
};

export default MapaInteractiva;