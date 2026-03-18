import React, { useState } from 'react';
import axios from 'axios';
import authService from '../../services/authService';
import './RegistrarPago.css'; 

function RegistrarPago({ onClose, onPagoRegistrado }) {
  const [formData, setFormData] = useState({
    monto: '',
    mes: '',
    metodo: 'transferencia',
    comprobante_url: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 
  const tipoUsuario = authService.getTipoUsuario();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { 
        setError("La imagen es muy pesada. Por favor sube una de menos de 5MB.");
        return;
      }
      setError(null);
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
    setError(null);

    if (!formData.monto || !formData.mes || !formData.comprobante_url) {
        setError("Por favor, completa todos los campos y sube el comprobante.");
        setLoading(false);
        return;
    }

    try {
      const token = authService.getToken();
      const apiBase = tipoUsuario === 'comprador' ? '/api/comprador' : '/api/inquilino';
      
      await axios.post(`http://localhost:5000${apiBase}/pagos`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('✅ Pago enviado para revisión exitosamente.');
      onPagoRegistrado(); 
    } catch (err) {
      console.error('Error al registrar pago:', err);
      setError('Hubo un error al enviar el pago. Verifica tu conexión o intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ borderColor: 'var(--color-primario)', border: '2px solid' }}>
        
        <div className="modal-header">
          <h2 style={{ color: 'var(--texto-oscuro)' }}>Registrar Nuevo Pago</h2>
          <button className="btn-close" onClick={onClose}>✖</button>
        </div>

        <form onSubmit={handleSubmit} className="pago-form">
          
          {/*  AQUÍ ESTÁ EL NUEVO CUADRO CON LOS DATOS BANCARIOS  */}
          <div style={{ 
            backgroundColor: '#fdf8f5', 
            border: '1px solid var(--color-primario)', 
            borderLeft: '5px solid var(--color-primario)',
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px' 
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--color-primario)', display: 'flex', alignItems: 'center', gap: '8px' }}>
               Datos para Transferencia o Depósito
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.9rem', color: 'var(--texto-oscuro)' }}>
              <div><strong>Banco:</strong> Banco Pichincha</div>
              <div><strong>Tipo de Cuenta:</strong> Ahorros</div>
              <div><strong>Número:</strong> 2200123456</div>
              <div><strong>Titular:</strong> MiRentaApp S.A.</div>
              <div><strong>CI/RUC:</strong> 1790000000001</div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label style={{ color: 'var(--texto-oscuro)' }}>Monto a Pagar ($)</label>
            <input 
              type="number" 
              required 
              min="1"
              step="0.01"
              value={formData.monto}
              onChange={(e) => setFormData({...formData, monto: e.target.value})}
              placeholder="Ej: 450.00"
            />
          </div>

          <div className="form-group">
            <label style={{ color: 'var(--texto-oscuro)' }}>Mes Correspondiente</label>
            <select 
              required
              value={formData.mes}
              onChange={(e) => setFormData({...formData, mes: e.target.value})}
            >
              <option value="">Selecciona un mes...</option>
              <option value="01-2026">Enero 2026</option>
              <option value="02-2026">Febrero 2026</option>
              <option value="03-2026">Marzo 2026</option>
              <option value="04-2026">Abril 2026</option>
              <option value="05-2026">Mayo 2026</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ color: 'var(--texto-oscuro)' }}>Sube tu Comprobante</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageUpload}
              required
              style={{ border: '1px dashed var(--color-primario)', background: 'var(--fondo-principal)', width: '100%', padding: '10px', borderRadius: '8px' }}
            />
            {formData.comprobante_url && (
              <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: '#2e7d32', fontWeight: 'bold' }}>
                ✓ Imagen cargada lista para enviar
              </p>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-submit" style={{ background: 'var(--color-primario)' }}>
              {loading ? 'Enviando...' : 'Enviar Pago a Revisión'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default RegistrarPago;