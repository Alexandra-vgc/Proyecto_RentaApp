import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState } from "react";

import WelcomeModal from "./components/WelcomeModal";
import Login from './components/login';
import Register from './components/Register';

import PublicHome from "./pages/PublicHome";
import PropertyDetail from "./pages/PropertyDetail";

import authService from './services/authservice';

function App() {
  const [showWelcome, setShowWelcome] = useState(!authService.isAuthenticated());

  return (
    <Router>

      {/* BARRA SUPERIOR SIMPLE */}
      {!authService.isAuthenticated() && (
        <div style={{
          borderBottom: "1px solid #ddd",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between"
        }}>
          <strong>MiRentaAPP</strong>

          <div>
            <Link to="/login" style={{ marginRight: "15px" }}>
              Iniciar sesión
            </Link>
            <Link to="/register">
              Registrarse
            </Link>
          </div>
        </div>
      )}

      {/* MODAL DE BIENVENIDA */}
      {showWelcome && !authService.isAuthenticated() && (
        <WelcomeModal onFinish={() => setShowWelcome(false)} />
      )}

      <Routes>

        {/* 🌍 PÚBLICO */}
        <Route path="/" element={<PublicHome />} />
        <Route path="/property/:id" element={<PropertyDetail />} />

        {/* 🔐 AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ❌ CUALQUIER OTRA */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;
