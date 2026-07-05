// Middleware de autenticacion (JWT) y control de roles.
const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }
}

// Uso: soloRol('Dueno'), soloRol('Dueno', 'Admin')
function soloRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para esta accion' });
    }
    next();
  };
}

module.exports = { verificarToken, soloRol };
