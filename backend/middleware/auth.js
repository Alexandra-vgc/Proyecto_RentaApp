import jwt from 'jsonwebtoken';

// Verificar que el usuario esté autenticado
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Guardamos la info del usuario en req
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Verificar que sea administrador
export const isAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Solo administradores' });
  }
  next();
};

// Verificar que sea usuario normal
export const isUser = (req, res, next) => {
  if (req.user.rol === 'admin' || req.user.rol === 'inquilino' || req.user.rol === 'propietario') {
    next();
  } else {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
};