const { validationResult } = require('express-validator');
const { sendError } = require('../utils/responseHandler');

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed for submitted data', 400, errors.array());
  }
  next();
}

module.exports = {
  validateRequest
};
