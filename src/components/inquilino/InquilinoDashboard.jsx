import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import axios from 'axios';
import MiDepartamento from './MiDepartamento';
import MiContrato from './MiContrato';
import MisPagos from './MisPagos';
import MiPerfil from './MiPerfil';
import RegistrarPago from './RegistrarPago';
import './InquilinoDashboard.css';

function InquilinoDashboard() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inicio');
  const [showRegistrarPago, setShowRegistrarPago] = useState(false);
  const tipoUsuario = authService.getTipoUsuario();

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      const token = authService.getToken();
      const apiBase = tipoUsuario === 'comprador' ? '/api/comprador' : '/api/inquilino';
      const response = await axios.get(`http://localhost:5000${apiBase}/mi-dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p style={{color: '#C66A3D', fontWeight: 'bold', marginTop: '10px'}}>Cargando tu información...</p>
      </div>
    );
  }

  const esComprador = tipoUsuario === 'comprador';
  const labelPago = esComprador ? 'Cuota Mensual' : 'Renta Mensual';
  const labelPendientes = esComprador ? 'Cuotas Pendientes' : 'Pagos Pendientes';
  
  const stats = dashboardData?.estadisticas || {
      cuotasPendientes: 0,
      totalAbonado: 0,
      saldoPendiente: 0,
      porcentajeProgreso: 0
  };
  const tieneContrato = !!dashboardData?.contrato;

  // Obtenemos el primer nombre para los saludos
  const primerNombre = user?.nombre?.split(' ')[0] || 'Usuario';

  return (
    <div className="inquilino-dashboard">
      {/* NAVBAR */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2 onClick={() => navigate('/')} style={{ cursor: 'pointer' }} title="Volver al inicio">
            🏠 MiRentaApp
          </h2>
        </div>
        <div className="nav-user">
          <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
        </div>
      </nav>

      {/* LAYOUT */}
      <div className="dashboard-layout">
        
        {/* SIDEBAR */}
        <aside className="sidebar">
          
          <div className="sidebar-profile">
            <div className="profile-avatar">
              {primerNombre.charAt(0).toUpperCase()}
            </div>
            <h3 className="profile-name">{primerNombre}</h3>
            <p className="profile-role">{esComprador ? 'Compradora' : 'Inquilina'}</p>
          </div>

          <button className={`sidebar-item ${activeTab === 'inicio' ? 'active' : ''}`} onClick={() => setActiveTab('inicio')}>
            <span className="icon">📊</span> Panel Principal
          </button>
          <button className={`sidebar-item ${activeTab === 'departamento' ? 'active' : ''}`} onClick={() => setActiveTab('departamento')}>
            <span className="icon">🏢</span> Mi Propiedad
          </button>
          <button className={`sidebar-item ${activeTab === 'contrato' ? 'active' : ''}`} onClick={() => setActiveTab('contrato')}>
            <span className="icon">📄</span> Gestión Contrato
          </button>
          <button className={`sidebar-item ${activeTab === 'pagos' ? 'active' : ''}`} onClick={() => setActiveTab('pagos')}>
            <span className="icon">💳</span> Historial de Pagos
            {stats.cuotasPendientes > 0 && <span className="badge-count" style={{marginLeft: 'auto', background: '#C66A3D', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem'}}>{stats.cuotasPendientes}</span>}
          </button>
          <button className={`sidebar-item ${activeTab === 'perfil' ? 'active' : ''}`} onClick={() => setActiveTab('perfil')}>
            <span className="icon">⚙️</span> Configuración
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="dashboard-content">
          {activeTab === 'inicio' && (
            <div className="inicio-tab-animado">
              
              <div className="welcome-banner">
                <h1>¡Bienvenida, {primerNombre}! 👋</h1>
                <p>Aquí tienes la visión general de tu estado y propiedades asignadas.</p>
              </div>

              {!tieneContrato ? (
                /* ESTADO VACÍO */
                <div className="empty-state-container" style={{textAlign: 'center', padding: '50px', backgroundColor: '#F5EFE6', borderRadius: '12px', border: '1px dashed #BFA58A'}}>
                  <div className="empty-state-icon" style={{fontSize: '4rem', marginBottom: '20px'}}>🏡</div>
                  <h2 style={{color: '#4A3F35'}}>Aún no tienes un inmueble asignado</h2>
                  <p style={{color: '#BFA58A', marginBottom: '30px'}}>Comunícate con la administración o explora el catálogo para aplicar a una propiedad.</p>
                  <button className="btn-explorar" onClick={() => navigate('/')}>Ver Catálogo</button>
                </div>
              ) : (
                /* ESTADÍSTICAS */
                <>
                  <div className="stats-grid">
                    <div className="stat-card modern-card">
                      <div className="stat-icon-wrapper">🏢</div>
                      <div className="stat-info">
                        <span className="stat-label">Inmueble Actual</span>
                        <h4 className="stat-value">{dashboardData?.contrato?.codigo || '---'}</h4>
                      </div>
                    </div>

                    <div className="stat-card modern-card">
                      <div className="stat-icon-wrapper">💵</div>
                      <div className="stat-info">
                        <span className="stat-label">{labelPago}</span>
                        <h4 className="stat-value">${dashboardData?.contrato?.monto_mensual || '0.00'}</h4>
                      </div>
                    </div>

                    <div className="stat-card modern-card">
                      <div className="stat-icon-wrapper">⏰</div>
                      <div className="stat-info">
                        <span className="stat-label">{labelPendientes}</span>
                        <h4 className="stat-value">{stats.cuotasPendientes || 0}</h4>
                      </div>
                    </div>
                  </div>

                  {esComprador && (
                    <div className="progress-section">
                      <h3>Gráfico de Progreso de Compra</h3>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${stats.porcentajeProgreso}%` }}></div>
                      </div>
                      <div className="progress-details">
                        <span>Capital Abonado: <strong>${stats.totalAbonado?.toFixed(2)}</strong></span>
                        <span>Saldo Restante: <strong>${stats.saldoPendiente?.toFixed(2)}</strong></span>
                        <span style={{color: '#C66A3D', fontWeight: 'bold'}}>{stats.porcentajeProgreso}% Completado</span>
                      </div>
                    </div>
                  )}

                  {/* 🔥 LÓGICA CORREGIDA PARA LAS ALERTAS DE PAGO */}
                  {dashboardData?.proximoPago && (
                    dashboardData.proximoPago.estado === 'pendiente' ? (
                      /* MENSAJE CUANDO YA PAGÓ Y ESTÁ EN REVISIÓN */
                      <div className="alert-section" style={{ backgroundColor: '#fff8e1', border: '1px solid #ffcc80', borderLeft: '5px solid #ffb300', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="alert-content">
                          <h3 style={{margin: '0 0 5px 0', color: '#f57c00'}}> Pago en Revisión</h3>
                          <p style={{margin: 0, color: '#4A3F35'}}>
                            Tu pago por <strong>${dashboardData.proximoPago.monto}</strong> correspondiente a <strong>{dashboardData.proximoPago.mes}</strong> está siendo revisado por la administración.
                          </p>
                        </div>
                        <div style={{ fontSize: '2.5rem', opacity: 0.8 }}> </div>
                      </div>
                    ) : (
                      /* MENSAJE ROJO CUANDO DEBE PAGAR (Atrasado, etc.) */
                      <div className="alert-section">
                        <div className="alert-content">
                          <h3 style={{margin: '0 0 5px 0', color: '#D9534F'}}>⚠️ Próximo Vencimiento</h3>
                          <p style={{margin: 0, color: '#4A3F35'}}>Tienes una cuota pendiente de <strong>${dashboardData.proximoPago.monto}</strong> correspondiente a <strong>{dashboardData.proximoPago.mes}</strong>.</p>
                        </div>
                        <button className="btn-pay-now" onClick={() => setShowRegistrarPago(true)}>Pagar Ahora</button>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'departamento' && <MiDepartamento />}
          {activeTab === 'contrato' && <MiContrato />}
          {activeTab === 'pagos' && <MisPagos onRecargar={cargarDashboard} />}
          {activeTab === 'perfil' && <MiPerfil />}
        </main>
      </div>
      
      {/* Botón flotante */}
      {tieneContrato && (
        <button className="btn-fab" onClick={() => setShowRegistrarPago(true)} title={`Registrar ${esComprador ? 'Cuota' : 'Pago'}`}>
          💰
        </button>
      )}

      {showRegistrarPago && (
        <RegistrarPago onClose={() => setShowRegistrarPago(false)} onPagoRegistrado={() => { cargarDashboard(); setShowRegistrarPago(false); }} />
      )}
    </div>
  );
}

export default InquilinoDashboard;