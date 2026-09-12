const { sendError } = require('../utils/responseHandler');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces that req.user has one of the required roles
 * Usage: requireRole('INDUSTRY'), requireRole('STUDENT', 'ACADEMICIAN')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendError(res, 'Authentication required to access this resource.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. This action requires role: [${allowedRoles.join(', ')}]. Current role: [${req.user.role}].`,
        403
      );
    }

    next();
  };
}

module.exports = {
  requireRole
};
