import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function PropertyDetail() {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/propiedades/${id}`);
        setProperty(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar el detalle:", error);
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) return <div className="container pt-5 text-center">Cargando detalles...</div>;
  if (!property) return <div className="container pt-5 text-center">Propiedad no encontrada.</div>;

  return (
    <div style={{ background: "#F1F5F3", minHeight: "100vh", paddingBottom: "50px" }}>
      <div className="container pt-4">
        {/* BOTÓN REGRESAR */}
        <Link to="/" className="btn btn-sm mb-3" style={{ color: "#3E5E58", fontWeight: "600" }}>
          ← Volver al listado
        </Link>

        <div className="row g-4">
          {/* COLUMNA IZQUIERDA: IMAGEN Y DESCRIPCIÓN */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <img 
                src={property.imagen_url || "/imagenes/default.jpg"} 
                alt={property.titulo} 
                style={{ width: "100%", height: "450px", objectFit: "cover" }}
              />
              <div className="card-body p-4">
                <h2 style={{ color: "#3E5E58", fontWeight: "700" }}>{property.titulo}</h2>
                <p className="text-muted">📍 {property.sector}, {property.ciudad}</p>
                <hr />
                <h5 className="fw-bold">Descripción</h5>
                <p style={{ lineHeight: "1.8", color: "#555" }}>
                  {property.descripcion || "Sin descripción disponible."}
                </p>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: PRECIO Y FICHA TÉCNICA */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h3 style={{ color: "#3E5E58", fontWeight: "700" }}>
                USD {Number(property.precio).toLocaleString()}
              </h3>
              <p className="text-muted small">Alquiler mensual + ${property.alicuota} alícuota</p>
              
              <div className="d-grid gap-2 mt-3">
                <a 
                  href={`https://wa.me/593999999999?text=Hola, solicito información del departamento en ${property.sector}`}
                  target="_blank" 
                  className="btn py-2" 
                  style={{ background: "#25D366", color: "white", fontWeight: "600" }}
                >
                  Contactar por WhatsApp
                </a>
                <Link to="/login" className="btn py-2" style={{ background: "#3E5E58", color: "white" }}>
                  Enviar Mensaje
                </Link>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h6 className="fw-bold mb-3">Características principales</h6>
              <ul className="list-unstyled">
                <li className="mb-2">📐 <b>{property.metros_cuadrados}</b> m² totales</li>
                <li className="mb-2">🛏️ <b>{property.habitaciones}</b> Habitaciones</li>
                <li className="mb-2">🚿 <b>{property.banos}</b> Baños</li>
                <li className="mb-2">🚗 <b>{property.estacionamientos || 0}</b> Estacionamiento</li>
                <li className="mb-2">🐾 <b>{property.pet_friendly ? "Sí" : "No"}</b> permite mascotas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}