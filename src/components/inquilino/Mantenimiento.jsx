import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../../services/authService';

// Importamos la tabla de Material UI para que se vea igual al Administrador
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, CircularProgress
} from "@mui/material";
import { Build, Add, Close, InsertPhoto, CheckCircleOutline } from "@mui/icons-material";

const palette = {
  titulos: "#4E5B3C",
  fondoAlterno: "#F5EFE6",
  botonPrincipal: "#C66A3D"
};

// Fuente global para que la lectura sea impecable
const fontGlobal = "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif";

function Mantenimiento() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ descripcion: '', foto_url: '' });
  const [submitting, setSubmitting] = useState(false);
  
  const tipoUsuario = authService.getTipoUsuario();
  const apiBase = tipoUsuario === 'comprador' ? '/api/comprador' : '/api/inquilino';

  useEffect(() => {
    cargarMantenimientos();
  }, []);

  const cargarMantenimientos = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`http://localhost:5000${apiBase}/mantenimientos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMantenimientos(response.data);
    } catch (error) {
      console.error('Error al cargar mantenimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, foto_url: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = authService.getToken();
      await axios.post(`http://localhost:5000${apiBase}/mantenimientos`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setFormData({ descripcion: '', foto_url: '' });
      cargarMantenimientos(); 
    } catch (error) {
      alert(error.response?.data?.message || 'Error al enviar el reporte');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress sx={{ color: palette.botonPrincipal }} />
      </Box>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '80vh', paddingBottom: '50px', fontFamily: fontGlobal }}>
      {/* ✅ ENVOLVEMOS TODO EN LA TARJETA MODERNA BLANCA */}
      <div className="modern-card" style={{ padding: '30px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        
        {/* ENCABEZADO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: palette.titulos, display: 'flex', alignItems: 'center', gap: 1, fontFamily: fontGlobal, m: 0 }}>
            <Build fontSize="large" sx={{ mr: 1 }} /> Mantenimiento
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => setShowModal(true)}
            sx={{ 
              bgcolor: palette.botonPrincipal, 
              fontWeight: 'bold', 
              borderRadius: 8, 
              px: 3, py: 1.5,
              fontFamily: fontGlobal, 
              textTransform: 'none', 
              fontSize: '1rem',
              boxShadow: '0 4px 10px rgba(198, 106, 61, 0.3)',
              '&:hover': { bgcolor: '#a6552e' }
            }}
          >
            Reportar Daño
          </Button>
        </div>

        {/* TABLA CON ANCHO COMPLETO Y ESTILO PROFESIONAL */}
        <TableContainer component={Paper} sx={{ borderRadius: "12px", border: '1px solid #E8DCCB', boxShadow: 'none', overflowX: 'auto' }}>
          <Table sx={{ width: '100%', minWidth: 600 }}>
            <TableHead sx={{ bgcolor: palette.fondoAlterno }}>
              <TableRow>
                <TableCell sx={{ fontWeight: '800', color: palette.titulos, fontFamily: fontGlobal, fontSize: '0.9rem', textTransform: 'uppercase', borderBottom: '2px solid #C66A3D', p: 2 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: '800', color: palette.titulos, fontFamily: fontGlobal, fontSize: '0.9rem', textTransform: 'uppercase', borderBottom: '2px solid #C66A3D', p: 2 }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: '800', color: palette.titulos, fontFamily: fontGlobal, fontSize: '0.9rem', textTransform: 'uppercase', borderBottom: '2px solid #C66A3D', p: 2 }}>Foto</TableCell>
                <TableCell sx={{ fontWeight: '800', color: palette.titulos, fontFamily: fontGlobal, fontSize: '0.9rem', textTransform: 'uppercase', borderBottom: '2px solid #C66A3D', p: 2 }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mantenimientos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <CheckCircleOutline sx={{ fontSize: 60, color: '#a5d6a7', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: palette.titulos, fontWeight: 'bold', fontFamily: fontGlobal }}>¡Todo perfecto!</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: fontGlobal }}>No tienes reportes de mantenimiento activos.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                mantenimientos.map((m) => (
                  <TableRow key={m.id} hover sx={{ '&:hover': { bgcolor: '#fafafa' }, transition: 'background 0.2s' }}>
                    <TableCell sx={{ p: 2 }}>
                      <Typography variant="body2" sx={{ color: '#555', fontFamily: fontGlobal, fontSize: '1rem', fontWeight: '500' }}>
                        {new Date(m.fecha_reporte).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    
                    <TableCell sx={{ p: 2, maxWidth: '400px' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'normal', wordWrap: 'break-word', color: '#333', fontFamily: fontGlobal, fontSize: '1rem', lineHeight: 1.5 }}>
                        {m.descripcion}
                      </Typography>
                    </TableCell>
                    
                    <TableCell sx={{ p: 2 }}>
                      {m.foto_url ? (
                        <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5, fontFamily: fontGlobal }}>
                          ✓ Adjunta
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary" sx={{ fontFamily: fontGlobal, fontStyle: 'italic' }}>Sin foto</Typography>
                      )}
                    </TableCell>
                    
                    <TableCell sx={{ p: 2 }}>
                      <Chip 
                        label={m.estado} 
                        size="small" 
                        sx={{ 
                          bgcolor: m.estado === 'Solucionado' ? '#e8f5e9' : m.estado === 'En Revisión' ? '#fff3e0' : '#ffebee', 
                          color: m.estado === 'Solucionado' ? '#2e7d32' : m.estado === 'En Revisión' ? '#ef6c00' : '#c62828',
                          fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', fontFamily: fontGlobal, letterSpacing: '0.5px'
                        }} 
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* ✅ Modal Reportar Daño (INTACTO, SOLO AJUSTES DE DISEÑO EN LOS BORDES) */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: '900', color: palette.titulos, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: fontGlobal }}>
          Describa el Problema
          <IconButton onClick={() => setShowModal(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ borderTop: `1px solid #eee`, borderBottom: 'none', px: 4, py: 3 }}>
            <Typography variant="body1" sx={{ color: '#555', mb: 3, fontFamily: fontGlobal, fontWeight: '500' }}>
              Detalla el problema para que la administración pueda ayudarte lo más pronto posible.
            </Typography>

            <TextField 
              label="¿Qué sucedió?" 
              multiline 
              rows={4} 
              fullWidth 
              required
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              placeholder="Ej: Hay una fuga de agua en el lavabo de la cocina..."
              sx={{ mb: 3 }}
              InputProps={{ style: { fontFamily: fontGlobal, fontSize: '1.05rem', color: '#333' } }}
              InputLabelProps={{ style: { fontFamily: fontGlobal, fontWeight: 'bold' } }}
            />

            <Box sx={{ p: 3, border: '2px dashed #BFA58A', borderRadius: 3, textAlign: 'center', bgcolor: '#F5EFE6', transition: 'background 0.3s', '&:hover': { bgcolor: '#f0e6d8' } }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', fontFamily: fontGlobal, color: palette.titulos }}>Foto de Evidencia (Opcional)</Typography>
              <Button variant="outlined" component="label" startIcon={<InsertPhoto />} sx={{ fontFamily: fontGlobal, textTransform: 'none', borderColor: palette.botonPrincipal, color: palette.botonPrincipal, fontWeight: 'bold', borderRadius: 2 }}>
                Elegir Archivo
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
              </Button>
              {formData.foto_url && (
                <Typography variant="body2" sx={{ mt: 2, color: '#2e7d32', fontWeight: 'bold', fontFamily: fontGlobal, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                  <CheckCircleOutline fontSize="small" /> Imagen cargada correctamente
                </Typography>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, px: 4, justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setShowModal(false)} sx={{ color: '#666', fontWeight: 'bold', fontFamily: fontGlobal, textTransform: 'none', fontSize: '1rem' }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={submitting} sx={{ bgcolor: palette.botonPrincipal, fontWeight: 'bold', borderRadius: 8, px: 4, py: 1, fontFamily: fontGlobal, textTransform: 'none', fontSize: '1rem', boxShadow: '0 4px 10px rgba(198, 106, 61, 0.3)' }}>
              {submitting ? 'Enviando...' : 'Enviar Reporte'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}

export default Mantenimiento;