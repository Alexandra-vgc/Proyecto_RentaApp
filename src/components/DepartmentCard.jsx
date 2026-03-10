import { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../../services/authService';

function MiDepartamento() {
  const [propiedad, setPropiedad] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDepartamento();
  }, []);

  const cargarDepartamento = async () => {
    try {
      const token = authService.getToken();
      const tipoUsuario = authService.getTipoUsuario();
      const apiBase = tipoUsuario === 'comprador' ? '/api/comprador' : '/api/inquilino';

      const response = await axios.get(`http://localhost:5000${apiBase}/mi-departamento`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPropiedad(response.data);
    } catch (error) {
      console.error('Error al cargar la propiedad', error);
      setPropiedad(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-primario)' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', fontWeight: 'bold' }}>Cargando información del inmueble...</p>
      </div>
    );
  }

  // ✅ PANTALLA VACÍA: Si tu compañera aún no asigna la casa, mostramos este diseño bonito
  if (!propiedad) {
    return (
      <div className="empty-state-container" style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--fondo-tarjeta)', borderRadius: '16px', border: '1px dashed var(--texto-secundario)' }}>
        <div style={{ fontSize: '4.5rem', marginBottom: '20px' }}>🏠</div>
        <h2 style={{ color: 'var(--texto-oscuro)', marginBottom: '15px' }}>Aún no tienes una propiedad asignada</h2>
        <p style={{ color: 'var(--texto-secundario)', maxWidth: '550px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Cuando la administración apruebe tu solicitud y asocie un contrato a tu cuenta, podrás ver todos los detalles, características y fotos de tu nuevo hogar aquí mismo.
        </p>
      </div>
    );
  }

  // ✅ PANTALLA CON DATOS: Cuando ya tenga casa, verá esta tarjeta de lujo
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--texto-oscuro)', marginBottom: '25px', fontSize: '24px', borderBottom: '2px solid var(--lineas-bordes)', paddingBottom: '10px' }}>
        {authService.getTipoUsuario() === 'comprador' ? 'Mi Propiedad en Compra' : 'Mi Inmueble Actual'}
      </h2>

      <div className="modern-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        
        {/* IMAGEN DE CABECERA (Placeholder bonito de un departamento) */}
        <div style={{ 
          height: '280px', 
          backgroundColor: 'var(--lineas-bordes)', 
          backgroundImage: 'url("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80")', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          position: 'relative' 
        }}>
           <div style={{ position: 'absolute', bottom: '20px', left: '25px', background: 'var(--color-primario)', color: 'white', padding: '8px 20px', borderRadius: '25px', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
              Código: {propiedad.codigo || 'N/A'}
           </div>
        </div>

        {/* DETALLES DE LA PROPIEDAD */}
        <div style={{ padding: '35px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '1px solid var(--lineas-bordes)', paddingBottom: '25px' }}>
            <div>
              <h3 style={{ margin: '0 0 12px 0', color: 'var(--texto-oscuro)', fontSize: '26px' }}>{propiedad.direccion || 'Dirección no especificada'}</h3>
              <p style={{ margin: 0, color: 'var(--texto-secundario)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                📍 {propiedad.ciudad || 'Quito, Ecuador'}
              </p>
            </div>
            <div style={{ textAlign: 'right', background: 'var(--fondo-principal)', padding: '15px 25px', borderRadius: '12px', border: '1px solid var(--lineas-bordes)' }}>
              <p style={{ margin: '0 0 5px 0', color: 'var(--texto-secundario)', fontSize: '13px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Valor Mensual
              </p>
              <p style={{ margin: 0, color: 'var(--color-primario)', fontSize: '28px', fontWeight: 'bold' }}>
                ${propiedad.precio_mensual || '0.00'}
              </p>
            </div>
          </div>

          {/* CUADRÍCULA DE CARACTERÍSTICAS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            
            <div style={{ background: 'var(--fondo-principal)', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '18px', border: '1px solid transparent', transition: 'border 0.3s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primario)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
              <span style={{ fontSize: '30px' }}>🛏️</span>
              <div>
                <p style={{ margin: 0, color: 'var(--texto-secundario)', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>Habitaciones</p>
                <p style={{ margin: '4px 0 0 0', color: 'var(--texto-oscuro)', fontSize: '22px', fontWeight: 'bold' }}>{propiedad.numero_habitaciones || 0}</p>
              </div>
            </div>

            <div style={{ background: 'var(--fondo-principal)', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '18px', border: '1px solid transparent', transition: 'border 0.3s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primario)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
              <span style={{ fontSize: '30px' }}>🚿</span>
              <div>
                <p style={{ margin: 0, color: 'var(--texto-secundario)', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>Baños</p>
                <p style={{ margin: '4px 0 0 0', color: 'var(--texto-oscuro)', fontSize: '22px', fontWeight: 'bold' }}>{propiedad.numero_banos || 0}</p>
              </div>
            </div>

            <div style={{ background: 'var(--fondo-principal)', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '18px', border: '1px solid transparent', transition: 'border 0.3s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primario)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
              <span style={{ fontSize: '30px' }}>📐</span>
              <div>
                <p style={{ margin: 0, color: 'var(--texto-secundario)', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>Área</p>
                <p style={{ margin: '4px 0 0 0', color: 'var(--texto-oscuro)', fontSize: '22px', fontWeight: 'bold' }}>{propiedad.metros_cuadrados || 0} m²</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default MiDepartamento;