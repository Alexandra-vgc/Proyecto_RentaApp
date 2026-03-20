import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../../services/authService';
import RegistrarPago from './RegistrarPago';
import SearchIcon from '@mui/icons-material/Search'; // ✅ ÍCONO IMPORTADO CORRECTAMENTE

function MisPagos() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos'); 
  const [busquedaTexto, setBusquedaTexto] = useState(''); 
  const tipoUsuario = authService.getTipoUsuario();

  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    setLoading(true);
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
      case 'pagado':
        return <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>✓ Aprobado</span>;
      case 'rechazado':
      case 'atrasado':
        return <span style={{ background: '#ffebee', color: '#c62828', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>✖ Rechazado</span>;
      default:
        return <span style={{ background: '#fff3e0', color: '#f57c00', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>⏳ En Revisión</span>;
    }
  };

  const handlePagoRegistrado = () => {
    setMostrarModal(false);
    cargarPagos();
  };

  const pagosFiltrados = pagos.filter(pago => {
    let pasaEstado = true;
    if (filtroEstado !== 'todos') {
      const estadoReal = pago.estado?.toLowerCase() || 'pendiente';
      if (filtroEstado === 'aprobado') pasaEstado = (estadoReal === 'aprobado' || estadoReal === 'pagado');
      else if (filtroEstado === 'rechazado') pasaEstado = (estadoReal === 'rechazado' || estadoReal === 'atrasado');
      else if (filtroEstado === 'revision') pasaEstado = (estadoReal === 'pendiente');
    }

    let pasaTexto = true;
    if (busquedaTexto.trim() !== '') {
      const texto = busquedaTexto.toLowerCase();
      pasaTexto = 
        (pago.mes && pago.mes.toLowerCase().includes(texto)) ||
        (pago.monto && pago.monto.toString().includes(texto)) ||
        (pago.metodo_pago && pago.metodo_pago.toLowerCase().includes(texto));
    }

    return pasaEstado && pasaTexto;
  });

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-primario)' }}>Cargando historial...</div>;

  return (
    <div style={{ position: 'relative', minHeight: '80vh', paddingBottom: '100px' }}>
      <div className="modern-card" style={{ padding: '30px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        
        {/* ENCABEZADO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ margin: 0, color: 'var(--texto-oscuro)', fontSize: '24px', fontWeight: '800' }}>Mi Historial de Pagos</h2>
          <button 
            onClick={cargarPagos} 
            style={{ padding: '8px 15px', fontSize: '0.9rem', background: 'var(--fondo-principal)', color: 'var(--texto-secundario)', border: '1px solid var(--lineas-bordes)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            ↻ Actualizar
          </button>
        </div>

        {/* ✅ BARRA DE FILTROS + CAJA DE BÚSQUEDA PROFESIONAL */}
        {pagos.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              
              {/* Botones de Estado */}
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                <button 
                  onClick={() => setFiltroEstado('todos')}
                  style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.2s', backgroundColor: filtroEstado === 'todos' ? '#4E5B3C' : '#F5EFE6', color: filtroEstado === 'todos' ? 'white' : '#4E5B3C' }}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setFiltroEstado('aprobado')}
                  style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.2s', backgroundColor: filtroEstado === 'aprobado' ? '#2e7d32' : '#e8f5e9', color: filtroEstado === 'aprobado' ? 'white' : '#2e7d32' }}
                >
                  Aprobados
                </button>
                <button 
                  onClick={() => setFiltroEstado('revision')}
                  style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.2s', backgroundColor: filtroEstado === 'revision' ? '#f57c00' : '#fff3e0', color: filtroEstado === 'revision' ? 'white' : '#f57c00' }}
                >
                  En Revisión
                </button>
              </div>

              {/* ✅ Caja de Búsqueda con la Lupa de Material-UI */}
              <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                <SearchIcon style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '22px' }} />
                <input 
                  type="text" 
                  placeholder="Buscar mes o monto..." 
                  value={busquedaTexto}
                  onChange={(e) => setBusquedaTexto(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #E8DCCB', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box', color: '#555' }} 
                />
              </div>

            </div>
          </div>
        )}

        {/* TABLA O ESTADO VACÍO */}
        {pagos.length === 0 ? (
          <div className="empty-state-container" style={{ padding: '60px 20px', textAlign: 'center', border: '2px dashed #E8DCCB', borderRadius: '12px', backgroundColor: '#FAFAFA' }}>
            <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🧾</div>
            <h3 style={{ color: '#4E5B3C', margin: '0 0 10px 0', fontWeight: '800' }}>Aún no tienes pagos registrados</h3>
            <p style={{ color: '#888', margin: 0 }}>Tus abonos o rentas pagadas aparecerán aquí.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #E8DCCB' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: '#4E5B3C', backgroundColor: '#F5EFE6', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '15px 20px', borderBottom: '2px solid #C66A3D' }}>Fecha de Pago</th>
                  <th style={{ padding: '15px 20px', borderBottom: '2px solid #C66A3D' }}>Mes</th>
                  <th style={{ padding: '15px 20px', borderBottom: '2px solid #C66A3D' }}>Monto</th>
                  <th style={{ padding: '15px 20px', borderBottom: '2px solid #C66A3D' }}>Método</th>
                  <th style={{ padding: '15px 20px', borderBottom: '2px solid #C66A3D' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pagosFiltrados.map((pago) => (
                  <tr key={pago.id} style={{ borderBottom: '1px solid #eee', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '15px 20px', color: '#555', fontWeight: '500' }}>
                      {new Date(pago.fecha_pago).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '15px 20px', color: '#333', fontWeight: 'bold' }}>{pago.mes || pago.mes_correspondiente}</td>
                    <td style={{ padding: '15px 20px', fontWeight: '900', color: '#C66A3D', fontSize: '1.1rem' }}>
                      ${pago.monto}
                    </td>
                    <td style={{ padding: '15px 20px', color: '#777', textTransform: 'capitalize' }}>{pago.metodo_pago || 'Transferencia'}</td>
                    <td style={{ padding: '15px 20px' }}>{getEstadoBadge(pago.estado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {pagosFiltrados.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontWeight: 'bold' }}>
                No se encontraron pagos con ese filtro o búsqueda.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ BOTÓN ORIGINAL */}
      <div style={{ position: 'fixed', bottom: '40px', right: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 100 }}>
        <button 
          onClick={() => setMostrarModal(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#C66A3D',
            color: 'white',
            fontSize: '24px',
            border: 'none',
            boxShadow: '0 4px 15px rgba(198, 106, 61, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'transform 0.2s',
            marginBottom: '8px'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          title="Registrar nuevo pago"
        >
          💰
        </button>
        <span style={{ 
          backgroundColor: '#F5EFE6', 
          color: '#C66A3D', 
          fontWeight: '900', 
          fontSize: '0.85rem', 
          padding: '4px 12px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          border: '1px solid #E8DCCB'
        }}>
          Paga aquí
        </span>
      </div>

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