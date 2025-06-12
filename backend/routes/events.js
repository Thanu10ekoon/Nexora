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

// Get all events
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { eventType, department, upcoming } = req.query;
    
    let query = 'SELECT * FROM events WHERE is_active = true';
    let params = [];

    if (eventType) {
      query += ' AND event_type = ?';
      params.push(eventType);
    }

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }

    if (upcoming === 'true') {
      query += ' AND event_date >= CURDATE()';
    }    query += ' ORDER BY event_date ASC, start_time ASC';

    const events = await db.query(query, params);

    res.json({
      success: true,
      data: events
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get event by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {    const events = await db.query(
      'SELECT * FROM events WHERE id = ? AND is_active = true',
      [req.params.id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: events[0]
    });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new event (Admin only)
router.post('/', authenticateToken, authorizeAdmin, [
  body('title').trim().notEmpty().withMessage('Event title is required'),
  body('eventDate').isDate().withMessage('Valid event date is required'),
  body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Invalid start time format (use HH:MM or HH:MM:SS)'),
  body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Invalid end time format (use HH:MM or HH:MM:SS)'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('organizer').trim().notEmpty().withMessage('Organizer is required'),
  body('eventType').trim().notEmpty().withMessage('Event type is required'),
  body('registrationRequired').isBoolean().withMessage('Registration required must be boolean')
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
      description,
      eventDate,
      startTime,
      endTime,
      location,
      organizer,
      department,
      eventType,
      registrationRequired,
      maxParticipants,
      contactEmail,
      contactPhone
    } = req.body;    const result = await db.query(
      `INSERT INTO events 
       (title, description, event_date, start_time, end_time, location, organizer, department, event_type, registration_required, max_participants, contact_email, contact_phone) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, eventDate, formatTime(startTime), formatTime(endTime), location, organizer, department, eventType, registrationRequired, maxParticipants, contactEmail, contactPhone]
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        id: result.insertId || result.length,
        title,
        description,
        eventDate,
        startTime,
        endTime,
        location,
        organizer,
        department,
        eventType,
        registrationRequired,
        maxParticipants,
        contactEmail,
        contactPhone
      }
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update event (Admin only)
router.put('/:id', authenticateToken, authorizeAdmin, [
  body('title').trim().notEmpty().withMessage('Event title is required'),
  body('eventDate').isDate().withMessage('Valid event date is required'),
  body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Invalid start time format (use HH:MM or HH:MM:SS)'),
  body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Invalid end time format (use HH:MM or HH:MM:SS)'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('organizer').trim().notEmpty().withMessage('Organizer is required'),
  body('eventType').trim().notEmpty().withMessage('Event type is required'),
  body('registrationRequired').isBoolean().withMessage('Registration required must be boolean')
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
      description,
      eventDate,
      startTime,
      endTime,
      location,
      organizer,
      department,
      eventType,
      registrationRequired,
      maxParticipants,
      contactEmail,
      contactPhone
    } = req.body;    const result = await db.query(
      `UPDATE events SET 
       title = ?, description = ?, event_date = ?, start_time = ?, end_time = ?, 
       location = ?, organizer = ?, department = ?, event_type = ?, registration_required = ?, 
       max_participants = ?, contact_email = ?, contact_phone = ?
       WHERE id = ? AND is_active = true`,
      [title, description, eventDate, formatTime(startTime), formatTime(endTime), location, organizer, department, eventType, registrationRequired, maxParticipants, contactEmail, contactPhone, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event updated successfully'
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete event (Admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {  try {
    const result = await db.query(
      'UPDATE events SET is_active = false WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
