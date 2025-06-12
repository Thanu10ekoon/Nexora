const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and is active
    const users = await db.query(
      'SELECT id, reg_no, user_type, full_name, is_active FROM users WHERE id = ? AND is_active = true',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

const authorizeStudent = (req, res, next) => {
  if (req.user.user_type !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Student access required'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorizeAdmin,
  authorizeStudent
};