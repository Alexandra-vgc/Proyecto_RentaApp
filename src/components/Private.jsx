import { Navigate } from 'react-router-dom';
import authService from '../services/authservice';

function PrivateRoute({ children }) {
  const isAuthenticated = authService.isAuthenticated();
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default PrivateRoute;