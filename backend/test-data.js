const { db } = require('./config/database');

async function populateTestData() {
  try {
    console.log('🌱 Populating test data...');

    // Create test admin user
    const adminExists = await db.query('SELECT * FROM users WHERE reg_no = ? AND user_type = ?', ['ADMIN001', 'admin']);
    if (adminExists.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db.query(
        'INSERT INTO users (reg_no, password, user_type, full_name, email, phone, department) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['ADMIN001', hashedPassword, 'admin', 'System Administrator', 'admin@novacore.edu', '+1234567890', 'Administration']
      );
      console.log('✅ Admin user created (ADMIN001 / admin123)');
    }

    // Create test student user
    const studentExists = await db.query('SELECT * FROM users WHERE reg_no = ? AND user_type = ?', ['STU001', 'student']);
    if (studentExists.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('student123', 10);
      
      await db.query(
        'INSERT INTO users (reg_no, password, user_type, full_name, email, phone, department, year_of_study) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['STU001', hashedPassword, 'student', 'John Doe', 'john.doe@student.novacore.edu', '+1234567891', 'Computer Science', 2]
      );
      console.log('✅ Student user created (STU001 / student123)');
    }

    // Add sample menu items
    const menuExists = await db.query('SELECT * FROM cafeteria_menus LIMIT 1');
    if (menuExists.length === 0) {
      const sampleMenus = [
        ['2025-06-10', 'breakfast', 'Pancakes with Syrup', 'Fluffy pancakes served with maple syrup', 5.99, 'main', false],
        ['2025-06-10', 'breakfast', 'Fresh Fruit Bowl', 'Mixed seasonal fruits', 3.99, 'healthy', true],
        ['2025-06-10', 'lunch', 'Chicken Caesar Salad', 'Grilled chicken breast with Caesar dressing', 8.99, 'salad', false],
        ['2025-06-10', 'lunch', 'Vegetable Curry', 'Spiced mixed vegetables with rice', 7.99, 'main', true],
        ['2025-06-10', 'dinner', 'Grilled Salmon', 'Atlantic salmon with lemon herbs', 12.99, 'main', false],
        ['2025-06-10', 'dinner', 'Pasta Primavera', 'Fresh vegetables with penne pasta', 9.99, 'main', true]
      ];

      for (const menu of sampleMenus) {
        await db.query(
          'INSERT INTO cafeteria_menus (menu_date, meal_type, item_name, description, price, category, is_vegetarian) VALUES (?, ?, ?, ?, ?, ?, ?)',
          menu
        );
      }
      console.log('✅ Sample menu items added');
    }

    // Add sample schedules
    const scheduleExists = await db.query('SELECT * FROM class_schedules LIMIT 1');
    if (scheduleExists.length === 0) {
      const sampleSchedules = [
        ['CS101-A', 'Introduction to Programming', 'Dr. Sarah Johnson', 'Computer Science', 'Fall 2025', 'Monday', '09:00:00', '10:30:00', '201', 'IT Block'],
        ['CS102-B', 'Data Structures', 'Prof. Michael Chen', 'Computer Science', 'Fall 2025', 'Tuesday', '11:00:00', '12:30:00', '202', 'IT Block'],
        ['MATH201', 'Calculus II', 'Dr. Emily Rodriguez', 'Mathematics', 'Fall 2025', 'Wednesday', '14:00:00', '15:30:00', '301', 'Science Building'],
        ['ENG101', 'Technical Writing', 'Prof. David Wilson', 'English', 'Fall 2025', 'Thursday', '10:00:00', '11:30:00', '105', 'Main Building'],
        ['CS201-A', 'Database Systems', 'Dr. Lisa Parker', 'Computer Science', 'Fall 2025', 'Friday', '13:00:00', '14:30:00', '203', 'IT Block']
      ];

      for (const schedule of sampleSchedules) {
        await db.query(
          'INSERT INTO class_schedules (class_name, subject, instructor, department, semester, day_of_week, start_time, end_time, room_number, building) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          schedule
        );
      }
      console.log('✅ Sample class schedules added');
    }

    // Add sample events
    const eventExists = await db.query('SELECT * FROM events LIMIT 1');
    if (eventExists.length === 0) {
      const sampleEvents = [
        ['Tech Symposium 2025', 'Annual technology conference featuring industry leaders', '2025-06-15', '09:00:00', '2025-06-15', '17:00:00', 'Main Auditorium', 'academic', 'all'],
        ['Summer Carnival', 'Fun-filled summer carnival with games, food, and entertainment', '2025-06-20', '15:00:00', '2025-06-20', '22:00:00', 'Campus Grounds', 'cultural', 'all'],
        ['Career Fair', 'Meet with top employers and explore career opportunities', '2025-06-25', '10:00:00', '2025-06-25', '16:00:00', 'Sports Complex', 'academic', 'students'],
        ['Alumni Meetup', 'Networking event for graduates and current students', '2025-06-30', '18:00:00', '2025-06-30', '21:00:00', 'Conference Hall', 'networking', 'all']
      ];

      for (const event of sampleEvents) {
        await db.query(
          'INSERT INTO events (title, description, start_date, start_time, end_date, end_time, location, category, target_audience) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          event
        );
      }
      console.log('✅ Sample events added');
    }

    // Add sample bus routes
    const busExists = await db.query('SELECT * FROM bus_schedules LIMIT 1');
    if (busExists.length === 0) {
      const sampleBuses = [
        ['Campus Shuttle A', 'Main Gate -> Library -> IT Block -> Cafeteria -> Main Gate', '07:00:00', '22:00:00', 15, 'daily'],
        ['Campus Shuttle B', 'Hostel -> Sports Complex -> Academic Block -> Hostel', '07:30:00', '21:30:00', 20, 'daily'],
        ['City Route 1', 'Campus -> City Center -> Mall -> Campus', '08:00:00', '20:00:00', 60, 'weekdays'],
        ['City Route 2', 'Campus -> Train Station -> Airport -> Campus', '06:00:00', '23:00:00', 45, 'daily']
      ];

      for (const bus of sampleBuses) {
        await db.query(
          'INSERT INTO bus_schedules (route_name, route_description, start_time, end_time, frequency_minutes, schedule_type) VALUES (?, ?, ?, ?, ?, ?)',
          bus
        );
      }
      console.log('✅ Sample bus schedules added');
    }

    // Add sample FAQs
    const faqExists = await db.query('SELECT * FROM faqs LIMIT 1');
    if (faqExists.length === 0) {
      const sampleFAQs = [
        ['How do I register for classes?', 'You can register for classes through the student portal during the registration period. Contact the registrar office for assistance.', 'academic', '["registration", "classes", "student portal"]'],
        ['What are the library hours?', 'The library is open Monday-Friday 8:00 AM to 10:00 PM, and weekends 10:00 AM to 6:00 PM.', 'facilities', '["library", "hours", "schedule"]'],
        ['How do I access the WiFi?', 'Connect to "NovaCore-Student" network using your student ID and password. For technical support, contact IT helpdesk.', 'technical', '["wifi", "internet", "network"]'],
        ['Where can I find campus maps?', 'Campus maps are available at the information desk, student center, and on the university website.', 'navigation', '["maps", "campus", "directions"]']
      ];

      for (const faq of sampleFAQs) {
        await db.query(
          'INSERT INTO faqs (question, answer, category, keywords) VALUES (?, ?, ?, ?)',
          faq
        );
      }
      console.log('✅ Sample FAQs added');
    }

    // Add sample university updates
    const updateExists = await db.query('SELECT * FROM university_updates LIMIT 1');
    if (updateExists.length === 0) {
      const sampleUpdates = [
        ['New Semester Registration Open', 'Registration for Fall 2025 semester is now open. Please complete your course registration by June 30th.', 'Quick reminder to register for Fall 2025 courses', 'academic', 'high', 'students', '2025-06-01', null],
        ['Campus WiFi Maintenance', 'WiFi services will be temporarily unavailable on June 12th from 2:00 AM to 4:00 AM for system maintenance.', 'Scheduled maintenance window', 'technical', 'medium', 'all', '2025-06-08', '2025-06-15'],
        ['Summer Festival Announcement', 'Join us for the annual summer festival on June 20th. Food, music, and fun activities for everyone!', 'Dont miss the summer celebration', 'events', 'medium', 'all', '2025-06-05', '2025-06-25'],
        ['Library Extended Hours', 'During exam period (June 15-30), library will be open 24/7 to support student studies.', 'Extended library access for exams', 'facilities', 'high', 'students', '2025-06-10', '2025-07-01']
      ];

      for (const update of sampleUpdates) {
        await db.query(
          'INSERT INTO university_updates (title, content, summary, category, priority, target_audience, publish_date, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          update
        );
      }
      console.log('✅ Sample university updates added');
    }

    console.log('🎉 Test data population completed successfully!');
    console.log('📋 Login credentials:');
    console.log('   Admin: ADMIN001 / admin123');
    console.log('   Student: STU001 / student123');
    
  } catch (error) {
    console.error('❌ Error populating test data:', error);
  } finally {
    process.exit(0);
  }
}

populateTestData();
