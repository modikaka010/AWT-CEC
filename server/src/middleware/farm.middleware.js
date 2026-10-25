const Farm = require('../models/Farm');
const { sendError } = require('../utils/apiResponse');

/**
 * Require the authenticated farmer to have created at least one farm.
 * Use after protect() + authorizeRoles('farmer').
 */
const requireFarm = async (req, res, next) => {
  try {
    const hasFarm = await Farm.exists({ farmer: req.user.id });
    if (!hasFarm) {
      return res.status(403).json({
        success: false,
        code: 'FARM_REQUIRED',
        message: 'Please create your farm before accessing this resource.',
      });
    }
    next();
  } catch (err) {
    console.error('requireFarm error:', err);
    return sendError(res, 500, 'Failed to verify farm setup.');
  }
};

module.exports = { requireFarm };
