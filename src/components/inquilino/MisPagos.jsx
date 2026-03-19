import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../../services/authService';
import RegistrarPago from './RegistrarPago'; // Importamos el modal

function MisPagos() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false); // Estado para abrir/cerrar el modal
  const tipoUsuario = authService.getTipoUsuario();

  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    setLoading(true); // Refrescamos el estado de carga al actualizar
    try {
      const token = authService.getToken();
      const apiBase = tipoUsuario === 'comprador' ? '/api/comprador' : '/api/inquilino';
      
      const response = await axios.get(`http://localhost:5000${apiBase}/mis-pagos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPagos(response.data);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Esta función se ejecuta cuando el modal termina de guardar un pago con éxito
  const handlePagoRegistrado = () => {
    setMostrarModal(false); // Cerramos el modal
    cargarPagos(); // Recargamos la tabla para que aparezca el pago nuevo automáticamente
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-primario)' }}>Cargando historial...</div>;

  return (
    <div style={{ position: 'relative', minHeight: '80vh' }}>
      <div className="modern-card" style={{ padding: '30px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ margin: 0, color: 'var(--texto-oscuro)', fontSize: '24px' }}>Mi Historial de Pagos</h2>
          <button 
            onClick={cargarPagos} 
            style={{ padding: '8px 15px', fontSize: '0.9rem', background: 'var(--fondo-principal)', color: 'var(--texto-secundario)', border: '1px solid var(--lineas-bordes)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ↻ Actualizar
          </button>
        </div>

        {pagos.length === 0 ? (
          <div className="empty-state-container" style={{ padding: '60px 20px', textAlign: 'center', border: '1px dashed var(--texto-secundario)', borderRadius: '12px', backgroundColor: 'var(--fondo-tarjeta)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>🧾</div>
            <h3 style={{ color: 'var(--texto-oscuro)', margin: '0 0 10px 0' }}>Aún no tienes pagos registrados</h3>
            <p style={{ color: 'var(--texto-secundario)', margin: 0 }}>Cuando realices tu primer pago usando el botón de abajo, aparecerá aquí.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-primario)', color: 'var(--texto-secundario)', backgroundColor: 'var(--fondo-principal)' }}>
                  <th style={{ padding: '15px', borderTopLeftRadius: '8px' }}>Fecha de Pago</th>
                  <th style={{ padding: '15px' }}>Mes Correspondiente</th>
                  <th style={{ padding: '15px' }}>Monto</th>
                  <th style={{ padding: '15px' }}>Método</th>
                  <th style={{ padding: '15px', borderTopRightRadius: '8px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => (
                  <tr key={pago.id} style={{ borderBottom: '1px solid var(--lineas-bordes)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--fondo-tarjeta)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '15px', color: 'var(--texto-oscuro)', fontWeight: '500' }}>
                      {new Date(pago.fecha_pago).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '15px', color: 'var(--texto-oscuro)' }}>{pago.mes || pago.mes_correspondiente}</td>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: 'var(--color-primario)' }}>
                      ${pago.monto}
                    </td>
                    <td style={{ padding: '15px', color: 'var(--texto-secundario)', textTransform: 'capitalize' }}>{pago.metodo_pago || 'Transferencia'}</td>
                    <td style={{ padding: '15px' }}>{getEstadoBadge(pago.estado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Botón flotante para abrir el modal (similar al de tu captura) */}
      <button 
        onClick={() => setMostrarModal(true)}
        style={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primario)',
          color: 'white',
          fontSize: '24px',
          border: 'none',
          boxShadow: '0 4px 15px rgba(198, 106, 61, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'transform 0.2s',
          zIndex: 100
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Registrar nuevo pago"
      >
        💰
      </button>

      {/* Renderizamos el Modal condicionalmente */}
      {mostrarModal && (
        <RegistrarPago 
          onClose={() => setMostrarModal(false)} 
          onPagoRegistrado={handlePagoRegistrado} 
        />
      )}
    </div>
  );
}

export default MisPagos;