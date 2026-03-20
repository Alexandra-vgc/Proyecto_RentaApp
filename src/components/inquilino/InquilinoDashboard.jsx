import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import axios from 'axios';
import MiDepartamento from './MiDepartamento';
import MiContrato from './MiContrato';
import MisPagos from './MisPagos';
import MiPerfil from './MiPerfil';
import RegistrarPago from './RegistrarPago';
import Mantenimiento from './Mantenimiento'; 
import './InquilinoDashboard.css';

// ✅ ICONOS DE MATERIAL UI AGREGADOS
import DashboardIcon from '@mui/icons-material/Dashboard';
import ApartmentIcon from '@mui/icons-material/Apartment';
import DescriptionIcon from '@mui/icons-material/Description';
import BuildIcon from '@mui/icons-material/Build';
import PaymentsIcon from '@mui/icons-material/Payments';
import SettingsIcon from '@mui/icons-material/Settings';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

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

  const primerNombre = user?.nombre?.split(' ')[0] || 'Usuario';
  const fontGlobal = "'Inter', 'Segoe UI', 'Roboto', sans-serif";

  return (
    <div className="inquilino-dashboard" style={{ fontFamily: fontGlobal }}>
      {/* NAVBAR ORIGINAL */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2 onClick={() => navigate('/')} style={{ cursor: 'pointer', fontFamily: fontGlobal, fontWeight: 800 }} title="Volver al inicio">
            RentaApp
          </h2>
        </div>
        <div className="nav-user">
          <button onClick={handleLogout} className="btn-logout" style={{ fontFamily: fontGlobal }}>Cerrar Sesión</button>
        </div>
      </nav>

      {/* LAYOUT ORIGINAL */}
      <div className="dashboard-layout">
        
        {/* SIDEBAR ORIGINAL CON ICONOS MUI */}
        <aside className="sidebar">
          <div className="sidebar-profile">
            <div className="profile-avatar">
              {primerNombre.charAt(0).toUpperCase()}
            </div>
            <h3 className="profile-name" style={{ fontFamily: fontGlobal, fontWeight: 700 }}>{primerNombre}</h3>
            <p className="profile-role" style={{ fontFamily: fontGlobal }}>{esComprador ? 'Compradora' : 'Inquilina'}</p>
          </div>

          <button className={`sidebar-item ${activeTab === 'inicio' ? 'active' : ''}`} onClick={() => setActiveTab('inicio')}>
            <DashboardIcon className="icon" /> Panel Principal
          </button>
          <button className={`sidebar-item ${activeTab === 'departamento' ? 'active' : ''}`} onClick={() => setActiveTab('departamento')}>
            <ApartmentIcon className="icon" /> Mi Propiedad
          </button>
          <button className={`sidebar-item ${activeTab === 'contrato' ? 'active' : ''}`} onClick={() => setActiveTab('contrato')}>
            <DescriptionIcon className="icon" /> Gestión Contrato
          </button>
          
          {/* ✅ MURO DE CONTENCIÓN: Solo el inquilino ve Mantenimiento */}
          {!esComprador && (
            <button className={`sidebar-item ${activeTab === 'mantenimiento' ? 'active' : ''}`} onClick={() => setActiveTab('mantenimiento')}>
              <BuildIcon className="icon" /> Mantenimiento
            </button>
          )}

          <button className={`sidebar-item ${activeTab === 'pagos' ? 'active' : ''}`} onClick={() => setActiveTab('pagos')}>
            <PaymentsIcon className="icon" /> Historial de Pagos
            {stats.cuotasPendientes > 0 && <span className="badge-count" style={{marginLeft: 'auto', background: '#C66A3D', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem'}}>{stats.cuotasPendientes}</span>}
          </button>
          <button className={`sidebar-item ${activeTab === 'perfil' ? 'active' : ''}`} onClick={() => setActiveTab('perfil')}>
            <SettingsIcon className="icon" /> Configuración
          </button>
        </aside>

        {/* MAIN CONTENT ORIGINAL */}
        <main className="dashboard-content">
          {activeTab === 'inicio' && (
            <div className="inicio-tab-animado">
              
              <div className="welcome-banner" style={{ marginBottom: '30px' }}>
                <h1 style={{ fontFamily: fontGlobal, fontSize: '2.2rem', color: '#4E5B3C', margin: '0 0 10px 0', fontWeight: 800 }}>¡Bienvenida, {primerNombre}! </h1>
                <p style={{ fontFamily: fontGlobal, fontSize: '1.1rem', color: '#666', margin: 0 }}>Aquí tienes la visión general de tu estado y propiedades asignadas.</p>
              </div>

              {!tieneContrato ? (
                <div className="empty-state-container" style={{textAlign: 'center', padding: '50px', backgroundColor: '#F5EFE6', borderRadius: '12px', border: '1px dashed #BFA58A'}}>
                  <div className="empty-state-icon" style={{fontSize: '4rem', marginBottom: '20px'}}>🏡</div>
                  <h2 style={{color: '#4A3F35', fontFamily: fontGlobal, fontWeight: 'bold'}}>Aún no tienes un inmueble asignado</h2>
                  <p style={{color: '#BFA58A', marginBottom: '30px', fontFamily: fontGlobal}}>Comunícate con la administración o explora el catálogo para aplicar a una propiedad.</p>
                  <button className="btn-explorar" onClick={() => navigate('/')} style={{ fontFamily: fontGlobal }}>Ver Catálogo</button>
                </div>
              ) : (
                <>
                  {/* ✅ TARJETAS CON TEXTOS OSCURECIDOS PARA MAYOR NITIDEZ */}
                  <div className="stats-grid">
                    <div className="stat-card modern-card">
                      <div className="stat-icon-wrapper" style={{color: '#4E5B3C', backgroundColor: '#F5EFE6'}}><ApartmentIcon fontSize="large" /></div>
                      <div className="stat-info">
                        <span className="stat-label" style={{ fontFamily: fontGlobal, color: '#555', fontWeight: 'bold', letterSpacing: '0.5px' }}>Inmueble Actual</span>
                        <h4 className="stat-value" style={{ fontFamily: fontGlobal, fontWeight: 800 }}>{dashboardData?.contrato?.codigo || '---'}</h4>
                      </div>
                    </div>

                    <div className="stat-card modern-card">
                      <div className="stat-icon-wrapper" style={{color: '#2e7d32', backgroundColor: '#e8f5e9'}}><AttachMoneyIcon fontSize="large" /></div>
                      <div className="stat-info">
                        <span className="stat-label" style={{ fontFamily: fontGlobal, color: '#555', fontWeight: 'bold', letterSpacing: '0.5px' }}>{labelPago}</span>
                        <h4 className="stat-value" style={{ fontFamily: fontGlobal, fontWeight: 800 }}>${dashboardData?.contrato?.monto_mensual || '0.00'}</h4>
                      </div>
                    </div>

                    <div className="stat-card modern-card">
                      <div className="stat-icon-wrapper" style={{color: stats.cuotasPendientes > 0 ? '#d32f2f' : '#1976d2', backgroundColor: stats.cuotasPendientes > 0 ? '#ffebee' : '#e3f2fd'}}><AccessTimeIcon fontSize="large" /></div>
                      <div className="stat-info">
                        <span className="stat-label" style={{ fontFamily: fontGlobal, color: '#555', fontWeight: 'bold', letterSpacing: '0.5px' }}>{labelPendientes}</span>
                        <h4 className="stat-value" style={{ fontFamily: fontGlobal, fontWeight: 800 }}>{stats.cuotasPendientes || 0}</h4>
                      </div>
                    </div>
                  </div>

                  {esComprador && (
                    <div className="progress-section" style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                      <h3 style={{ fontFamily: fontGlobal, fontWeight: 'bold', color: '#4E5B3C', marginTop: 0 }}>Progreso de Compra Inmobiliaria</h3>
                      <div className="progress-bar-bg" style={{ backgroundColor: '#F5EFE6', height: '20px', borderRadius: '10px', overflow: 'hidden', margin: '15px 0' }}>
                        <div className="progress-bar-fill" style={{ width: `${stats.porcentajeProgreso}%`, backgroundColor: '#C66A3D', height: '100%', transition: 'width 1s ease-in-out' }}></div>
                      </div>
                      <div className="progress-details" style={{ fontFamily: fontGlobal, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <span style={{color: '#666'}}>Total Propiedad: <strong style={{color: '#444'}}>${stats.precioTotal?.toFixed(2) || '0.00'}</strong></span>
                        <span style={{color: '#666'}}>Capital Abonado: <strong style={{color: '#2e7d32'}}>${stats.totalAbonado?.toFixed(2)}</strong></span>
                        <span style={{color: '#666'}}>Saldo Restante: <strong style={{color: '#d32f2f'}}>${stats.saldoPendiente?.toFixed(2)}</strong></span>
                        <span style={{color: '#C66A3D', fontWeight: 'bold', backgroundColor: '#F5EFE6', padding: '2px 10px', borderRadius: '15px'}}>{stats.porcentajeProgreso}% Completado</span>
                      </div>
                    </div>
                  )}

                  {/* LÓGICA DE ALERTAS */}
                  {dashboardData?.proximoPago ? (
                    dashboardData.proximoPago.estado === 'pendiente' ? (
                      <div className="alert-section" style={{ backgroundColor: '#fffde7', border: '1px solid #fff59d', borderLeft: '6px solid #fbc02d', padding: '20px', borderRadius: '8px' }}>
                        <div className="alert-content">
                          <h3 style={{margin: '0 0 5px 0', color: '#f57f17', fontFamily: fontGlobal, fontWeight: 'bold'}}>⏳ Pago en Revisión</h3>
                          <p style={{margin: 0, color: '#555', fontFamily: fontGlobal}}>Tu pago por <strong>${dashboardData.proximoPago.monto}</strong> correspondiente a <strong>{dashboardData.proximoPago.mes}</strong> está siendo revisado.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="alert-section" style={{ backgroundColor: '#ffebee', border: '1px solid #ffcdd2', borderLeft: '6px solid #d32f2f', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="alert-content" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <WarningAmberIcon style={{ color: '#c62828', fontSize: '2.5rem' }} />
                          <div>
                            <h3 style={{margin: '0 0 5px 0', color: '#c62828', fontFamily: fontGlobal, fontWeight: 'bold'}}>Próximo Vencimiento</h3>
                            <p style={{margin: 0, color: '#555', fontFamily: fontGlobal}}>Tienes una cuota pendiente de <strong>${dashboardData.proximoPago.monto}</strong> correspondiente a <strong>{dashboardData.proximoPago.mes}</strong>.</p>
                          </div>
                        </div>
                        <button className="btn-pay-now" onClick={() => setShowRegistrarPago(true)} style={{backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'}}>Pagar Ahora</button>
                      </div>
                    )
                  ) : (
                    <div className="alert-section" style={{ backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9', borderLeft: '6px solid #2e7d32', padding: '20px', borderRadius: '8px' }}>
                        <div className="alert-content">
                          <h3 style={{margin: '0 0 5px 0', color: '#2e7d32', fontFamily: fontGlobal, fontWeight: 'bold'}}>✅ ¡Estás al día!</h3>
                          <p style={{margin: 0, color: '#555', fontFamily: fontGlobal}}>No tienes pagos pendientes en este momento. Gracias por tu puntualidad.</p>
                        </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'departamento' && <MiDepartamento />}
          {activeTab === 'contrato' && <MiContrato />}
          
          {/* MURO DE CONTENCIÓN: Solo renderiza mantenimiento si NO es comprador */}
          {!esComprador && activeTab === 'mantenimiento' && <Mantenimiento />}
          
          {activeTab === 'pagos' && <MisPagos onRecargar={cargarDashboard} />}
          {activeTab === 'perfil' && <MiPerfil />}
        </main>
      </div>
      
      {/* SE QUITA EL BOTÓN SI ESTAMOS EN LA PESTAÑA 'PAGOS' PARA EVITAR QUE SE DUPLIQUE */}
      {tieneContrato && activeTab !== 'pagos' && (
        <div style={{ position: 'fixed', bottom: '40px', right: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 100 }}>
          <button 
            onClick={() => setShowRegistrarPago(true)}
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
            title={`Registrar ${esComprador ? 'Cuota' : 'Pago'}`}
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
      )}

      {showRegistrarPago && (
        <RegistrarPago onClose={() => setShowRegistrarPago(false)} onPagoRegistrado={() => { cargarDashboard(); setShowRegistrarPago(false); }} />
      )}
    </div>
  );
}

export default InquilinoDashboard;