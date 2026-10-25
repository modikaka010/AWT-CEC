const User = require('../models/User');

/**
 * Role prefix mapping for Login ID generation.
 * Format: AV-{PREFIX}-{5-digit zero-padded sequence}
 * Example: AV-F-00001, AV-B-00003, AV-E-00002, AV-A-00001
 */
const ROLE_PREFIX = {
  farmer: 'F',
  buyer: 'B',
  expert: 'E',
  admin: 'A',
};

/**
 * Generate a unique login ID for a user based on their role.
 * Counts existing users of the same role to produce the next sequence number.
 *
 * @param {string} role - farmer | buyer | expert | admin
 * @returns {Promise<string>} e.g. "AV-F-00001"
 */
const generateLoginId = async (role) => {
  const prefix = ROLE_PREFIX[role];
  if (!prefix) {
    throw new Error(`Invalid role: ${role}`);
  }

  // Count users with the same role to determine sequence
  const count = await User.countDocuments({ role });
  const sequence = String(count + 1).padStart(5, '0');

  let loginId = `AV-${prefix}-${sequence}`;

  // Ensure uniqueness — handle race conditions
  let exists = await User.findOne({ loginId });
  let attempts = 0;
  while (exists && attempts < 10) {
    attempts++;
    const newCount = count + 1 + attempts;
    loginId = `AV-${prefix}-${String(newCount).padStart(5, '0')}`;
    exists = await User.findOne({ loginId });
  }

  if (exists) {
    throw new Error('Could not generate a unique login ID. Please try again.');
  }

  return loginId;
};

module.exports = { generateLoginId };
