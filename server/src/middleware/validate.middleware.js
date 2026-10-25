const { sendError } = require('../utils/apiResponse');

/**
 * Validate that required fields exist in req.body.
 * Usage: validateFields(['name', 'email', 'password'])
 */
const validateFields = (fields) => {
  return (req, res, next) => {
    const missing = fields.filter(
      (f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === ''
    );

    if (missing.length > 0) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}.`);
    }

    next();
  };
};

module.exports = { validateFields };
