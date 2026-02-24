import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from "react";

// Componentes
import WelcomeModal from "./components/WelcomeModal";
import Navbar from "./components/Navbar"; 
import Login from './components/login';
import Register from './components/Register';

// Páginas
import PublicHome from "./pages/PublicHome";
import PropertyDetail from "./pages/PropertyDetail";
import AdminDashboard from "./components/admin/AdminDashboard"; 

// Servicios
import authService from './services/authservice';

function App() {
  // Quitamos la lógica automática del modal por ahora para que no estorbe
  const [showWelcome, setShowWelcome] = useState(false); 

  // Función de protección mejorada
const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // Permitir acceso si el rol es admin O propietario
  if (token && (user?.rol === 'admin' || user?.rol === 'propietario')) {
    return children;
  }
  
  return <Navigate to="/login" />;
};

  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<PublicHome />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Ruta del Administrador */}
        <Route 
          path="/admin-dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App; // <--- ESTO ES VITAL