import { useState, useEffect } from 'react';
import authService from '../../services/authService';
import axios from 'axios';

function MiDepartamento() {
  const [departamento, setDepartamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

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
      <div className="empty-state-container" style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--fondo-tarjeta)', borderRadius: '16px', border: '1px dashed var(--texto-secundario)' }}>
        <div style={{ fontSize: '4.5rem', marginBottom: '20px' }}>🏡</div>
        <h2 style={{ color: 'var(--texto-oscuro)', marginBottom: '15px' }}>No tienes un departamento asignado</h2>
        <p style={{ color: 'var(--texto-secundario)' }}>Contacta al administrador para más información.</p>
      </div>
    );
  }

  // 🔥 EL EXTRACTOR MAESTRO (Ahora lee imagen principal + imágenes extra)
  const extraerFotos = (texto) => {
    if (!texto) return [];
    if (Array.isArray(texto)) return texto;
    if (typeof texto === 'string') {
      if (texto.includes('data:image')) {
        const regexBase64 = /data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+/g;
        return texto.match(regexBase64) || [texto];
      } else if (texto.trim().startsWith('[')) {
        try { return JSON.parse(texto); } catch (e) { return [texto]; }
      } else if (texto.includes(',')) {
        return texto.split(',').map(img => img.trim());
      }
      return [texto];
    }
    return [];
  };

  // 1. Sacamos la foto de portada
  const fotoPrincipal = extraerFotos(departamento.imagen_url);
  
  // 2. Sacamos las 3 fotos escondidas de tu compañera
  const fotosEscondidas = extraerFotos(departamento.imagenes_extra);

  // 3. Juntamos todas las fotos en un solo carrusel y limpiamos vacíos
  let imagenes = [...fotoPrincipal, ...fotosEscondidas].filter(img => img && img.trim() !== '');

  // Si no hay ninguna foto, ponemos la de relleno
  if (imagenes.length === 0) {
    imagenes = ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"];
  }

  // Controles del Carrusel
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* ENCABEZADO Y TÍTULO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: 'var(--texto-oscuro)', margin: '0 0 10px 0', fontSize: '2rem' }}>
            Tu Nuevo Hogar
          </h1>
          <p style={{ color: 'var(--texto-secundario)', margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📍 {departamento.direccion}
          </p>
        </div>
      </div>

      {/* CARRUSEL DE IMÁGENES */}
      <div style={{ position: 'relative', width: '100%', height: '450px', borderRadius: '16px', overflow: 'hidden', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        
        <img 
          src={imagenes[currentSlide]} 
          alt={`Foto ${currentSlide + 1} del departamento`} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.5s ease-in-out' }}
        />

        {imagenes.length > 1 && (
          <>
            <button onClick={prevSlide} style={{ position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '18px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', color: '#333', zIndex: 10 }}>
              &#10094;
            </button>
            <button onClick={nextSlide} style={{ position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '18px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', color: '#333', zIndex: 10 }}>
              &#10095;
            </button>
            
            <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', width: '90%', zIndex: 10 }}>
              {imagenes.map((_, index) => (
                <div 
                  key={index}
                  style={{ width: '10px', height: '10px', borderRadius: '50%', background: index === currentSlide ? 'white' : 'rgba(255,255,255,0.5)', border: '1px solid #ccc', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* TARJETAS DE CARACTERÍSTICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '40px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--lineas-bordes)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🛏️</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--texto-oscuro)' }}>{departamento.numero_habitaciones}</div>
          <div style={{ fontSize: '12px', color: 'var(--texto-secundario)', textTransform: 'uppercase' }}>Habitaciones</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--lineas-bordes)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🛁</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--texto-oscuro)' }}>{departamento.numero_banos}</div>
          <div style={{ fontSize: '12px', color: 'var(--texto-secundario)', textTransform: 'uppercase' }}>Baños</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--lineas-bordes)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>📐</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--texto-oscuro)' }}>{departamento.metros_cuadrados} m²</div>
          <div style={{ fontSize: '12px', color: 'var(--texto-secundario)', textTransform: 'uppercase' }}>Área</div>
        </div>
        <div style={{ background: 'var(--fondo-tarjeta)', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--color-primario)', boxShadow: '0 4px 10px rgba(198, 106, 61, 0.15)' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>💵</div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--color-primario)' }}>${departamento.precio_mensual}</div>
          <div style={{ fontSize: '12px', color: 'var(--texto-oscuro)', textTransform: 'uppercase', fontWeight: 'bold' }}>Valor Mensual</div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '35px', borderRadius: '16px', border: '1px solid var(--lineas-bordes)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <h3 style={{ color: 'var(--texto-oscuro)', fontSize: '1.4rem', borderBottom: '2px solid var(--fondo-principal)', paddingBottom: '15px', marginBottom: '25px' }}>
          Acerca de este lugar
        </h3>
        <p style={{ color: '#555', lineHeight: '1.8', fontSize: '1rem', whiteSpace: 'pre-line' }}>
          {departamento.descripcion || "Este hermoso inmueble cuenta con todas las comodidades necesarias para tu confort. Su ubicación estratégica y excelentes acabados lo convierten en el lugar ideal."}
        </p>
        <div style={{ marginTop: '30px', padding: '20px', background: 'var(--fondo-principal)', borderRadius: '8px', display: 'inline-block' }}>
          <span style={{ color: 'var(--texto-secundario)', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', marginRight: '10px' }}>Código Referencial:</span>
          <span style={{ color: 'var(--texto-oscuro)', fontWeight: 'bold', letterSpacing: '1px' }}>
            {departamento.codigo ? `PROP-${departamento.codigo.toString().padStart(4, '0')}` : '---'}
          </span>
        </div>
      </div>

    </div>
  );
}

export default MiDepartamento;