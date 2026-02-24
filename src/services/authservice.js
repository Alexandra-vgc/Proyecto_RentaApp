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

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al iniciar sesión' };
    }
  },

  async register(nombre, email, password, rol = 'inquilino', tipo = 'inquilino') {
    try {
      const response = await api.post('/register', { nombre, email, password, rol, tipo });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al registrar usuario' };
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  getInquilinoId() {
    const user = this.getCurrentUser();
    return user?.inquilino_id || null;
  },

  getCompradorId() {
    const user = this.getCurrentUser();
    return user?.comprador_id || null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  // NUEVO: Detecta automáticamente si es inquilino o comprador
  getApiBase() {
    const user = this.getCurrentUser();
    if (user?.comprador_id) {
      return 'http://localhost:5000/api/comprador';
    } else {
      return 'http://localhost:5000/api/inquilino';
    }
  },

  // NUEVO: Obtiene el tipo de usuario
  getTipoUsuario() {
    const user = this.getCurrentUser();
    if (user?.comprador_id) {
      return 'comprador';
    } else if (user?.inquilino_id) {
      return 'inquilino';
    }
    return null;
  }
};

export default authService;