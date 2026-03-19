import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import bgImage from '../assets/registro.png'; /* La imagen que guardaste */
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    // ✅ ROL FIJO: Todos los que se registran aquí son visitantes buscando casas
    rol: 'visitante' 
  });
  
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validarPassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (!validarPassword(formData.password)) {
      setError('La contraseña debe tener mínimo 8 caracteres, incluir letras, números y un carácter especial (@$!%*#?&.)');
      setLoading(false);
      return;
    }

    if (!aceptaTerminos) {
      setError('Debes aceptar los Términos y Condiciones para registrarte.');
      setLoading(false);
      return;
    }

    try {
      await authService.register(
        formData.nombre,
        formData.email,
        formData.password,
        formData.rol // Enviamos 'visitante' por debajo de la mesa
      );
      alert('✅ ¡Cuenta creada! Ahora puedes guardar tus propiedades favoritas.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      
      {/* MITAD IZQUIERDA: TU IMAGEN */}
      <div 
        className="register-left" 
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* MITAD DERECHA: TU FORMULARIO ALINEADO */}
      <div className="register-right">
        <div className="register-box">
          
          <h2>Crear Cuenta</h2>
          <p className="subtitle">Completa el formulario para empezar a guardar tus propiedades favoritas.</p>

          <form onSubmit={handleSubmit}>
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
                placeholder="Ej: Camila Machado"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
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
                placeholder="Ej: Rentapp2026!"
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

            {/* ✅ EL SELECT DE TIPO DE USUARIO FUE ELIMINADO */}

            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '10px', marginBottom: '20px' }}>
              <input 
                type="checkbox" 
                id="terminos" 
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', margin: 0 }}
                required
              />
              <label htmlFor="terminos" style={{ fontSize: '0.9rem', color: '#555', cursor: 'pointer', margin: 0 }}>
                He leído y acepto los{' '}
                <Link to="/terminos" target="_blank" style={{ color: '#C66A3D', textDecoration: 'underline' }}>
                  Términos y Condiciones
                </Link>
              </label>
            </div>

            <button 
              type="submit" 
              className="btn-register"
              disabled={loading || !aceptaTerminos}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
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