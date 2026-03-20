import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import bgImage from '../assets/imglogin.png'; /* ✅ Asegúrate de tener este archivo */
import './Login.css';

function Login() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [vistaActual, setVistaActual] = useState('login'); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authService.login(email, password);
      
      // Obtenemos el usuario con su rol real desde el servicio
      const user = authService.getCurrentUser(); 

      // --- 🚩 LÓGICA DE REDIRECCIÓN CORREGIDA ---
      if (user.rol === 'admin' || user.rol === 'propietario') {
        navigate('/admin');
      } else {
        // Todos los clientes usan la ruta /dashboard y el componente asigna su vista según rol
        navigate('/dashboard');
      }
      
      // ✅ Recargamos para forzar actualización global de estado (opcional)
      window.location.reload(); 

    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handlePedirCodigo = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      await authService.solicitarCodigo(email);
      setSuccessMsg(`Enviamos un código a ${email}`);
      setVistaActual('ingresar-codigo');
    } catch (err) {
      setError(err.message || 'Error al enviar correo');
    } finally {
      setLoading(false);
    }
  };

  const handleValidarCodigo = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      await authService.validarCodigo(email, codigo);
      setSuccessMsg('¡Código correcto! Crea tu nueva clave.');
      setVistaActual('nueva-clave');
    } catch (err) {
      setError(err.message || 'Código incorrecto');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarClave = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      await authService.cambiarPassword(email, nuevaPassword);
      setSuccessMsg('¡Contraseña actualizada! Inicia sesión.');
      setVistaActual('login');
      setPassword(''); 
    } catch (err) {
      setError(err.message || 'Error al guardar clave');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* ✅ Forzamos la imagen de fondo desde el JSX para evitar que no cargue */
    <div className="login-container" style={{ backgroundImage: `url(${bgImage})` }}>
      
      {/* -----------------------------------------------------------
         LADO IZQUIERDO: TEXTO DE BIENVENIDA (Limpieza total)
      ----------------------------------------------------------- */}
      <div className="login-welcome-text">
        <h1>¡Bienvenido!</h1> {/* ✅ TÍTULO CORREGIDO Y LIMPIO */}
        <p>La felicidad empieza en casa, porque es el lugar donde el corazón siempre encuentra paz.</p>
        
        {/* ✅ LLAVES ELIMINADAS OBLIGATORIAMENTE DE AQUÍ */}
      </div>

      {/* -----------------------------------------------------------
         LADO DERECHO: LA CAJA DE VIDRIO (Glassmorphism)
      ----------------------------------------------------------- */}
      <div className="login-glass-box">
        {/* La 'X' de cerrar en la esquina superior */}
        <Link to="/" style={{ position: 'absolute', top: '15px', right: '20px', color: 'white', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 'bold' }}>×</Link>

        <h2>Iniciar Sesión</h2>
        <p className="subtitle">
          {vistaActual === 'pedir-correo' && 'Recupera tu acceso'}
          {vistaActual === 'ingresar-codigo' && 'Revisa tu bandeja de entrada'}
          {vistaActual === 'nueva-clave' && 'Crea una contraseña segura'}
        </p>

        {error && <div className="error-message">⚠️ {error}</div>}
        {successMsg && <div className="error-message" style={{background: 'rgba(46, 125, 50, 0.4)', borderColor: '#81c784'}}>✅ {successMsg}</div>}

        {/* VISTA 1: LOGIN */}
        {vistaActual === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Correo Electrónico</label>
              <input type="email" placeholder="correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: 'auto', height: 'auto', margin: 0 }}/> Recordarme
              </label>
              <button type="button" className="forgot-password-btn" onClick={() => {setVistaActual('pedir-correo'); setError(''); setSuccessMsg('');}}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Cargando...' : 'LOGIN'}
            </button>

            <div className="register-link">
              ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
            </div>
          </form>
        )}

        {/* VISTA 2: PEDIR CORREO */}
        {vistaActual === 'pedir-correo' && (
          <form onSubmit={handlePedirCodigo}>
            <div className="form-group">
              <label>Tu Correo Electrónico</label>
              <input type="email" placeholder="correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Código'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button type="button" className="forgot-password-btn" onClick={() => setVistaActual('login')} style={{ textDecoration: 'none' }}>
                ← Volver al inicio
              </button>
            </div>
          </form>
        )}

        {/* VISTA 3: INGRESAR CÓDIGO */}
        {vistaActual === 'ingresar-codigo' && (
          <form onSubmit={handleValidarCodigo}>
            <div className="form-group">
              <label style={{textAlign: 'center'}}>Código de 6 dígitos</label>
              <input type="text" maxLength="6" placeholder="000000" value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))} style={{textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold'}} required />
            </div>
            <button type="submit" className="btn-login" disabled={loading || codigo.length < 6}>
              {loading ? 'Validando...' : 'Verificar'}
            </button>
          </form>
        )}

        {/* VISTA 4: NUEVA CLAVE */}
        {vistaActual === 'nueva-clave' && (
          <form onSubmit={handleGuardarClave}>
            <div className="form-group">
              <label>Nueva Contraseña</label>
              <input type="password" placeholder="Mínimo 8 caracteres" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} minLength="8" required />
            </div>
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Guardando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default Login;