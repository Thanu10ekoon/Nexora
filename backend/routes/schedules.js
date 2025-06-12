const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Helper function to ensure time is in HH:MM:SS format
const formatTime = (timeString) => {
  if (!timeString) return timeString;
  // If time is already HH:MM:SS, return as is
  if (timeString.split(':').length === 3) return timeString;
  // If time is HH:MM, add :00
  if (timeString.split(':').length === 2) return timeString + ':00';
  return timeString;
};

// Get all class schedules
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { department, semester, day } = req.query;
    
    let query = 'SELECT * FROM class_schedules WHERE is_active = true';
    let params = [];

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }

    if (semester) {
      query += ' AND semester = ?';
      params.push(semester);
    }

    if (day) {
      query += ' AND day_of_week = ?';
      params.push(day);
    }    query += ' ORDER BY day_of_week, start_time';

    const schedules = await db.query(query, params);

    res.json({
      success: true,
      data: schedules
    });

  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get schedule by ID
router.get('/:id', authenticateToken, async (req, res) => {  try {
    const schedules = await db.query(
      'SELECT * FROM class_schedules WHERE id = ? AND is_active = true',
      [req.params.id]
    );

    if (schedules.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      data: schedules[0]
    });

  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new class schedule (Admin only)
router.post('/', authenticateToken, authorizeAdmin, [
  body('className').trim().notEmpty().withMessage('Class name is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('instructor').trim().notEmpty().withMessage('Instructor is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('semester').trim().notEmpty().withMessage('Semester is required'),
  body('dayOfWeek').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Invalid day of week'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Invalid start time format (HH:MM or HH:MM:SS)'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Invalid end time format (HH:MM or HH:MM:SS)'),
  body('roomNumber').trim().notEmpty().withMessage('Room number is required'),
  body('building').trim().notEmpty().withMessage('Building is required')
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
      className,
      subject,
      instructor,
      department,
      semester,
      dayOfWeek,
      startTime,
      endTime,
      roomNumber,
      building
    } = req.body;    const result = await db.query(
      `INSERT INTO class_schedules 
       (class_name, subject, instructor, department, semester, day_of_week, start_time, end_time, room_number, building) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [className, subject, instructor, department, semester, dayOfWeek, formatTime(startTime), formatTime(endTime), roomNumber, building]
    );

    res.status(201).json({
      success: true,
      message: 'Class schedule created successfully',
      data: {
        id: result.insertId || result.length,
        className,
        subject,
        instructor,
        department,
        semester,
        dayOfWeek,
        startTime,
        endTime,
        roomNumber,
        building
      }
    });

  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update class schedule (Admin only)
router.put('/:id', authenticateToken, authorizeAdmin, [
  body('className').trim().notEmpty().withMessage('Class name is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('instructor').trim().notEmpty().withMessage('Instructor is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('semester').trim().notEmpty().withMessage('Semester is required'),
  body('dayOfWeek').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Invalid day of week'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Invalid start time format (HH:MM or HH:MM:SS)'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Invalid end time format (HH:MM or HH:MM:SS)'),
  body('roomNumber').trim().notEmpty().withMessage('Room number is required'),
  body('building').trim().notEmpty().withMessage('Building is required')
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
      className,
      subject,
      instructor,
      department,
      semester,
      dayOfWeek,
      startTime,
      endTime,
      roomNumber,
      building
    } = req.body;    const result = await db.query(
      `UPDATE class_schedules SET 
       class_name = ?, subject = ?, instructor = ?, department = ?, semester = ?, 
       day_of_week = ?, start_time = ?, end_time = ?, room_number = ?, building = ?
       WHERE id = ? AND is_active = true`,
      [className, subject, instructor, department, semester, dayOfWeek, formatTime(startTime), formatTime(endTime), roomNumber, building, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      message: 'Class schedule updated successfully'
    });

  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete class schedule (Admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE class_schedules SET is_active = false WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      message: 'Class schedule deleted successfully'
    });

  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
