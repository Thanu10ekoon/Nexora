const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Get cafeteria menus
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { date, mealType, category } = req.query;
    
    let query = 'SELECT * FROM cafeteria_menus WHERE is_available = true';
    let params = [];    if (date) {
      query += ' AND menu_date = ?';
      params.push(date);
    }
    // No default date restriction - show all available menus

    if (mealType) {
      query += ' AND meal_type = ?';
      params.push(mealType);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY meal_type, category, item_name';

    const menus = await db.query(query, params);

    res.json({
      success: true,
      data: menus
    });

  } catch (error) {
    console.error('Get menus error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get menu by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const menus = await db.query(
      'SELECT * FROM cafeteria_menus WHERE id = ? AND is_available = true',
      [req.params.id]
    );

    if (menus.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      data: menus[0]
    });

  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new menu item (Admin only)
router.post('/', authenticateToken, authorizeAdmin, [
  body('menuDate').isDate().withMessage('Valid menu date is required'),
  body('mealType').isIn(['breakfast', 'lunch', 'dinner', 'snacks']).withMessage('Invalid meal type'),
  body('itemName').trim().notEmpty().withMessage('Item name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('isVegetarian').isBoolean().withMessage('Vegetarian status must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }    const {
      menuDate,
      mealType,
      itemName,
      description,
      price,
      category,
      isVegetarian
    } = req.body;

    const result = await db.query(
      `INSERT INTO cafeteria_menus 
       (menu_date, meal_type, item_name, description, price, category, is_vegetarian) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [menuDate, mealType, itemName, description || null, price, category, isVegetarian]
    );

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: {
        id: result.insertId || result.length,
        menuDate,
        mealType,
        itemName,
        description,
        price,
        category,
        isVegetarian
      }
    });

  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update menu item (Admin only)
router.put('/:id', authenticateToken, authorizeAdmin, [
  body('menuDate').isDate().withMessage('Valid menu date is required'),
  body('mealType').isIn(['breakfast', 'lunch', 'dinner', 'snacks']).withMessage('Invalid meal type'),
  body('itemName').trim().notEmpty().withMessage('Item name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('isVegetarian').isBoolean().withMessage('Vegetarian status must be boolean')
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
      menuDate,
      mealType,
      itemName,
      description,
      price,
      category,
      isVegetarian
    } = req.body;    const result = await db.query(
      `UPDATE cafeteria_menus SET 
       menu_date = ?, meal_type = ?, item_name = ?, description = ?, 
       price = ?, category = ?, is_vegetarian = ?
       WHERE id = ? AND is_available = true`,
      [menuDate, mealType, itemName, description, price, category, isVegetarian, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu item updated successfully'
    });

  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete menu item (Admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE cafeteria_menus SET is_available = false WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });

  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get meal types
router.get('/types/all', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: ['breakfast', 'lunch', 'dinner', 'snacks']
    });
  } catch (error) {
    console.error('Get meal types error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
