import { useState } from "react";

// Paleta oficial de MiRentaAPP
const palette = {
  fondoPrincipal: "#E8DCCB", // Crema
  fondoAlterno: "#F5EFE6",  // Blanco hueso
  titulos: "#4E5B3C",        // Verde bosque
  botonPrincipal: "#C66A3D", // Naranja terracota
  textoSecundario: "#BFA58A", // Arena
  detallesDorado: "#C9A227"  // Dorado
};

function WelcomeModal({ onFinish }) {
  const [loading, setLoading] = useState(false);

  const handleEnter = () => {
    setLoading(true);
    setTimeout(() => {
      onFinish();
    }, 1500);
  };

  return (
    <div className="modal-overlay">
      <div className="welcome-card shadow-lg">
        
        <div className="row g-0 h-100">
          {/* LADO IZQUIERDO: DISEÑO ARTÍSTICO */}
          <div className="col-md-5 d-flex flex-column align-items-center justify-content-center p-4 position-relative" 
               style={{ background: palette.fondoAlterno }}>
            
            {/* Imagen del Departamento Superior */}
            <div style={{ 
                width: "90%", 
                borderRadius: "15px", 
                overflow: "hidden", 
                border: `3px solid ${palette.detallesDorado}`,
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                marginBottom: "30px"
            }}>
                <img 
                  src="/bienvenida.jpg" 
                  alt="Interior MiRentaAPP" 
                  style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }}
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200"; }} 
                />
            </div>

            {/* Icono de Llave y Hojas (Diseño Inferior) */}
            <div className="decoracion-llave" style={{ textAlign: "center" }}>
                <svg width="180" height="80" viewBox="0 0 200 100" fill="none">
                    {/* Hojas Izquierda */}
                    <path d="M40 50C20 40 10 50 10 50C10 50 20 60 40 50Z" stroke={palette.titulos} strokeWidth="1"/>
                    <path d="M45 45C30 30 20 35 20 35C20 35 30 45 45 45Z" stroke={palette.titulos} strokeWidth="1"/>
                    {/* Llave Dorada */}
                    <circle cx="100" cy="50" r="12" stroke={palette.detallesDorado} strokeWidth="2.5"/>
                    <path d="M112 50H140M140 50V60M130 50V60" stroke={palette.detallesDorado} strokeWidth="2.5" strokeLinecap="round"/>
                    {/* Casa Pequeña */}
                    <path d="M92 35L100 28L108 35V45H92V35Z" fill={palette.titulos}/>
                    {/* Hojas Derecha */}
                    <path d="M160 50C180 40 190 50 190 50C190 50 180 60 160 50Z" stroke={palette.titulos} strokeWidth="1"/>
                    <path d="M155 45C170 30 180 35 180 35C180 35 170 45 155 45Z" stroke={palette.titulos} strokeWidth="1"/>
                </svg>
            </div>
          </div>

          {/* LADO DERECHO: TEXTO Y ACCIÓN */}
          <div className="col-md-7 p-5 d-flex flex-column justify-content-center bg-white">
            {!loading ? (
              <>
                <h1 className="fw-bold mb-1" style={{ color: palette.titulos, fontFamily: 'serif', fontSize: "2.8rem" }}>
                    MiRentaAPP
                </h1>
                <p className="mb-5" style={{ color: palette.textoSecundario, fontWeight: 700, letterSpacing: "1px", fontSize: "0.85rem" }}>
                    TU HOGAR IDEAL A UN SOLO CLIC
                </p>
                
                <div className="mb-4">
                  <h6 className="fw-bold text-uppercase" style={{ color: palette.titulos, fontSize: "0.9rem" }}>Nuestra Misión</h6>
                  <p className="text-muted" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                    Facilitar el arriendo de departamentos de forma 
                    <span style={{ color: palette.botonPrincipal, fontWeight: "bold" }}> rápida y segura</span>, conectando hogares con sueños en todo el Ecuador.
                  </p>
                </div>

                <div className="mb-5">
                  <h6 className="fw-bold text-uppercase" style={{ color: palette.titulos, fontSize: "0.9rem" }}>Nuestra Visión</h6>
                  <p className="text-muted" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                    Ser la plataforma líder reconocida por la confianza y el impacto positivo en la vida de propietarios y arrendatarios.
                  </p>
                </div>

                <div className="d-flex align-items-center gap-4 mt-2">
                  <button 
                    className="btn btn-lg text-white px-5 py-3" 
                    style={{ background: palette.botonPrincipal, borderRadius: "15px", fontWeight: "700", border: "none", boxShadow: "0 4px 15px rgba(198, 106, 61, 0.3)" }}
                    onClick={handleEnter}
                  >
                    Ingresar
                  </button>
                  <div className="flecha-animada" style={{ fontSize: "1.8rem", color: palette.botonPrincipal }}>
                    ➜
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-5">
                <div className="spinner-border mb-3" style={{ color: palette.botonPrincipal, width: "3rem", height: "3rem" }} role="status"></div>
                <p className="fw-bold mt-2" style={{ color: palette.titulos, fontSize: "1.1rem" }}>Iniciando MiRentaAPP...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(78, 91, 60, 0.9); display: flex; align-items: center;
            justify-content: center; z-index: 9999;
          }
          .welcome-card {
            width: 95%; max-width: 900px; height: 550px; background: #fff;
            border-radius: 30px; overflow: hidden;
            animation: fadeInScale 0.5s ease-out;
          }
          .flecha-animada {
            animation: moveRight 1.5s infinite;
          }
          @keyframes moveRight {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(12px); }
          }
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          @media (max-width: 768px) {
            .welcome-card { height: auto; }
            .col-md-5 { display: none !important; }
          }
        `}
      </style>
    </div>
  );
}

export default WelcomeModal;