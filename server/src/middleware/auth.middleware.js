const { verifyToken } = require('../utils/generateToken');
const { sendError } = require('../utils/apiResponse');

/**
 * Protect routes — verify JWT and attach decoded user to req.user.
 */
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    req.user = decoded; // { id, role, status, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Session expired. Please login again.');
    }
    return sendError(res, 401, 'Invalid token. Please login again.');
  }
};

module.exports = { protect };
