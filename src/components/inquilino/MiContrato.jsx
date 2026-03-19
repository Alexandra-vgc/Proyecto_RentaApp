import { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../../services/authService';
// ✅ IMPORTAMOS LA FUNCIÓN GENERADORA DE PDF DE TU COMPAÑERA
import { generarPDFContrato } from '../admin/contratos/ModuloContratos';

function MiContrato() {
  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarContrato();
  }, []);

  const cargarContrato = async () => {
    try {
      const token = authService.getToken();
      const apiBase = authService.getApiBase(); // ✅ Usamos la ruta correcta dinámicamente

      const response = await axios.get(`${apiBase}/mi-contrato`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContrato(response.data);
    } catch (error) {
      console.error('Error al cargar el contrato', error);
      setContrato(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPDF = () => {
    if (!contrato) return;
    
    // Obtenemos los datos del usuario actual para mandarlos al PDF
    const user = authService.getCurrentUser();
    const tipoUsuario = authService.getTipoUsuario();
    
    // Creamos un objeto con la estructura que espera la función de tu compañera
    const datosContratoPDF = {
      nombre_cliente: user.nombre || "Usuario",
      nacionalidad: "ECUATORIANA", // Puedes pedir esto en el registro después
      estado_civil: "SOLTERO/A",
      cedula: "17XXXXXXXX",
      nombre_propiedad: contrato.departamento_direccion || "Inmueble",
      precio_total: contrato.monto_mensual * 100, // Estimación para venta
      canon: contrato.monto_mensual,
      fecha_inicio: new Date(contrato.fecha_inicio).toLocaleDateString(),
    };

    // ✅ LLAMAMOS A LA FUNCIÓN MÁGICA
    generarPDFContrato(datosContratoPDF, tipoUsuario);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-primario)' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', fontWeight: 'bold' }}>Cargando documento legal...</p>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="empty-state-container" style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--fondo-tarjeta)', borderRadius: '16px', border: '1px dashed var(--texto-secundario)' }}>
        <div style={{ fontSize: '4.5rem', marginBottom: '20px' }}>📄</div>
        <h2 style={{ color: 'var(--texto-oscuro)', marginBottom: '15px' }}>Sin contrato vigente</h2>
        <p style={{ color: 'var(--texto-secundario)', maxWidth: '550px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Aún no se ha generado ni firmado un contrato para tu cuenta. Una vez que la administración lo apruebe, aparecerá aquí tu documento oficial.
        </p>
      </div>
    );
  }

  const esComprador = authService.getTipoUsuario() === 'comprador';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--texto-oscuro)', marginBottom: '25px', fontSize: '24px', borderBottom: '2px solid var(--lineas-bordes)', paddingBottom: '10px' }}>
        Gestión de Contrato
      </h2>

      <div className="modern-card" style={{ padding: '40px', position: 'relative', overflow: 'hidden', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        
        <div style={{ position: 'absolute', top: '30px', right: '-35px', background: '#2e7d32', color: 'white', padding: '8px 40px', transform: 'rotate(45deg)', fontWeight: 'bold', fontSize: '12px', letterSpacing: '1px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
          {contrato.estado.toUpperCase()}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '35px', borderBottom: '1px solid var(--lineas-bordes)', paddingBottom: '25px' }}>
          <div style={{ background: 'var(--fondo-principal)', padding: '20px', borderRadius: '12px', color: 'var(--color-primario)', fontSize: '40px' }}>
            {esComprador ? '📜' : '📝'}
          </div>
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--texto-oscuro)', fontSize: '22px' }}>
              {esComprador ? 'Contrato de Compraventa' : 'Contrato de Arrendamiento'}
            </h3>
            <p style={{ margin: 0, color: 'var(--texto-secundario)', fontWeight: 'bold', letterSpacing: '1px' }}>
              CÓDIGO: {contrato.id ? `CTR-2026-${contrato.id.toString().padStart(4, '0')}` : '---'}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', marginBottom: '40px' }}>
          
          <div style={{ background: 'var(--fondo-principal)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid var(--color-primario)' }}>
            <p style={{ margin: '0 0 5px 0', color: 'var(--texto-secundario)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Inmueble Asociado</p>
            <p style={{ margin: 0, color: 'var(--texto-oscuro)', fontSize: '18px', fontWeight: 'bold' }}>{contrato.departamento_codigo || '---'}</p>
          </div>

          <div style={{ background: 'var(--fondo-principal)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid var(--color-primario)' }}>
            <p style={{ margin: '0 0 5px 0', color: 'var(--texto-secundario)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Fecha de Inicio</p>
            <p style={{ margin: 0, color: 'var(--texto-oscuro)', fontSize: '18px', fontWeight: 'bold' }}>
              {contrato.fecha_inicio ? new Date(contrato.fecha_inicio).toLocaleDateString() : '---'}
            </p>
          </div>

          <div style={{ background: 'var(--fondo-principal)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid var(--color-primario)' }}>
            <p style={{ margin: '0 0 5px 0', color: 'var(--texto-secundario)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Término del Contrato</p>
            <p style={{ margin: 0, color: 'var(--texto-oscuro)', fontSize: '18px', fontWeight: 'bold' }}>
              {contrato.fecha_fin ? new Date(contrato.fecha_fin).toLocaleDateString() : 'Indefinido'}
            </p>
          </div>

        </div>

        <div style={{ background: '#f8f9fa', padding: '30px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e9ecef' }}>
          <div>
            <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '18px' }}>Documento Digital (PDF)</h4>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '14px', maxWidth: '400px' }}>
              Descarga una copia firmada digitalmente de tu contrato para tus registros personales.
            </p>
          </div>
          <button 
            onClick={handleDescargarPDF}
            style={{ 
              background: 'linear-gradient(135deg, var(--color-primario) 0%, #a05330 100%)', 
              color: 'white', border: 'none', padding: '14px 28px', borderRadius: '8px', 
              fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', 
              boxShadow: '0 4px 15px rgba(198, 106, 61, 0.4)', transition: 'transform 0.2s',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span>📄</span> Descargar Contrato
          </button>
        </div>

      </div>
    </div>
  );
}

export default MiContrato;