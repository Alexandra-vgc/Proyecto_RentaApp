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
        <p>Cargando tu información...</p>
      </div>
    );
  }

  const esComprador = tipoUsuario === 'comprador';
  const labelPago = esComprador ? 'Cuota Mensual' : 'Renta Mensual';
  const labelPendientes = esComprador ? 'Cuotas Pendientes' : 'Pagos Pendientes';

  const stats = dashboardData?.estadisticas || {};

  return (
    <div className="inquilino-dashboard">
      {/* NAVBAR */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          {/* ✅ Título interactivo para volver al inicio */}
          <h2 
            onClick={() => navigate('/')} 
            style={{ cursor: 'pointer' }}
            title="Volver al inicio"
          >
            🏠 MiRentaApp
          </h2>
          <span className="user-badge">{esComprador ? 'Comprador' : 'Inquilino'}</span>
        </div>
        <div className="nav-user">
          <span>Hola, {user?.nombre}</span>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* LAYOUT */}
      <div className="dashboard-layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <button 
            className={`sidebar-item ${activeTab === 'inicio' ? 'active' : ''}`}
            onClick={() => setActiveTab('inicio')}
          >
            <span className="icon">📊</span>
            Inicio
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'departamento' ? 'active' : ''}`}
            onClick={() => setActiveTab('departamento')}
          >
            <span className="icon">🏢</span>
            Mi Departamento
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'contrato' ? 'active' : ''}`}
            onClick={() => setActiveTab('contrato')}
          >
            <span className="icon">📄</span>
            Mi Contrato
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'pagos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pagos')}
          >
            <span className="icon">💰</span>
            Mis {esComprador ? 'Cuotas' : 'Pagos'}
            {stats.cuotasPendientes > 0 && (
              <span className="badge-count">{stats.cuotasPendientes}</span>
            )}
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveTab('perfil')}
          >
            <span className="icon">👤</span>
            Mi Perfil
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="dashboard-content">
          {activeTab === 'inicio' && (
            <>
              <h1 className="page-title">Mi Dashboard</h1>
              
              {/* ESTADÍSTICAS */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🏢</div>
                  <div className="stat-info">
                    <h3>Mi Departamento</h3>
                    <p className="stat-number">
                      {dashboardData?.contrato?.codigo || 'Sin asignar'}
                    </p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">💵</div>
                  <div className="stat-info">
                    <h3>{labelPago}</h3>
                    <p className="stat-number">
                      ${dashboardData?.contrato?.monto_mensual || '0.00'}
                    </p>
                  </div>
                </div>

                {esComprador && (
                  <>
                    <div className="stat-card">
                      <div className="stat-icon">💰</div>
                      <div className="stat-info">
                        <h3>Total Abonado</h3>
                        <p className="stat-number">
                          ${stats.totalAbonado?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">📊</div>
                      <div className="stat-info">
                        <h3>Saldo Pendiente</h3>
                        <p className="stat-number">
                          ${stats.saldoPendiente?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <div className="stat-card">
                  <div className="stat-icon">⏰</div>
                  <div className="stat-info">
                    <h3>{labelPendientes}</h3>
                    <p className="stat-number">{stats.cuotasPendientes || 0}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-info">
                    <h3>Progreso</h3>
                    <p className="stat-number">
                      {esComprador ? `${stats.porcentajeProgreso}%` : 'Activo'}
                    </p>
                  </div>
                </div>
              </div>

              {/* BARRA DE PROGRESO SOLO PARA COMPRADORES */}
              {esComprador && (
                <div className="info-section">
                  <h2>Progreso de la Compra</h2>
                  <div className="progress-container" style={{ background: '#e0e0e0', borderRadius: '10px', height: '20px', width: '100%', marginTop: '10px' }}>
                    <div className="progress-bar" style={{ 
                      width: `${stats.porcentajeProgreso}%`, 
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      height: '100%',
                      borderRadius: '10px',
                      transition: 'width 0.5s ease-in-out'
                    }}></div>
                  </div>
                  <p style={{ textAlign: 'right', fontSize: '0.9rem', marginTop: '5px' }}>
                    {stats.porcentajeProgreso}% pagado de ${stats.precioTotal}
                  </p>
                </div>
              )}

              {/* ÚLTIMO PAGO */}
              {dashboardData?.proximoPago && (
                <div className="info-section">
                  <h2 style={{ color: '#e74c3c' }}>⚠️ Próxima Cuota Pendiente</h2>
                  <div className="info-card" style={{ borderLeft: '5px solid #e74c3c' }}>
                    <div className="info-row">
                      <span className="label">Mes correspondiente:</span>
                      <span className="value">{dashboardData.proximoPago.mes}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Monto a pagar:</span>
                      <span className="value price">${dashboardData.proximoPago.monto}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Fecha límite:</span>
                      <span className="value">
                        {new Date(dashboardData.proximoPago.fecha_vencimiento).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'departamento' && <MiDepartamento />}
          {activeTab === 'contrato' && <MiContrato />}
          {activeTab === 'pagos' && <MisPagos onRecargar={cargarDashboard} />}
          {activeTab === 'perfil' && <MiPerfil />}
        </main>
      </div>

      <button 
        className="btn-fab"
        onClick={() => setShowRegistrarPago(true)}
        title={`Registrar ${esComprador ? 'Cuota' : 'Pago'}`}
      >
        💰
      </button>

      {showRegistrarPago && (
        <RegistrarPago 
          onClose={() => setShowRegistrarPago(false)}
          onPagoRegistrado={() => {
            cargarDashboard();
            setShowRegistrarPago(false);
          }}
        />
      )}
    </div>
  );
}

export default InquilinoDashboard;