import { useState } from "react";
import axios from "axios";
import "./DepartmentCard.css";

const DepartmentCard = ({ dept }) => {
  const [solicitarLoading, setSolicitarLoading] = useState(false); // Estado para manejar el botón de carga

  // Función para manejar la solicitud
  const handleSolicitud = async () => {
    const nombre = prompt("Para contactar al propietario, ingresa tu nombre completo:");
    if (!nombre) return; // Si el nombre no es ingresado, no se envía la solicitud

    setSolicitarLoading(true); // Habilitamos el estado de carga para evitar múltiples clics

    try {
      const response = await axios.post("http://localhost:5000/api/solicitudes", {
        propiedad_id: dept.id,
        nombre_cliente: nombre,
      });

      if (response.status === 201 || response.status === 200) {
        alert("✅ Solicitud enviada con éxito. El propietario se contactará contigo pronto.");
      }
    } catch (error) {
      console.error("Error al enviar solicitud:", error.response?.data || error.message);
      alert(`❌ Error: ${error.response?.data?.error || "Intenta más tarde"}`);
    } finally {
      setSolicitarLoading(false); // Desactivamos el estado de carga
    }
  };

  return (
    <div className="dept-card">
      <img src={dept.image} alt={dept.title} className="dept-image" />

      <div className="dept-content">
        <h3 className="dept-price">USD {dept.price}</h3>
        <h4 className="dept-title">{dept.title}</h4>
        <p className="dept-location">{dept.location}</p>
        <p className="dept-info">{dept.info}</p>

        <div className="dept-actions">
          <button className="btn-outline">Ver detalles</button>

          <a
            href={`https://wa.me/593999999999?text=Hola, me interesa ${dept.title}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            WhatsApp
          </a>

          {/* Botón para enviar solicitud */}
          <button
            className="btn-primary"
            onClick={handleSolicitud}
            disabled={solicitarLoading}
          >
            {solicitarLoading ? "Enviando..." : "Solicitar Departamento"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentCard;