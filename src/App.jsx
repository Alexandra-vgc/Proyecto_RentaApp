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

  // 🛡️ Guardias de Seguridad
  const ClienteRoute = ({ children }) => {
    const user = authService.getCurrentUser();
    if (!user) return <Navigate to="/login" />;
    if (user.rol === 'admin' || user.rol === 'propietario') return <Navigate to="/admin" />;
    return children; 
  };

  const AdminRoute = ({ children }) => {
    const user = authService.getCurrentUser();
    if (!user) return <Navigate to="/login" />;
    if (user.rol !== 'admin' && user.rol !== 'propietario') return <Navigate to="/dashboard" />;
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
            {/* ✅ Cambié el morado antiguo por el Terracota para que combine */}
            <Link to="/login" style={{ marginRight: "15px", textDecoration: "none", color: "#C66A3D", fontWeight: "bold" }}>Iniciar sesión</Link>
            <Link to="/register" style={{ textDecoration: "none", color: "#C66A3D", fontWeight: "bold" }}>Registrarse</Link>
          </div>
        </div>
      )}

      {/* Se mostrará siempre que showWelcome sea true e isAuth sea false */}
      {showWelcome && !isAuth && (
        <WelcomeModal onFinish={() => setShowWelcome(false)} />
      )}

      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/propiedad/:id" element={<PropertyDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/terminos" element={<Terminos />} />

        <Route 
          path="/dashboard" 
          element={
            <ClienteRoute>
              <InquilinoDashboard />
            </ClienteRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;