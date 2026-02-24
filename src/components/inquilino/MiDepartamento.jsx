import { useState, useEffect } from 'react';
import authService from '../../services/authService';
import axios from 'axios';

function MiDepartamento() {
  const [departamento, setDepartamento] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDepartamento();
  }, []);

  const cargarDepartamento = async () => {
    try {
      const token = authService.getToken();
      const apiBase = authService.getApiBase();
      const response = await axios.get(`${apiBase}/mi-departamento`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartamento(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  if (!departamento) {
    return (
      <div className="no-data">
        <h2>No tienes un departamento asignado</h2>
        <p>Contacta al administrador para más información.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Mi Departamento</h1>
      
      <div className="info-card">
        <div className="info-row">
          <span className="label">Código:</span>
          <span className="value"><strong>{departamento.codigo}</strong></span>
        </div>
        <div className="info-row">
          <span className="label">Dirección:</span>
          <span className="value">{departamento.direccion}</span>
        </div>
        <div className="info-row">
          <span className="label">Habitaciones:</span>
          <span className="value">{departamento.numero_habitaciones}</span>
        </div>
        <div className="info-row">
          <span className="label">Baños:</span>
          <span className="value">{departamento.numero_banos}</span>
        </div>
        <div className="info-row">
          <span className="label">Metros Cuadrados:</span>
          <span className="value">{departamento.metros_cuadrados} m²</span>
        </div>
        <div className="info-row">
          <span className="label">Precio Mensual:</span>
          <span className="value price">${departamento.precio_mensual}</span>
        </div>
        <div className="info-row">
          <span className="label">Estado:</span>
          <span className={`status-badge ${departamento.estado}`}>
            {departamento.estado}
          </span>
        </div>
        {departamento.descripcion && (
          <div className="info-row">
            <span className="label">Descripción:</span>
            <span className="value">{departamento.descripcion}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MiDepartamento;