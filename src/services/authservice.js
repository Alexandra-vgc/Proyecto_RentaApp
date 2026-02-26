import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ NUEVO: Creamos un "timbre" para avisar cuando cambie el estado de la sesión
const authEvent = new Event('authStateChange');

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // ✅ NUEVO: Tocamos el timbre al iniciar sesión
        window.dispatchEvent(authEvent);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al iniciar sesión' };
    }
  },

  async register(nombre, email, password, rol = 'inquilino') {
    try {
      const response = await api.post('/register', { nombre, email, password, rol });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // ✅ NUEVO: Tocamos el timbre al registrarse
        window.dispatchEvent(authEvent);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al registrar usuario' };
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // ✅ NUEVO: Tocamos el timbre al cerrar sesión
    window.dispatchEvent(authEvent);
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getApiBase() {
    const user = this.getCurrentUser();
    if (user?.rol === 'comprador') {
      return 'http://localhost:5000/api/comprador';
    } else {
      return 'http://localhost:5000/api/inquilino';
    }
  },

  getTipoUsuario() {
    const user = this.getCurrentUser();
    return user?.rol || 'inquilino';
  }
};

export default authService;