import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from "react"; 

import WelcomeModal from "./components/WelcomeModal";
import Login from './components/login';
import Register from './components/Register';
import Terminos from './pages/Terminos';
import InquilinoDashboard from './components/inquilino/InquilinoDashboard'; 
import AdminDashboard from './components/admin/AdminDashboard'; 
import PublicHome from "./pages/PublicHome";
import PropertyDetail from "./pages/PropertyDetail";

import authService from './services/authService';

function App() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isAuth, setIsAuth] = useState(authService.isAuthenticated());

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuth(authService.isAuthenticated()); 
    };

    window.addEventListener('authStateChange', handleAuthChange);
    return () => {
      window.removeEventListener('authStateChange', handleAuthChange);
    };
  }, []);

  // 🛡️ GUARDIA 1: Solo Inquilinos y Compradores (TU DASHBOARD)
  const ClienteRoute = ({ children }) => {
    const user = authService.getCurrentUser();
    if (!user) return <Navigate to="/login" replace />;
    
    // Si es admin o propietario, patada hacia el admin dashboard
    if (user.rol === 'admin' || user.rol === 'propietario') {
      return <Navigate to="/admin" replace />;
    }
    return children; 
  };

  // 🛡️ GUARDIA 2: Solo Admin y Propietarios (EL DASHBOARD DE TU COMPAÑERA)
  const AdminRoute = ({ children }) => {
    const user = authService.getCurrentUser();
    if (!user) return <Navigate to="/login" replace />;
    
    // Si NO es admin ni propietario, patada hacia el dashboard de clientes
    if (user.rol !== 'admin' && user.rol !== 'propietario') {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <Router>
      {!isAuth && (
        <div style={{ borderBottom: "1px solid #ddd", padding: "10px 20px", display: "flex", justifyContent: "space-between", backgroundColor: "#fff" }}>
          <Link to="/" style={{ textDecoration: "none", color: "inherit", fontSize: "1.2rem" }}>
            <strong>MiRentaAPP</strong>
          </Link>
          <div>
            <Link to="/login" style={{ marginRight: "15px", textDecoration: "none", color: "#C66A3D", fontWeight: "bold" }}>Iniciar sesión</Link>
            <Link to="/register" style={{ textDecoration: "none", color: "#C66A3D", fontWeight: "bold" }}>Registrarse</Link>
          </div>
        </div>
      )}

      {showWelcome && !isAuth && (
        <WelcomeModal onFinish={() => setShowWelcome(false)} />
      )}

      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<PublicHome />} />
        <Route path="/propiedad/:id" element={<PropertyDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terminos" element={<Terminos />} />

        {/* 🚦 TU ZONA PRIVADA (Inquilinos/Compradores) */}
        <Route 
          path="/dashboard" 
          element={
            <ClienteRoute>
              <InquilinoDashboard />
            </ClienteRoute>
          } 
        />

        {/* 🚦 ZONA PRIVADA DE TU COMPAÑERA (Admins/Propietarios) */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />

        {/* Si escriben cualquier otra ruta que no exista, los manda al inicio */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;