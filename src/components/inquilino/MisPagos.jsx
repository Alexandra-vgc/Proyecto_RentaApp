import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../../services/authService';

function MisPagos({ onRecargar }) {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const tipoUsuario = authService.getTipoUsuario();

  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    try {
      const token = authService.getToken();
      const apiBase = tipoUsuario === 'comprador' ? '/api/comprador' : '/api/inquilino';
      
      const response = await axios.get(`http://localhost:5000${apiBase}/mis-pagos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPagos(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
      setLoading(false);
    }
  };

  // Función para darle color a la etiqueta según el estado
  const getEstadoBadge = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'aprobado':
        return <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>✓ Aprobado</span>;
      case 'rechazado':
        return <span style={{ background: '#ffebee', color: '#c62828', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>✖ Rechazado</span>;
      default:
        return <span style={{ background: '#fff3e0', color: '#f57c00', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>⏳ En Revisión</span>;
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-primario)' }}>Cargando historial...</div>;

  return (
    <div className="modern-card" style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0, color: 'var(--texto-oscuro)' }}>Mi Historial de Pagos</h2>
        <button className="btn-explorar" onClick={onRecargar} style={{ padding: '8px 15px', fontSize: '0.9rem' }}>
          ↻ Actualizar
        </button>
      </div>

      {pagos.length === 0 ? (
        <div className="empty-state-container" style={{ padding: '40px 20px', border: 'none', backgroundColor: 'var(--fondo-principal)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🧾</div>
          <h3 style={{ color: 'var(--texto-oscuro)' }}>Aún no tienes pagos registrados</h3>
          <p style={{ color: 'var(--texto-secundario)' }}>Cuando realices tu primer pago, aparecerá aquí.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--lineas-bordes)', color: 'var(--texto-secundario)' }}>
                <th style={{ padding: '15px 10px' }}>Fecha de Pago</th>
                <th style={{ padding: '15px 10px' }}>Mes Correspondiente</th>
                <th style={{ padding: '15px 10px' }}>Monto</th>
                <th style={{ padding: '15px 10px' }}>Método</th>
                <th style={{ padding: '15px 10px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => (
                <tr key={pago.id} style={{ borderBottom: '1px solid var(--lineas-bordes)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '15px 10px', color: 'var(--texto-oscuro)', fontWeight: '500' }}>
                    {new Date(pago.fecha_pago).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '15px 10px', color: 'var(--texto-oscuro)' }}>{pago.mes_correspondiente}</td>
                  <td style={{ padding: '15px 10px', fontWeight: 'bold', color: 'var(--color-primario)' }}>
                    ${pago.monto}
                  </td>
                  <td style={{ padding: '15px 10px', color: 'var(--texto-secundario)' }}>{pago.metodo_pago || 'Transferencia'}</td>
                  <td style={{ padding: '15px 10px' }}>{getEstadoBadge(pago.estado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MisPagos;