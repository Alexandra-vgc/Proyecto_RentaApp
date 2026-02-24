import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from "react";
import WelcomeModal from "./components/WelcomeModal";
import Login from './components/Login';
import Register from './components/Register';
import InquilinoDashboard from './components/inquilino/InquilinoDashboard';
import authService from './services/authService';

function App() {
  const [showWelcome, setShowWelcome] = useState(!authService.isAuthenticated());

  return (
    <Router>
      {showWelcome && !authService.isAuthenticated() && (
        <WelcomeModal onFinish={() => setShowWelcome(false)} />
      )}

      <Routes>
        <Route 
          path="/" 
          element={
            authService.isAuthenticated() 
              ? <Navigate to="/dashboard" /> 
              : <Navigate to="/login" />
          } 
        />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/dashboard" 
          element={
            authService.isAuthenticated()
              ? <InquilinoDashboard />
              : <Navigate to="/login" />
          } 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;