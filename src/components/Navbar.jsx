import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '15px 5%', backgroundColor: '#fff', borderBottom: '1px solid #eee',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4a4ae2' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>MiRentaAPP</Link>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <Link to="/login" style={{ textDecoration: 'none', color: '#484848', fontWeight: '500' }}>
          Iniciar sesión
        </Link>
        <Link to="/register" style={{ 
          textDecoration: 'none', color: '#fff', backgroundColor: '#4a4ae2', 
          padding: '8px 20px', borderRadius: '8px', fontWeight: '500'
        }}>
          Registrarse
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;