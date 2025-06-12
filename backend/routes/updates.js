const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all university updates
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, priority, targetAudience } = req.query;
    
    let query = `SELECT u.*, us.full_name as created_by_name 
                 FROM university_updates u 
                 LEFT JOIN users us ON u.created_by = us.id 
                 WHERE u.is_published = true`;
    let params = [];

    if (category) {
      query += ' AND u.category = ?';
      params.push(category);
    }

    if (priority) {
      query += ' AND u.priority = ?';
      params.push(priority);
    }

    if (targetAudience) {
      query += ' AND (u.target_audience = ? OR u.target_audience = "all")';
      params.push(targetAudience);
    }

    // Only show current updates (not expired)
    query += ' AND (u.expiry_date IS NULL OR u.expiry_date >= CURDATE())';
    query += ' ORDER BY u.priority DESC, u.publish_date DESC';

    const updates = await db.query(query, params);

    res.json({
      success: true,
      data: updates
    });

  } catch (error) {
    console.error('Get updates error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get update by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const updates = await db.query(
      `SELECT u.*, us.full_name as created_by_name 
       FROM university_updates u 
       LEFT JOIN users us ON u.created_by = us.id 
       WHERE u.id = ? AND u.is_published = true`,
      [req.params.id]
    );

    if (updates.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Update not found'
      });
    }

    res.json({
      success: true,
      data: updates[0]
    });

  } catch (error) {
    console.error('Get update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new university update (Admin only)
router.post('/', authenticateToken, authorizeAdmin, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('targetAudience').isIn(['all', 'students', 'faculty', 'staff']).withMessage('Invalid target audience'),
  body('publishDate').isDate().withMessage('Valid publish date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      content,
      summary,
      category,
      priority,
      targetAudience,
      publishDate,
      expiryDate
    } = req.body;    const result = await db.query(
      `INSERT INTO university_updates 
       (title, content, summary, category, priority, target_audience, publish_date, expiry_date, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, content, summary, category, priority, targetAudience, publishDate, expiryDate, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'University update created successfully',
      data: {
        id: result.insertId || result.length,
        title,
        content,
        summary,
        category,
        priority,
        targetAudience,
        publishDate,
        expiryDate
      }
    });

  } catch (error) {
    console.error('Create update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update university update (Admin only)
router.put('/:id', authenticateToken, authorizeAdmin, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('targetAudience').isIn(['all', 'students', 'faculty', 'staff']).withMessage('Invalid target audience'),
  body('publishDate').isDate().withMessage('Valid publish date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      content,
      summary,
      category,
      priority,
      targetAudience,
      publishDate,
      expiryDate
    } = req.body;    const result = await db.query(
      `UPDATE university_updates SET 
       title = ?, content = ?, summary = ?, category = ?, priority = ?, 
       target_audience = ?, publish_date = ?, expiry_date = ?
       WHERE id = ? AND is_published = true`,
      [title, content, summary, category, priority, targetAudience, publishDate, expiryDate, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Update not found'
      });
    }

    res.json({
      success: true,
      message: 'University update updated successfully'
    });

  } catch (error) {
    console.error('Update update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete university update (Admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE university_updates SET is_published = false WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Update not found'
      });
    }

    res.json({
      success: true,
      message: 'University update deleted successfully'
    });

  } catch (error) {
    console.error('Delete update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
