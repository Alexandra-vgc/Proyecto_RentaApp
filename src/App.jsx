import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from "react"; // ✅ Importamos useEffect

import WelcomeModal from "./components/WelcomeModal";
import Login from './components/login';
import Register from './components/Register';
import InquilinoDashboard from './components/inquilino/InquilinoDashboard'; 
import AdminDashboard from './components/admin/AdminDashboard'; 
import PublicHome from "./pages/PublicHome";
import PropertyDetail from "./pages/PropertyDetail";

import authService from './services/authService';

function App() {
  const [showWelcome, setShowWelcome] = useState(false);
  
  // ✅ NUEVO: Creamos un estado para saber si el usuario está autenticado
  const [isAuth, setIsAuth] = useState(authService.isAuthenticated());

  // ✅ NUEVO: Usamos useEffect para escuchar el "timbre"
  useEffect(() => {
    // Esta función se ejecuta cuando suena el timbre
    const handleAuthChange = () => {
      setIsAuth(authService.isAuthenticated()); // Actualizamos el estado
    };

    // Ponemos la "oreja" para escuchar el evento
    window.addEventListener('authStateChange', handleAuthChange);

    // Limpiamos la "oreja" si el componente se destruye (buena práctica)
    return () => {
      window.removeEventListener('authStateChange', handleAuthChange);
    };
  }, []);


  // 🛡️ Guardias de Seguridad (Sin cambios)
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
      {/* ✅ CAMBIO CLAVE: Usamos el estado 'isAuth' que ahora sí se actualiza */}
      {!isAuth && (
        <div style={{ borderBottom: "1px solid #ddd", padding: "10px 20px", display: "flex", justifyContent: "space-between", backgroundColor: "#fff" }}>
          <Link to="/" style={{ textDecoration: "none", color: "inherit", fontSize: "1.2rem" }}>
            <strong>MiRentaAPP</strong>
          </Link>
          <div>
            <Link to="/login" style={{ marginRight: "15px", textDecoration: "none", color: "#764ba2" }}>Iniciar sesión</Link>
            <Link to="/register" style={{ textDecoration: "none", color: "#764ba2" }}>Registrarse</Link>
          </div>
        </div>
      )}

      {showWelcome && !isAuth && (
        <WelcomeModal onFinish={() => setShowWelcome(false)} />
      )}

      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/propiedad/:id" element={<PropertyDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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