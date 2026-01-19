import { useState } from "react";
import videoBg from "../assets/bienvenida.mp4";

function WelcomeModal({ onFinish }) {
  const [loading, setLoading] = useState(false);

  const handleEnter = () => {
    setLoading(true);

    // Simula carga (2 segundos)
    setTimeout(() => {
      onFinish();
    }, 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-video-box fade-out">

        {/* Video */}
        <video className="video-bg" autoPlay loop>
          <source src={videoBg} type="video/mp4" />
        </video>

        {/* Botón flecha */}
        {!loading && (
          <button className="enter-button" onClick={handleEnter}>
            ➜
          </button>
        )}

        {/* Loader */}
        {loading && (
          <div className="loader-container">
            <div className="loader"></div>
            <p>Cargando plataforma...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WelcomeModal;
