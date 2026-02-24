import { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../../services/authService';
import RegistrarPago from './RegistrarPago';

function MisPagos({ onRecargar }) {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get('http://localhost:5000/api/inquilino/mis-pagos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPagos(response.data);
    } catch (err) {
      setError('Error al cargar los pagos.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'pagado':    return { bg: '#e8f5e9', text: '#2e7d32', dot: '#4caf50' };
      case 'pendiente': return { bg: '#fff3cd', text: '#856404', dot: '#ffc107' };
      case 'atrasado':  return { bg: '#ffebee', text: '#c62828', dot: '#f44336' };
      case 'parcial':   return { bg: '#e3f2fd', text: '#1565c0', dot: '#2196f3' };
      default:          return { bg: '#f5f5f5', text: '#757575', dot: '#9e9e9e' };
    }
  };

  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  const pagosFiltered = filtroEstado === 'todos'
    ? pagos
    : pagos.filter(p => p.estado === filtroEstado);

  // Estadísticas rápidas
  const totalPagado = pagos.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + Number(p.monto), 0);
  const totalPendientes = pagos.filter(p => p.estado === 'pendiente' || p.estado === 'atrasado').length;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div className="spinner"></div>
        <p style={{ color: '#6c757d', marginTop: '16px' }}>Cargando pagos...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Mis Pagos</h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '12px 28px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(102,126,234,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(102,126,234,0.4)'; }}
        >
          💰 Registrar Pago
        </button>
      </div>

      {/* RESUMEN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { icon: '📊', label: 'Total de Pagos', value: pagos.length, color: '#667eea' },
          { icon: '✅', label: 'Total Pagado', value: `$${totalPagado.toFixed(2)}`, color: '#28a745' },
          { icon: '⏳', label: 'Pendientes', value: totalPendientes, color: totalPendientes > 0 ? '#dc3545' : '#6c757d' },
        ].map((item, i) => (
          <div key={i} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px', height: '48px',
              background: `${item.color}15`,
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px'
            }}>{item.icon}</div>
            <div>
              <p style={{ margin: '0 0 3px', color: '#6c757d', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>{item.label}</p>
              <p style={{ margin: 0, color: item.color, fontSize: '20px', fontWeight: '700' }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['todos', 'pagado', 'pendiente', 'atrasado', 'parcial'].map(estado => {
          const isActive = filtroEstado === estado;
          return (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              style={{
                padding: '8px 18px',
                borderRadius: '20px',
                border: isActive ? 'none' : '1px solid #e0e0e0',
                background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                color: isActive ? 'white' : '#6c757d',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {capitalize(estado)}
            </button>
          );
        })}
      </div>

      {/* TABLA DE PAGOS */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        {pagosFiltered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💸</div>
            <h3 style={{ color: '#2c3e50', margin: '0 0 8px' }}>
              {filtroEstado === 'todos' ? 'No tienes pagos registrados' : `No hay pagos ${filtroEstado}`}
            </h3>
            <p style={{ color: '#6c757d', margin: 0 }}>
              {filtroEstado === 'todos'
                ? 'Cuando registres un pago, aparecerá aquí.'
                : 'Prueba cambiar el filtro.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['Mes', 'Monto', 'Fecha Pago', 'Vencimiento', 'Método', 'Estado'].map(h => (
                    <th key={h} style={{
                      padding: '14px 18px',
                      textAlign: 'left',
                      color: '#6c757d',
                      fontSize: '12px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #eee',
                      whiteSpace: 'nowrap'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagosFiltered.map((pago, i) => {
                  const estilo = getEstadoStyle(pago.estado);
                  return (
                    <tr key={pago.id} style={{
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background 0.2s',
                      background: i % 2 === 0 ? 'white' : '#fafafa'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#fafafa'}
                    >
                      <td style={{ padding: '14px 18px', color: '#2c3e50', fontWeight: '600' }}>
                        {pago.mes}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#28a745', fontWeight: '700', fontSize: '16px' }}>
                        ${Number(pago.monto).toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#6c757d' }}>
                        {formatDate(pago.fecha_pago)}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#6c757d' }}>
                        {formatDate(pago.fecha_vencimiento)}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#6c757d', textTransform: 'capitalize' }}>
                        {pago.metodo_pago || '—'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 14px',
                          borderRadius: '16px',
                          background: estilo.bg,
                          color: estilo.text,
                          fontSize: '13px',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: estilo.dot, display: 'inline-block' }}></span>
                          {pago.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <RegistrarPago
          onClose={() => setShowModal(false)}
          onPagoRegistrado={() => {
            cargarPagos();
            if (onRecargar) onRecargar();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

export default MisPagos;