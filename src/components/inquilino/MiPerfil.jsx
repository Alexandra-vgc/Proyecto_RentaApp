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
      const tipoUsuario = authService.getTipoUsuario();
      const apiBase = tipoUsuario === 'comprador' ? '/api/comprador' : '/api/inquilino';
      
      const response = await axios.get(`http://localhost:5000${apiBase}/mi-perfil`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // ✅ CORRECCIÓN CLAVE: Si el backend envía "null", forzamos el uso de datos locales
      if (response.data) {
        setPerfil(response.data);
        setFormData(response.data);
      } else {
        throw new Error("El perfil aún está vacío en la base de datos");
      }
      
    } catch (err) {
      console.warn('Usando datos de registro básicos.');
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
      const tipoUsuario = authService.getTipoUsuario();
      const apiBase = tipoUsuario === 'comprador' ? '/api/comprador' : '/api/inquilino';

      await axios.put(`http://localhost:5000${apiBase}/mi-perfil`, formData, {
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

  // ✅ CORRECCIÓN CLAVE 2: Validamos que perfil no sea null antes de mostrar la pantalla
  if (loading || !perfil) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-primario)' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', fontWeight: 'bold' }}>Cargando información del perfil...</p>
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
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      {/* MENSAJE DE ÉXITO */}
      {mensajeExito && (
        <div style={{ background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>✅</span> {mensajeExito}
        </div>
      )}

      {/* MENSAJE DE ERROR */}
      {errorMsg && (
        <div style={{ background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>⚠️</span> {errorMsg}
        </div>
      )}

      {/* TARJETA SUPERIOR: AVATAR Y DATOS PRINCIPALES */}
      <div className="modern-card" style={{ textAlign: 'center', marginBottom: '24px', padding: '40px' }}>
        <div style={{
          width: '120px', height: '120px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primario)',
          color: 'var(--texto-boton)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 8px 25px rgba(198, 106, 61, 0.4)',
          fontSize: '3rem',
          fontWeight: 'bold'
        }}>
          {perfil.nombre ? perfil.nombre.charAt(0).toUpperCase() : 'U'}
        </div>
        
        <h2 style={{ margin: '0 0 8px', color: 'var(--texto-oscuro)', fontSize: '26px' }}>
          {perfil.nombre} {perfil.apellido}
        </h2>
        
        <p style={{ margin: '0 0 15px', color: 'var(--texto-secundario)', fontSize: '16px' }}>
          {perfil.email}
        </p>
        
        <span style={{ display: 'inline-block', padding: '6px 20px', backgroundColor: 'var(--fondo-principal)', color: 'var(--color-primario)', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', border: '1px solid var(--lineas-bordes)' }}>
          {authService.getTipoUsuario() === 'comprador' ? 'Comprador' : 'Inquilino'}
        </span>
      </div>

      {/* TARJETA INFERIOR: FORMULARIO */}
      <div className="modern-card" style={{ padding: '35px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid var(--lineas-bordes)', paddingBottom: '15px' }}>
          <h3 style={{ margin: 0, color: 'var(--texto-oscuro)', fontSize: '20px' }}>📋 Información Personal</h3>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="btn-explorar" style={{ padding: '10px 24px', fontSize: '14px' }}>
                ✏️ Editar Datos
              </button>
            ) : (
              <>
                <button onClick={handleCancelEdit} style={{ padding: '10px 20px', background: 'transparent', color: 'var(--texto-secundario)', border: '2px solid var(--lineas-bordes)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>
                  Cancelar
                </button>
                <button onClick={handleGuardar} disabled={saving} style={{ padding: '10px 24px', background: saving ? '#ccc' : '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 10px rgba(46,125,50,0.3)', transition: 'transform 0.2s' }}>
                  {saving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
          {campos.map((campo) => (
            <div key={campo.key} style={{
              background: 'var(--fondo-principal)',
              borderRadius: '12px',
              padding: '20px',
              border: editMode && !campo.disabled ? '2px solid var(--color-primario)' : '2px solid transparent',
              transition: 'all 0.3s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>{campo.icon}</span>
                <label style={{ margin: 0, color: 'var(--texto-oscuro)', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {campo.label}
                </label>
                {campo.disabled && editMode && (
                  <span style={{ fontSize: '11px', color: 'var(--texto-secundario)', marginLeft: 'auto', fontStyle: 'italic' }}>No editable</span>
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
                    width: '100%', boxSizing: 'border-box', padding: '12px 15px',
                    border: '1px solid var(--lineas-bordes)', borderRadius: '8px',
                    fontSize: '16px', color: 'var(--texto-oscuro)',
                    background: campo.disabled ? '#e9ecef' : 'white',
                    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                    cursor: campo.disabled ? 'not-allowed' : 'text'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-primario)'; e.target.style.boxShadow = '0 0 0 3px rgba(198,106,61,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--lineas-bordes)'; e.target.style.boxShadow = 'none'; }}
                />
              ) : (
                <p style={{ margin: 0, color: perfil[campo.key] ? 'var(--texto-oscuro)' : 'var(--texto-secundario)', fontSize: '17px', fontWeight: 'bold' }}>
                  {perfil[campo.key] || '---'}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--texto-secundario)', fontSize: '14px', marginTop: '30px', fontStyle: 'italic' }}>
        Si necesitas actualizar tu correo electrónico o tipo de cuenta, por favor contacta a la administración.
      </p>
    </div>
  );
}

export default MiPerfil;