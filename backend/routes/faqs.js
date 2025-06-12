const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all FAQs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = `SELECT f.*, u.full_name as created_by_name 
                 FROM faqs f 
                 LEFT JOIN users u ON f.created_by = u.id 
                 WHERE f.is_active = true`;
    let params = [];

    if (category) {
      query += ' AND f.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (f.question LIKE ? OR f.answer LIKE ? OR JSON_SEARCH(f.keywords, "one", ?) IS NOT NULL)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }    query += ' ORDER BY f.popularity_score DESC, f.created_at DESC';

    const faqs = await db.query(query, params);

    res.json({
      success: true,
      data: faqs
    });

  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get FAQ by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const faqs = await db.query(
      `SELECT f.*, u.full_name as created_by_name 
       FROM faqs f 
       LEFT JOIN users u ON f.created_by = u.id 
       WHERE f.id = ? AND f.is_active = true`,
      [req.params.id]
    );

    if (faqs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    // Increment popularity score
    await db.query(
      'UPDATE faqs SET popularity_score = popularity_score + 1 WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      data: faqs[0]
    });

  } catch (error) {
    console.error('Get FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new FAQ (Admin only)
router.post('/', authenticateToken, authorizeAdmin, [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('answer').trim().notEmpty().withMessage('Answer is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('keywords').isArray().withMessage('Keywords must be an array')
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

    const { question, answer, category, keywords } = req.body;    const result = await db.query(
      `INSERT INTO faqs (question, answer, category, keywords, created_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [question, answer, category, JSON.stringify(keywords), req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: {
        id: result.insertId || result.length,
        question,
        answer,
        category,
        keywords
      }
    });

  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update FAQ (Admin only)
router.put('/:id', authenticateToken, authorizeAdmin, [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('answer').trim().notEmpty().withMessage('Answer is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('keywords').isArray().withMessage('Keywords must be an array')
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

    const { question, answer, category, keywords } = req.body;    const result = await db.query(
      `UPDATE faqs SET question = ?, answer = ?, category = ?, keywords = ?
       WHERE id = ? AND is_active = true`,
      [question, answer, category, JSON.stringify(keywords), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.json({
      success: true,
      message: 'FAQ updated successfully'
    });

  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete FAQ (Admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE faqs SET is_active = false WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    });

  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get FAQ categories
router.get('/categories/all', authenticateToken, async (req, res) => {
  try {
    const categories = await db.query(
      'SELECT DISTINCT category FROM faqs WHERE is_active = true ORDER BY category'
    );

    res.json({
      success: true,
      data: categories.map(row => row.category)
    });

  } catch (error) {
    console.error('Get FAQ categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
