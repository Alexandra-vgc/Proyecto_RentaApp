import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import './Login.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'inquilino'
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

  // ✅ Función de seguridad: Validar contraseña fuerte
  const validarPassword = (password) => {
    // Mínimo 8 caracteres, al menos 1 letra, 1 número y 1 carácter especial
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Validar coincidencia
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    // 2. Validar seguridad
    if (!validarPassword(formData.password)) {
      setError('La contraseña debe tener mínimo 8 caracteres, incluir letras, números y un carácter especial (@$!%*#?&.)');
      setLoading(false);
      return;
    }

    try {
      await authService.register(
        formData.nombre,
        formData.email,
        formData.password,
        formData.rol
      );
      alert('✅ Registro exitoso!');
      // Te lleva al login para que inicies sesión y de ahí te redirija al dashboard correcto
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-illustration">
          <img 
            src="https://demos.pixinvent.com/vuexy-nextjs-admin-template/demo-4/images/illustrations/auth/v2-register-dark.png" 
            alt="Register" 
          />
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <div className="login-header">
            <h1>Crear Cuenta </h1>
            <p>Completa el formulario para registrarte</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <span>⚠️ {error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Juan Pérez"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Ej: Rentapp2024!"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <small style={{ color: '#888', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                Mín. 8 caracteres, números y un símbolo.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="rol">Tipo de Usuario</label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  background: '#f8f9fa',
                  cursor: 'pointer'
                }}
              >
                <option value="inquilino">Inquilino</option>
                <option value="comprador">Comprador</option> {/* ✅ NUEVO ROL */}
                <option value="propietario">Propietario</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn-login"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>

            <div className="register-link">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login">Inicia sesión aquí</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;