import { useState } from "react";
import { Link } from "react-router-dom";

const properties = [
  {
    id: 1,
    type: "Departamento",
    price: 1000,
    title: "Departamento Amoblado en Alquiler",
    location: "Urbanización San Sebastián, Samborondón",
    city: "Guayaquil",
    details: "148 m² · 3 hab · 2 baños · 1 estac",
    image: "/imagenes/dep1.jpg",
  },
  {
    id: 2,
    type: "Departamento",
    price: 2100,
    title: "Departamento de Lujo",
    location: "Puerto Santa Ana",
    city: "Guayaquil",
    details: "180 m² · 3 hab · 3 baños · 3 estac",
    image: "/imagenes/dep2.jpg",
  },
];

export default function PublicHome() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("Todos");

  // 🔥 NUEVOS ESTADOS PARA PRECIO
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [showPrice, setShowPrice] = useState(false);

  // ✅ FILTRO UNIDO + PRECIO
  const filteredProperties = properties.filter((p) => {
    const searchText = search.trim().toLowerCase();

    const matchesCity = p.city.toLowerCase().includes(searchText);
    const matchesLocation = p.location.toLowerCase().includes(searchText);
    const matchesTitle = p.title.toLowerCase().includes(searchText);
    const matchesType = type === "Todos" || p.type === type;

    const matchesPriceFrom =
      priceFrom === "" || p.price >= Number(priceFrom);
    const matchesPriceTo =
      priceTo === "" || p.price <= Number(priceTo);

    return (
      (matchesCity || matchesLocation || matchesTitle) &&
      matchesType &&
      matchesPriceFrom &&
      matchesPriceTo
    );
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F1F5F3",
        paddingBottom: "60px",
      }}
    >
      <div className="container pt-4">

        {/* 🔍 FILTROS */}
        <div
          className="row mb-4 p-4 rounded-4"
          style={{
            background: "#DCE7E2",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="Buscar por ciudad, ubicación o tipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                borderRadius: "10px",
                border: "1px solid #8FAEA2",
              }}
            />
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ borderRadius: "10px" }}
            >
              <option value="Todos">Todos</option>
              <option value="Departamento">Departamento</option>
              <option value="Casa">Casa</option>
            </select>
          </div>

          <div className="col-md-2">
            <select className="form-select" style={{ borderRadius: "10px" }}>
              <option>Alquilar</option>
              <option>Comprar</option>
            </select>
          </div>

          {/* 💲 PRECIO DESPLEGABLE */}
          <div className="col-md-2 position-relative">
            <button
              className="form-select text-start"
              style={{ borderRadius: "10px" }}
              onClick={() => setShowPrice(!showPrice)}
            >
              Precio
            </button>

            {showPrice && (
              <div
                className="position-absolute p-3 rounded-4"
                style={{
                  top: "45px",
                  left: 0,
                  width: "220px",
                  background: "#ffffff",
                  boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
                  zIndex: 10,
                }}
              >
                <input
                  type="number"
                  className="form-control mb-2"
                  placeholder="Desde"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="Hasta"
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="col-md-3 d-flex gap-2">
            <button className="btn btn-outline-secondary w-100">
              Más filtros
            </button>
            <button
              className="btn w-100"
              style={{
                background: "#3E5E58",
                color: "#fff",
                fontWeight: "600",
              }}
            >
              Crear alerta
            </button>
          </div>
        </div>

        {/* 📊 RESULTADOS */}
        <p className="fw-semibold mb-3" style={{ color: "#3E5E58" }}>
          {filteredProperties.length} resultados encontrados
        </p>

        {/* ❌ SIN RESULTADOS */}
        {filteredProperties.length === 0 && (
          <div className="alert alert-warning">
            No se encontraron propiedades con esos filtros
          </div>
        )}

        {/* 🏠 CARDS */}
        {filteredProperties.map((p) => (
          <div
            key={p.id}
            className="mb-4 rounded-4"
            style={{
              background: "#ffffff",
              border: "1px solid #DCE7E2",
              boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
              transition: "all .35s ease",
            }}
          >
            <div className="row g-0 align-items-center">

              <div className="col-md-4">
                <img
                  src={p.image}
                  alt={p.title}
                  style={{
                    width: "100%",
                    height: "240px",
                    objectFit: "cover",
                    borderRadius: "16px 0 0 16px",
                  }}
                />
              </div>

              <div className="col-md-8 p-4">
                <small className="text-uppercase text-muted fw-semibold">
                  {p.city}
                </small>

                <h6 className="fw-semibold mt-1">
                  {p.location}
                </h6>

                <h5 style={{ color: "#3E5E58", fontWeight: "700" }}>
                  USD {p.price.toLocaleString()}
                </h5>

                <p className="small text-muted">{p.details}</p>

                <div className="d-flex gap-2 flex-wrap mt-3">
                  <Link
                    to={`/property/${p.id}`}
                    className="btn btn-outline-secondary"
                  >
                    Ver detalles
                  </Link>

                  <a
                    href="https://wa.me/593999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                      background: "#5F7F78",
                      color: "#fff",
                      fontWeight: "600",
                    }}
                  >
                    WhatsApp
                  </a>

                  <Link
                    to="/login"
                    className="btn"
                    style={{
                      background: "#3E5E58",
                      color: "#fff",
                      fontWeight: "600",
                    }}
                  >
                    Contactar
                  </Link>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}