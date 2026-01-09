/**
 * Admin Panel Authentication Middleware
 * Handles session-based authentication for admin panel
 */

/**
 * Check if user is authenticated via session
 */
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return next();
  }
  req.flash('error', 'Please login to access the admin panel');
  res.redirect('/admin/login');
};

/**
 * Redirect if already logged in
 */
const isGuest = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return res.redirect('/admin/dashboard');
  }
  next();
};

/**
 * Attach user data to all views
 */
const attachUser = async (req, res, next) => {
  res.locals.isAuthenticated = !!req.session.adminId;
  res.locals.adminUser = req.session.admin || null;
  res.locals.currentPath = req.path;
  next();
};

module.exports = {
  isAuthenticated,
  isGuest,
  attachUser
};