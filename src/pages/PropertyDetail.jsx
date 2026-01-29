import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const properties = [
  {
    id: 1,
    title: "Departamento Moderno",
    address: "Av. Amazonas - Quito",
    description: "Departamento con 2 habitaciones, balcón y parqueadero.",
    price: 350,
    image: "https://via.placeholder.com/600x350"
  },
  {
    id: 2,
    title: "Suite Amoblada",
    address: "La Carolina",
    description: "Suite completamente amoblada, ideal para estudiantes.",
    price: 420,
    image: "https://via.placeholder.com/600x350"
  }
];

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const property = properties.find(p => p.id == id);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  if (!property) return <h3>No encontrado</h3>;

  const reservar = () => {
    if (!from || !to) {
      alert("Seleccione las fechas");
      return;
    }
    navigate("/login");
  };

  return (
    <div className="container mt-4">
      <img src={property.image} className="img-fluid rounded mb-3" />

      <h2>{property.title}</h2>
      <p>{property.address}</p>
      <p>{property.description}</p>
      <h4 className="text-success">${property.price}</h4>

      {/* Botón modal */}
      <button
        className="btn btn-primary mt-3"
        data-bs-toggle="modal"
        data-bs-target="#reservaModal"
      >
        Ver disponibilidad
      </button>

      {/* MODAL */}
      <div className="modal fade" id="reservaModal">
        <div className="modal-dialog">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">Reservar Departamento</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              <label>Desde</label>
              <input
                type="date"
                className="form-control mb-2"
                value={from}
                onChange={e => setFrom(e.target.value)}
              />

              <label>Hasta</label>
              <input
                type="date"
                className="form-control"
                value={to}
                onChange={e => setTo(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancelar
              </button>

              <button
                className="btn btn-success"
                onClick={reservar}
              >
                Reservar
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
