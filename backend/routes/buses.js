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

// Get all bus schedules
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { route, day } = req.query;
    
    let query = 'SELECT * FROM bus_schedules WHERE is_active = true';
    let params = [];

    if (route) {
      query += ' AND route_name LIKE ?';
      params.push(`%${route}%`);
    }    query += ' ORDER BY departure_time';

    const schedules = await db.query(query, params);

    // Filter by day if specified
    let filteredSchedules = schedules;
    if (day) {
      filteredSchedules = schedules.filter(schedule => {
        const daysOfOperation = JSON.parse(schedule.days_of_operation);
        return daysOfOperation.includes(day);
      });
    }

    res.json({
      success: true,
      data: filteredSchedules
    });

  } catch (error) {
    console.error('Get bus schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get bus schedule by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const schedules = await db.query(
      'SELECT * FROM bus_schedules WHERE id = ? AND is_active = true',
      [req.params.id]
    );

    if (schedules.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bus schedule not found'
      });
    }

    res.json({
      success: true,
      data: schedules[0]
    });

  } catch (error) {
    console.error('Get bus schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new bus schedule (Admin only)
router.post('/', authenticateToken, authorizeAdmin, [
  body('routeName').trim().notEmpty().withMessage('Route name is required'),
  body('busNumber').trim().notEmpty().withMessage('Bus number is required'),
  body('departureLocation').trim().notEmpty().withMessage('Departure location is required'),
  body('arrivalLocation').trim().notEmpty().withMessage('Arrival location is required'),
  body('departureTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Invalid departure time format (HH:MM or HH:MM:SS)'),
  body('arrivalTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Invalid arrival time format (HH:MM or HH:MM:SS)'),
  body('daysOfOperation').isArray().withMessage('Days of operation must be an array'),
  body('fare').isFloat({ min: 0 }).withMessage('Valid fare is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Valid capacity is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors for buses POST:', errors.array());
      console.log('Request body:', req.body);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      routeName,
      busNumber,
      departureLocation,
      arrivalLocation,
      departureTime,
      arrivalTime,
      daysOfOperation,
      fare,
      capacity
    } = req.body;    const result = await db.query(
      `INSERT INTO bus_schedules 
       (route_name, bus_number, departure_location, arrival_location, departure_time, arrival_time, days_of_operation, fare, capacity) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [routeName, busNumber, departureLocation, arrivalLocation, formatTime(departureTime), formatTime(arrivalTime), JSON.stringify(daysOfOperation), fare, capacity]
    );

    res.status(201).json({
      success: true,
      message: 'Bus schedule created successfully',
      data: {
        id: result.insertId || result.length,
        routeName,
        busNumber,
        departureLocation,
        arrivalLocation,
        departureTime,
        arrivalTime,
        daysOfOperation,
        fare,
        capacity
      }
    });

  } catch (error) {
    console.error('Create bus schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update bus schedule (Admin only)
router.put('/:id', authenticateToken, authorizeAdmin, [
  body('routeName').trim().notEmpty().withMessage('Route name is required'),
  body('busNumber').trim().notEmpty().withMessage('Bus number is required'),
  body('departureLocation').trim().notEmpty().withMessage('Departure location is required'),
  body('arrivalLocation').trim().notEmpty().withMessage('Arrival location is required'),
  body('departureTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Invalid departure time format (use HH:MM or HH:MM:SS)'),
  body('arrivalTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Invalid arrival time format (use HH:MM or HH:MM:SS)'),
  body('daysOfOperation').isArray().withMessage('Days of operation must be an array'),
  body('fare').isFloat({ min: 0 }).withMessage('Valid fare is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Valid capacity is required')
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
      routeName,
      busNumber,
      departureLocation,
      arrivalLocation,
      departureTime,
      arrivalTime,
      daysOfOperation,
      fare,
      capacity
    } = req.body;    const result = await db.query(
      `UPDATE bus_schedules SET 
       route_name = ?, bus_number = ?, departure_location = ?, arrival_location = ?, 
       departure_time = ?, arrival_time = ?, days_of_operation = ?, fare = ?, capacity = ?
       WHERE id = ? AND is_active = true`,
      [routeName, busNumber, departureLocation, arrivalLocation, formatTime(departureTime), formatTime(arrivalTime), JSON.stringify(daysOfOperation), fare, capacity, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bus schedule not found'
      });
    }

    res.json({
      success: true,
      message: 'Bus schedule updated successfully'
    });

  } catch (error) {
    console.error('Update bus schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete bus schedule (Admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE bus_schedules SET is_active = false WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bus schedule not found'
      });
    }

    res.json({
      success: true,
      message: 'Bus schedule deleted successfully'
    });

  } catch (error) {
    console.error('Delete bus schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
