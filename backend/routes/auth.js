const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { db, jsonDB } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Registration validation
const registerValidation = [
  body('regNo')
    .notEmpty()
    .withMessage('Registration number is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name is required'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('department')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Department is required')
];

// Login validation
const loginValidation = [
  body('regNo')
    .notEmpty()
    .withMessage('Registration number is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Register endpoint
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }    const { regNo, password, fullName, email, phone, department, yearOfStudy } = req.body;

    // Check if user already exists
    const existingUsers = await db.query(
      'SELECT id FROM users WHERE reg_no = ? OR email = ?',
      [regNo, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this registration number or email already exists'
      });
    }

    // Determine user type from registration number
    const userType = regNo.startsWith('SE/') ? 'student' : 'admin';

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const result = await db.query(
      `INSERT INTO users (reg_no, password, user_type, full_name, email, phone, department, year_of_study) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [regNo, hashedPassword, userType, fullName, email, phone || null, department, yearOfStudy || null]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: result.insertId, 
        regNo: regNo, 
        userType: userType 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: result.insertId,
          regNo,
          userType,
          fullName,
          email,
          department
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// Login endpoint
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }    const { regNo, password } = req.body;

    // Find user by registration number
    const users = await db.query(
      'SELECT * FROM users WHERE reg_no = ? AND is_active = true',
      [regNo]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        regNo: user.reg_no, 
        userType: user.user_type 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          regNo: user.reg_no,
          userType: user.user_type,
          fullName: user.full_name,
          email: user.email,
          department: user.department,
          yearOfStudy: user.year_of_study
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const users = await db.query(
      'SELECT id, reg_no, user_type, full_name, email, phone, department, year_of_study, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});

module.exports = router;
