import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import './Login.css';
import loginImg from '../assets/login.png'; 

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(formData.email, formData.password);
      
      const user = authService.getCurrentUser();
      
      // ✅ DECISIÓN DE RUTA CORREGIDA
      if (user.rol === 'admin' || user.rol === 'propietario') {
        navigate('/admin'); // Panel de tu compañera
      } else {
        navigate('/dashboard'); // Panel tuyo (para Inquilinos y Compradores)
      }
      
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-illustration">
          <img src={loginImg} alt="Login" />
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <div className="login-header">
            <h1>Bienvenido a RentApp 👋</h1>
            <p>Inicia sesión para gestionar tus arriendos</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <span>⚠️ {error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="correo@ejemplo.com" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input type="password" id="password" name="password" placeholder="Ej: Rentapp2024!" value={formData.password} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>

            <div className="register-link">
              ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;