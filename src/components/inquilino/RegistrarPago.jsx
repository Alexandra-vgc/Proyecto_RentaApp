import { useState, useEffect } from 'react';
import axios from 'axios';
import './RegistrarPago.css';

function RegistrarPago({ onClose, onPagoRegistrado }) {
  const [contratos, setContratos] = useState([]);
  const [formData, setFormData] = useState({
    contrato_id: '',
    mes: '',
    monto: '',
    fecha_pago: '',
    fecha_vencimiento: '',
    metodo_pago: 'transferencia',
    notas: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarContratos();
  }, []);

  const cargarContratos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/user/contratos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Solo contratos activos
      const activos = response.data.filter(c => c.estado === 'activo');
      setContratos(activos);
    } catch (error) {
      console.error('Error al cargar contratos:', error);
    }
  };

  const handleContratoChange = (e) => {
    const contratoId = e.target.value;
    const contrato = contratos.find(c => c.id === parseInt(contratoId));
    
    if (contrato) {
      // Autocompletar el monto con el del contrato
      setFormData({
        ...formData,
        contrato_id: contratoId,
        monto: contrato.monto_mensual
      });
    } else {
      setFormData({ ...formData, contrato_id: contratoId });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (!formData.contrato_id) {
      setError('Debes seleccionar un contrato');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/user/pagos',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Pago registrado exitosamente');
      onPagoRegistrado();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💰 Registrar Pago</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="pago-form">
          {error && (
            <div className="error-message">
              <span>⚠️ {error}</span>
            </div>
          )}

          <div className="form-group">
            <label>Contrato *</label>
            <select
              name="contrato_id"
              value={formData.contrato_id}
              onChange={handleContratoChange}
              required
            >
              <option value="">Selecciona un contrato</option>
              {contratos.map((contrato) => (
                <option key={contrato.id} value={contrato.id}>
                  {contrato.departamento_codigo} - {contrato.inquilino_nombre} {contrato.inquilino_apellido}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mes (YYYY-MM) *</label>
              <input
                type="month"
                name="mes"
                value={formData.mes}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Monto *</label>
              <input
                type="number"
                step="0.01"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha de Pago</label>
              <input
                type="date"
                name="fecha_pago"
                value={formData.fecha_pago}
                onChange={handleChange}
              />
              <small>Deja vacío si aún no se ha pagado</small>
            </div>

            <div className="form-group">
              <label>Fecha Vencimiento *</label>
              <input
                type="date"
                name="fecha_vencimiento"
                value={formData.fecha_vencimiento}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Método de Pago</label>
            <select
              name="metodo_pago"
              value={formData.metodo_pago}
              onChange={handleChange}
            >
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="cheque">Cheque</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="form-group">
            <label>Notas</label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows="3"
              placeholder="Observaciones adicionales..."
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegistrarPago;