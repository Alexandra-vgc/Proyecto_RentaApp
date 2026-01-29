import "./DepartmentCard.css";

const DepartmentCard = ({ dept }) => {
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

          <button className="btn-primary">Contactar</button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentCard;
