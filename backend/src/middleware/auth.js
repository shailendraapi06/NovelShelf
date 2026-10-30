const jwt = require('jsonwebtoken');
const { Users } = require('../services/store');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to access this resource.'
      });
    }

    const secret = process.env.JWT_SECRET || 'novelshelf_super_secret_jwt_key_2026_literary_sanctuary';
    const decoded = jwt.verify(token, secret);

    const user = await Users.findById(decoded.id || decoded._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this session no longer exists.'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact library administration.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.'
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Archival administrative privileges required.'
    });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const secret = process.env.JWT_SECRET || 'novelshelf_super_secret_jwt_key_2026_literary_sanctuary';
      const decoded = jwt.verify(token, secret);
      const user = await Users.findById(decoded.id || decoded._id);
      if (user && user.status === 'active') {
        req.user = user;
      }
    }
  } catch {
    // optional, ignore errors
  }
  next();
};

module.exports = {
  authenticate,
  requireAdmin,
  optionalAuth
};

