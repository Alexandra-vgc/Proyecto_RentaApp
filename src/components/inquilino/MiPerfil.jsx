import { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../../services/authService';

function MiPerfil() {
  const user = authService.getCurrentUser();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const token = authService.getToken();
      // Intentar obtener datos del inquilino desde el backend
      const response = await axios.get('http://localhost:5000/api/inquilino/mi-perfil', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerfil(response.data);
      setFormData(response.data);
    } catch (err) {
      // Si la ruta no existe aún, usar datos del usuario local
      console.warn('Ruta mi-perfil no disponible, usando datos locales.');
      const datosLocales = {
        nombre: user?.nombre || '',
        apellido: '',
        email: user?.email || '',
        cedula: '',
        telefono: '',
        ocupacion: '',
      };
      setPerfil(datosLocales);
      setFormData(datosLocales);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(null);
  };

  const handleGuardar = async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      const token = authService.getToken();
      await axios.put('http://localhost:5000/api/inquilino/mi-perfil', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerfil({ ...formData });
      setEditMode(false);
      setMensajeExito('¡Perfil actualizado exitosamente!');
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({ ...perfil });
    setEditMode(false);
    setErrorMsg(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div className="spinner"></div>
        <p style={{ color: '#6c757d', marginTop: '16px' }}>Cargando perfil...</p>
      </div>
    );
  }

  const campos = [
    { key: 'nombre',    label: 'Nombre',      icon: '👤', type: 'text',  placeholder: 'Tu nombre' },
    { key: 'apellido',  label: 'Apellido',    icon: '👤', type: 'text',  placeholder: 'Tu apellido' },
    { key: 'email',     label: 'Email',       icon: '📧', type: 'email', placeholder: 'tu@correo.com', disabled: true },
    { key: 'cedula',    label: 'Cédula',      icon: '🪪', type: 'text',  placeholder: '0000000000' },
    { key: 'telefono',  label: 'Teléfono',    icon: '📱', type: 'tel',   placeholder: '+593 9X XXX XXXX' },
    { key: 'ocupacion', label: 'Ocupación',   icon: '💼', type: 'text',  placeholder: 'Ej: Ingeniero' },
  ];

  return (
    <div>
      <h1 className="page-title">Mi Perfil</h1>

      {/* MENSAJE DE ÉXITO */}
      {mensajeExito && (
        <div style={{
          background: '#e8f5e9',
          color: '#2e7d32',
          border: '1px solid #a5d6a7',
          borderRadius: '12px',
          padding: '14px 20px',
          marginBottom: '20px',
          fontWeight: '600',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>✅</span> {mensajeExito}
        </div>
      )}

      {/* MENSAJE DE ERROR */}
      {errorMsg && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          border: '1px solid #ffcdd2',
          borderRadius: '12px',
          padding: '14px 20px',
          marginBottom: '20px',
          fontWeight: '600',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>⚠️</span> {errorMsg}
        </div>
      )}

      {/* AVATAR + NOMBRE GRANDE */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '36px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '100px', height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.35)',
          fontSize: '42px'
        }}>
          👤
        </div>
        <h2 style={{ margin: '0 0 6px', color: '#2c3e50', fontSize: '24px' }}>
          {perfil.nombre} {perfil.apellido}
        </h2>
        <p style={{ margin: '0 0 4px', color: '#6c757d', fontSize: '15px' }}>
          {perfil.email}
        </p>
        <span style={{
          display: 'inline-block',
          padding: '5px 16px',
          background: '#e3f2fd',
          color: '#1976d2',
          borderRadius: '16px',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          Inquilino
        </span>
      </div>

      {/* FORMULARIO / VISTA DE CAMPOS */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '28px 32px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        {/* BOTONES EDITAR / GUARDAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '18px' }}>📋 Información Personal</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(102,126,234,0.4)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                ✏️ Editar
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    padding: '10px 20px',
                    background: 'white',
                    color: '#6c757d',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardar}
                  disabled={saving}
                  style={{
                    padding: '10px 24px',
                    background: saving ? '#adb5bd' : 'linear-gradient(135deg, #28a745, #20c997)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 3px 10px rgba(40,167,69,0.35)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {saving ? '⏳ Guardando...' : '💾 Guardar'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* CAMPOS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
          {campos.map((campo) => (
            <div key={campo.key} style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '18px',
              border: editMode && !campo.disabled ? '2px solid #e9ecef' : '2px solid transparent',
              transition: 'border-color 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '18px' }}>{campo.icon}</span>
                <label style={{ margin: 0, color: '#6c757d', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {campo.label}
                </label>
                {campo.disabled && editMode && (
                  <span style={{ fontSize: '11px', color: '#adb5bd', marginLeft: 'auto' }}>No editable</span>
                )}
              </div>

              {editMode ? (
                <input
                  type={campo.type}
                  name={campo.key}
                  value={formData[campo.key] || ''}
                  onChange={handleChange}
                  placeholder={campo.placeholder}
                  disabled={campo.disabled}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 14px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '15px',
                    color: '#2c3e50',
                    background: campo.disabled ? '#eee' : 'white',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    cursor: campo.disabled ? 'not-allowed' : 'text'
                  }}
                  onFocus={e => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e9ecef'; e.target.style.boxShadow = 'none'; }}
                />
              ) : (
                <p style={{ margin: 0, color: perfil[campo.key] ? '#2c3e50' : '#adb5bd', fontSize: '16px', fontWeight: '600' }}>
                  {perfil[campo.key] || 'No especificado'}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* NOTA INFERIOR */}
      <p style={{ textAlign: 'center', color: '#adb5bd', fontSize: '13px', marginTop: '24px' }}>
        Si necesitas cambiar tu email, comunícate con el administrador.
      </p>
    </div>
  );
}

export default MiPerfil;