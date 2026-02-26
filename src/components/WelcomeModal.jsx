import { useState } from "react";

function WelcomeModal({ onFinish }) {
  const [loading, setLoading] = useState(false);

  const handleEnter = () => {
    setLoading(true);
    setTimeout(() => {
      onFinish();
    }, 1500);
  };

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="welcome-card shadow-lg" style={cardStyle}>
        
        <div className="row g-0 h-100">
          {/* LADO IZQUIERDO: IMAGEN (Asegúrate que el nombre y extensión coincidan) */}
          <div className="col-md-5 d-flex align-items-center justify-content-center bg-light p-4">
            <img 
              src="/bienvenida.jpg" 
              alt="Logo MiRentaAPP" 
              style={{ width: "100%", height: "auto", borderRadius: "15px", objectFit: "contain" }}
              onError={(e) => { e.target.src = "https://via.placeholder.com/300?text=Logo+MiRentaAPP"; }} 
            />
          </div>

          {/* LADO DERECHO: TEXTO */}
          <div className="col-md-7 p-5 d-flex flex-column justify-content-center bg-white position-relative">
            {!loading ? (
              <>
                <h2 className="fw-bold mb-4" style={{ color: "#003366" }}>¡Bienvenidos!</h2>
                
                <div className="mb-4">
                  <h6 className="fw-bold text-dark">Nuestra Misión</h6>
                  <p className="text-muted small">
                    Facilitar el arriendo de departamentos de forma 
                    <span style={{ color: "#ff5a00", fontWeight: "bold" }}> rápida y segura</span>, conectando hogares con sueños.
                  </p>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-dark">Nuestra Visión</h6>
                  <p className="text-muted small">
                    Ser la plataforma líder en Ecuador reconocida por la confianza y el impacto positivo en nuestros usuarios.
                  </p>
                </div>

                <div className="d-flex align-items-center gap-3 mt-3">
                  <button 
                    className="btn btn-lg text-white px-5" 
                    style={{ background: "#ff5a00", borderRadius: "12px", fontWeight: "600" }}
                    onClick={handleEnter}
                  >
                    Siguiente
                  </button>
                  <div className="flecha-animada" style={{ fontSize: "1.5rem", color: "#ff5a00" }}>
                    ➜
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-5">
                <div className="spinner-border text-warning mb-3" role="status"></div>
                <p className="fw-bold text-muted">Iniciando plataforma...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85); display: flex; align-items: center;
            justify-content: center; z-index: 3000;
          }
          .welcome-card {
            width: 90%; max-width: 850px; background: #fff;
            border-radius: 25px; overflow: hidden;
          }
          .flecha-animada {
            animation: moveRight 1.5s infinite;
          }
          @keyframes moveRight {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(10px); }
          }
        `}
      </style>
    </div>
  );
}

export default WelcomeModal;