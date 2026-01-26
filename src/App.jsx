import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from "react";
import WelcomeModal from "./components/WelcomeModal";
import Login from './components/login';
import Register from './components/Register';
import authService from './services/authservice';

function App() {
  const [showWelcome, setShowWelcome] = useState(!authService.isAuthenticated());

  return (
    <Router>
      {showWelcome && !authService.isAuthenticated() && (
        <WelcomeModal onFinish={() => setShowWelcome(false)} />
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;