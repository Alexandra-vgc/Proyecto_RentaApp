import { useState, useEffect } from 'react';
import authService from '../../services/authService';
import axios from 'axios';

function MiContrato() {
  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(true);
  const tipoUsuario = authService.getTipoUsuario();

  useEffect(() => {
    cargarContrato();
  }, []);

  const cargarContrato = async () => {
    try {
      const token = authService.getToken();
      const apiBase = authService.getApiBase();
      const response = await axios.get(`${apiBase}/mi-contrato`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContrato(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  if (!contrato) {
    return (
      <div className="no-data">
        <h2>No tienes un contrato activo</h2>
        <p>Contacta al administrador para más información.</p>
      </div>
    );
  }

  const esComprador = tipoUsuario === 'comprador';
  const tituloContrato = esComprador ? 'Contrato de Compra' : 'Contrato de Arrendamiento';

  return (
    <div>
      <h1 className="page-title">{tituloContrato}</h1>
      
      <div className="info-card">
        <div className="info-row">
          <span className="label">Departamento:</span>
          <span className="value"><strong>{contrato.departamento_codigo}</strong></span>
        </div>
        <div className="info-row">
          <span className="label">Dirección:</span>
          <span className="value">{contrato.departamento_direccion}</span>
        </div>
        <div className="info-row">
          <span className="label">Habitaciones:</span>
          <span className="value">{contrato.numero_habitaciones}</span>
        </div>
        <div className="info-row">
          <span className="label">Baños:</span>
          <span className="value">{contrato.numero_banos}</span>
        </div>
        <div className="info-row">
          <span className="label">Metros Cuadrados:</span>
          <span className="value">{contrato.metros_cuadrados} m²</span>
        </div>
        <div className="info-row">
          <span className="label">Fecha Inicio:</span>
          <span className="value">{new Date(contrato.fecha_inicio).toLocaleDateString()}</span>
        </div>
        <div className="info-row">
          <span className="label">Fecha Fin:</span>
          <span className="value">{new Date(contrato.fecha_fin).toLocaleDateString()}</span>
        </div>
        
        {esComprador ? (
          <>
            <div className="info-row">
              <span className="label">Precio Total:</span>
              <span className="value price">${contrato.precio_total}</span>
            </div>
            <div className="info-row">
              <span className="label">Cuota Inicial:</span>
              <span className="value price">${contrato.cuota_inicial}</span>
            </div>
            <div className="info-row">
              <span className="label">Número de Cuotas:</span>
              <span className="value">{contrato.numero_cuotas}</span>
            </div>
            <div className="info-row">
              <span className="label">Cuota Mensual:</span>
              <span className="value price">${contrato.monto_mensual}</span>
            </div>
          </>
        ) : (
          <>
            <div className="info-row">
              <span className="label">Renta Mensual:</span>
              <span className="value price">${contrato.monto_mensual}</span>
            </div>
            <div className="info-row">
              <span className="label">Día de Pago:</span>
              <span className="value">{contrato.dia_pago}</span>
            </div>
            <div className="info-row">
              <span className="label">Depósito:</span>
              <span className="value price">${contrato.deposito}</span>
            </div>
          </>
        )}
        
        <div className="info-row">
          <span className="label">Estado:</span>
          <span className={`status-badge ${contrato.estado}`}>
            {contrato.estado}
          </span>
        </div>
        {contrato.notas && (
          <div className="info-row">
            <span className="label">Notas:</span>
            <span className="value">{contrato.notas}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MiContrato;