const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/apiResponse');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) return sendError(res, "Access denied. No token provided.", null, 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    return sendError(res, "Invalid token.", null, 400);
  }
};