import React, { useState } from 'react';
import axios from 'axios';
import authService from '../../services/authService';

function RegistrarPago({ onClose, onPagoRegistrado }) {
  const [formData, setFormData] = useState({
    monto: '',
    mes: '',
    metodo: 'transferencia',
    comprobante_url: '' // Aquí guardaremos la imagen convertida
  });
  const [loading, setLoading] = useState(false);
  const tipoUsuario = authService.getTipoUsuario();

  // Función para convertir la imagen a texto (Base64) para guardarla fácil
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, comprobante_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = authService.getToken();
      const apiBase = tipoUsuario === 'comprador' ? '/api/comprador' : '/api/inquilino';
      
      await axios.post(`http://localhost:5000${apiBase}/pagos`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('✅ Pago enviado para revisión exitosamente.');
      onPagoRegistrado(); // Cierra la ventana y recarga el dashboard
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('Hubo un error al enviar el pago. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(74, 63, 53, 0.7)', // Fondo oscuro elegante
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--fondo-tarjeta)', padding: '40px', borderRadius: '16px',
        width: '100%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        border: '2px solid var(--color-primario)'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ margin: 0, color: 'var(--texto-oscuro)' }}>Registrar Nuevo Pago</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--texto-secundario)' }}>✖</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', color: 'var(--texto-oscuro)', fontWeight: 'bold', marginBottom: '8px' }}>Monto a Pagar ($)</label>
            <input 
              type="number" 
              required 
              min="1"
              step="0.01"
              value={formData.monto}
              onChange={(e) => setFormData({...formData, monto: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--lineas-bordes)', fontSize: '1rem', backgroundColor: '#fff' }}
              placeholder="Ej: 450.00"
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--texto-oscuro)', fontWeight: 'bold', marginBottom: '8px' }}>Mes Correspondiente</label>
            <select 
              required
              value={formData.mes}
              onChange={(e) => setFormData({...formData, mes: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--lineas-bordes)', fontSize: '1rem', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              <option value="">Selecciona un mes...</option>
              <option value="Enero 2026">Enero 2026</option>
              <option value="Febrero 2026">Febrero 2026</option>
              <option value="Marzo 2026">Marzo 2026</option>
              <option value="Abril 2026">Abril 2026</option>
              <option value="Mayo 2026">Mayo 2026</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--texto-oscuro)', fontWeight: 'bold', marginBottom: '8px' }}>Comprobante (Transferencia o Depósito)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageUpload}
              required
              style={{ width: '100%', padding: '10px', backgroundColor: 'var(--fondo-principal)', borderRadius: '8px', border: '1px dashed var(--color-primario)', color: 'var(--texto-oscuro)' }}
            />
            {formData.comprobante_url && (
              <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: '#2e7d32', fontWeight: 'bold' }}>✓ Imagen cargada lista para enviar</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', border: '2px solid var(--texto-secundario)', color: 'var(--texto-secundario)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '12px', backgroundColor: 'var(--color-primario)', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.3s' }}>
              {loading ? 'Enviando...' : 'Enviar Pago a Revisión'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default RegistrarPago;