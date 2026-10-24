/**
 * Returns the correct dashboard path for a given user object.
 * Handles expert pending/rejected status before granting dashboard access.
 *
 * @param {object} user  - { role, status }
 * @returns {string} path to navigate to
 */
export const getRoleRedirect = (user) => {
  if (!user) return '/login';

  // Expert who hasn't been approved yet
  if (user.role === 'expert') {
    if (user.status === 'pending')  return '/pending-verification';
    if (user.status === 'rejected') return '/login'; // handled by Login.jsx with error msg
    if (user.status === 'active')   return '/expert/dashboard';
  }

  const map = {
    farmer: '/farmer/dashboard',
    buyer:  '/buyer/dashboard',
    admin:  '/admin/dashboard',
  };

  return map[user.role] || '/';
};
