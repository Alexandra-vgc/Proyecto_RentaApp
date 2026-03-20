import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from "react"; 

import WelcomeModal from "./components/WelcomeModal";
import Login from './components/login';
import Register from './components/Register';
import Terminos from './pages/Terminos';
import InquilinoDashboard from './components/inquilino/InquilinoDashboard'; 
import AdminDashboard from './components/admin/AdminDashboard'; 
import PublicHome from "./pages/PublicHome";
import PropertyDetail from "./pages/PropertyDetail";
import VisitanteDashboard from './pages/VisitanteDashboard';
import SectorResults from "./pages/SectorResults";

import authService from './services/authService';

// ✅ COMPONENTE QUE MANEJA LA BARRA SUPERIOR INTELIGENTE
const NavigationWrapper = ({ children }) => {
  const location = useLocation();
  const isAuth = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  
  // Ocultamos la barra SOLO si el usuario está dentro de su panel privado
  const isDashboard = location.pathname.includes('/dashboard') || location.pathname.includes('/admin') || location.pathname.includes('/visitante');

  return (
    <>
      {!isDashboard && (
        <div style={{ borderBottom: "1px solid rgba(191, 165, 138, 0.3)", padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F5EFE6" }}>
          <Link to="/" style={{ textDecoration: "none", color: "#4E5B3C", fontSize: "1.5rem", fontWeight: 900, fontFamily: 'serif' }}>
            MiRentaAPP
          </Link>
          <div>
            {!isAuth ? (
              <>
                <Link to="/login" style={{ marginRight: "20px", textDecoration: "none", color: "#C66A3D", fontWeight: "bold" }}>Iniciar sesión</Link>
                <Link to="/register" style={{ textDecoration: "none", color: "white", backgroundColor: "#C66A3D", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold" }}>Registrarse</Link>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ color: '#4E5B3C', fontWeight: 'bold' }}>Hola, {user?.nombre?.split(' ')[0]}</span>
                
                {/* BOTÓN INTELIGENTE QUE TE LLEVA A TU PANEL O FAVORITOS */}
                <Link to={user?.rol === 'admin' || user?.rol === 'propietario' ? "/admin" : user?.rol === 'visitante' ? "/visitante" : "/dashboard"} 
                      style={{ textDecoration: "none", color: "white", backgroundColor: "#C66A3D", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", boxShadow: "0 4px 10px rgba(198, 106, 61, 0.3)" }}>
                  {user?.rol === 'visitante' ? "❤️ Mis Favoritos" : "Ir a mi Panel"}
                </Link>

                <button onClick={() => { authService.logout(); window.location.href='/'; }} style={{ background: 'none', border: 'none', color: '#666', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}>Cerrar Sesión</button>
              </div>
            )}
          </div>
        </div>
      )}
      {children}
    </>
  );
};

function App() {
  const [showWelcome, setShowWelcome] = useState(false);

  // Guardias de Rutas
  const ClienteRoute = ({ children }) => {
    const user = authService.getCurrentUser();
    if (!user) return <Navigate to="/login" replace />;
    if (user.rol === 'admin' || user.rol === 'propietario') return <Navigate to="/admin" replace />;
    if (user.rol === 'visitante') return <Navigate to="/visitante" replace />; 
    return children; 
  };

  const AdminRoute = ({ children }) => {
    const user = authService.getCurrentUser();
    if (!user) return <Navigate to="/login" replace />;
    if (user.rol !== 'admin' && user.rol !== 'propietario') return <Navigate to="/dashboard" replace />;
    return children;
  };

  const VisitanteRoute = ({ children }) => {
    const user = authService.getCurrentUser();
    if (!user) return <Navigate to="/login" replace />;
    if (user.rol !== 'visitante') return <Navigate to="/dashboard" replace />;
    return children;
  };

  return (
    <Router>
      <NavigationWrapper>
        {showWelcome && !authService.isAuthenticated() && (
          <WelcomeModal onFinish={() => setShowWelcome(false)} />
        )}

        <Routes>
          <Route path="/" element={<PublicHome />} />
          <Route path="/propiedad/:id" element={<PropertyDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terminos" element={<Terminos />} />

          <Route path="/dashboard" element={<ClienteRoute><InquilinoDashboard /></ClienteRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/visitante" element={<VisitanteRoute><VisitanteDashboard /></VisitanteRoute>} />
          <Route path="/sector/:nombreSector" element={<SectorResults />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </NavigationWrapper>
    </Router>
  );
}

export default App;