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
    <Box sx={{ maxWidth: '1000px', fontFamily: fontGlobal }}>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: palette.titulos, display: 'flex', alignItems: 'center', gap: 1, fontFamily: fontGlobal }}>
          <Build fontSize="large" sx={{ mr: 1 }} /> Mantenimiento
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => setShowModal(true)}
          sx={{ bgcolor: palette.botonPrincipal, fontWeight: 'bold', borderRadius: 2, px: 3, fontFamily: fontGlobal, textTransform: 'none', fontSize: '1rem' }}
        >
          Reportar Daño
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <Table>
          <TableHead sx={{ bgcolor: palette.fondoAlterno }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: palette.titulos, fontFamily: fontGlobal, fontSize: '1rem' }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: palette.titulos, fontFamily: fontGlobal, fontSize: '1rem' }}>Descripción</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: palette.titulos, fontFamily: fontGlobal, fontSize: '1rem' }}>Foto</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: palette.titulos, fontFamily: fontGlobal, fontSize: '1rem' }}>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mantenimientos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <CheckCircleOutline sx={{ fontSize: 50, color: '#a5d6a7', mb: 1 }} />
                  <Typography variant="body1" color="textSecondary" sx={{ fontFamily: fontGlobal }}>No hay reportes de mantenimiento. ¡Todo perfecto!</Typography>
                </TableCell>
              </TableRow>
            ) : (
              mantenimientos.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#555', fontFamily: fontGlobal, fontSize: '1rem' }}>
                      {new Date(m.fecha_reporte).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  
                  <TableCell sx={{ maxWidth: '350px' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'normal', wordWrap: 'break-word', color: '#333', fontFamily: fontGlobal, fontSize: '1rem', lineHeight: 1.5 }}>
                      {m.descripcion}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    {m.foto_url ? (
                      <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5, fontFamily: fontGlobal }}>
                        ✓ Adjunta
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ fontFamily: fontGlobal }}>-</Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
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

      {/* Modal Reportar Daño */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: palette.titulos, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: fontGlobal }}>
          Describa el Problema
          <IconButton onClick={() => setShowModal(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ borderTop: `1px solid #eee`, borderBottom: 'none' }}>
            <Typography variant="body1" sx={{ color: '#555', mb: 3, fontFamily: fontGlobal }}>
              Detalla el problema para que la administración pueda ayudarte.
            </Typography>

            <TextField 
              label="¿Qué sucedió?" 
              multiline 
              rows={4} 
              fullWidth 
              required
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              placeholder="Ej: Hay una fuga de agua en el lavabo..."
              sx={{ mb: 3 }}
              InputProps={{ style: { fontFamily: fontGlobal, fontSize: '1.05rem' } }}
              InputLabelProps={{ style: { fontFamily: fontGlobal } }}
            />

            <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, textAlign: 'center', bgcolor: '#fafafa' }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', fontFamily: fontGlobal }}>Foto (Opcional)</Typography>
              <Button variant="outlined" component="label" startIcon={<InsertPhoto />} sx={{ fontFamily: fontGlobal, textTransform: 'none' }}>
                Subir Archivo
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
              </Button>
              {formData.foto_url && (
                <Typography variant="body2" sx={{ mt: 1, color: '#2e7d32', fontWeight: 'bold', fontFamily: fontGlobal }}>
                  ✓ Imagen lista
                </Typography>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setShowModal(false)} sx={{ color: '#666', fontWeight: 'bold', fontFamily: fontGlobal }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={submitting} sx={{ bgcolor: palette.botonPrincipal, fontWeight: 'bold', borderRadius: 2, px: 3, fontFamily: fontGlobal, textTransform: 'none' }}>
              {submitting ? 'Enviando...' : 'Enviar Reporte'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Mantenimiento;