const { sendError } = require('../utils/apiResponse');

/**
 * Restrict access to specific roles.
 * Usage: authorizeRoles('admin', 'farmer')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. This route is restricted to: ${roles.join(', ')}.`
      );
    }

    next();
  };
};

/**
 * Block pending/rejected/suspended accounts from accessing protected resources.
 * Use after protect() and authorizeRoles().
 */
const requireActiveStatus = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 401, 'Authentication required.');
  }

  if (req.user.status === 'suspended') {
    return sendError(res, 403, 'Your account has been suspended. Please contact support.');
  }

  if (req.user.status === 'pending') {
    return sendError(res, 403, 'Your account is pending verification. Please wait for admin approval.');
  }

  if (req.user.status === 'rejected') {
    return sendError(res, 403, 'Your account application was rejected. Please contact support.');
  }

  next();
};

module.exports = { authorizeRoles, requireActiveStatus };
