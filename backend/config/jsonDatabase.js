// Development database fallback using JSON storage
// This is a temporary solution for testing when MySQL is not available

const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data');
const dbFile = path.join(dbPath, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

// Initialize database with sample data
const initializeDatabase = () => {
  const initialData = {
    users: [
      {
        id: 1,
        reg_no: 'AD/2024/0001',
        password: '$2a$10$9XYNuE.OgL8jY4uOC4xLx.D3Q2Y7yKJz1Y5Z2E3R4P6V8W9Q1X2Y3',
        user_type: 'admin',
        full_name: 'Campus Administrator',
        email: 'admin@novacore.edu',
        department: 'Administration',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        reg_no: 'SE/2024/0001',
        password: '$2a$10$9XYNuE.OgL8jY4uOC4xLx.D3Q2Y7yKJz1Y5Z2E3R4P6V8W9Q1X2Y3',
        user_type: 'student',
        full_name: 'John Doe',
        email: 'john.doe@student.novacore.edu',
        department: 'Computer Science',
        year_of_study: 2,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ],
    class_schedules: [
      {
        id: 1,
        class_name: 'CS-2A',
        subject: 'Data Structures',
        instructor: 'Dr. Smith',
        department: 'Computer Science',
        semester: '2024-Fall',
        day_of_week: 'Monday',
        start_time: '09:00:00',
        end_time: '10:30:00',
        room_number: '201',
        building: 'Engineering Block',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        class_name: 'CS-2A',
        subject: 'Database Systems',
        instructor: 'Prof. Johnson',
        department: 'Computer Science',
        semester: '2024-Fall',
        day_of_week: 'Tuesday',
        start_time: '11:00:00',
        end_time: '12:30:00',
        room_number: '305',
        building: 'Engineering Block',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        class_name: 'CS-2A',
        subject: 'Web Development',
        instructor: 'Dr. Brown',
        department: 'Computer Science',
        semester: '2024-Fall',
        day_of_week: 'Wednesday',
        start_time: '14:00:00',
        end_time: '15:30:00',
        room_number: '102',
        building: 'IT Block',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ],
    cafeteria_menus: [
      {
        id: 1,
        menu_date: new Date().toISOString().split('T')[0],
        meal_type: 'lunch',
        item_name: 'Chicken Biryani',
        description: 'Aromatic basmati rice with tender chicken pieces',
        price: 8.50,
        category: 'Main Course',
        is_vegetarian: false,
        is_available: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        menu_date: new Date().toISOString().split('T')[0],
        meal_type: 'lunch',
        item_name: 'Vegetable Biryani',
        description: 'Aromatic basmati rice with mixed vegetables',
        price: 7.00,
        category: 'Main Course',
        is_vegetarian: true,
        is_available: true,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        menu_date: new Date().toISOString().split('T')[0],
        meal_type: 'lunch',
        item_name: 'Caesar Salad',
        description: 'Fresh lettuce with caesar dressing and croutons',
        price: 5.50,
        category: 'Salads',
        is_vegetarian: true,
        is_available: true,
        created_at: new Date().toISOString()
      }
    ],
    bus_schedules: [
      {
        id: 1,
        route_name: 'City Center Route',
        bus_number: 'BUS-001',
        departure_location: 'University Main Gate',
        arrival_location: 'City Center Mall',
        departure_time: '08:00:00',
        arrival_time: '08:45:00',
        days_of_operation: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        fare: 2.50,
        capacity: 45,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        route_name: 'Airport Route',
        bus_number: 'BUS-002',
        departure_location: 'University Main Gate',
        arrival_location: 'International Airport',
        departure_time: '06:00:00',
        arrival_time: '07:30:00',
        days_of_operation: ['Friday', 'Sunday'],
        fare: 15.00,
        capacity: 35,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ],
    events: [
      {
        id: 1,
        title: 'Annual Tech Fest 2025',
        description: 'A grand celebration of technology and innovation',
        event_date: '2025-12-15',
        start_time: '09:00:00',
        end_time: '18:00:00',
        location: 'Main Auditorium',
        organizer: 'Student Council',
        department: 'Computer Science',
        event_type: 'Festival',
        registration_required: true,
        max_participants: 500,
        contact_email: 'techfest@novacore.edu',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Career Fair',
        description: 'Meet with top employers and explore career opportunities',
        event_date: '2025-11-20',
        start_time: '10:00:00',
        end_time: '16:00:00',
        location: 'Sports Complex',
        organizer: 'Career Services',
        department: 'All Departments',
        event_type: 'Career',
        registration_required: true,
        max_participants: 1000,
        contact_email: 'career@novacore.edu',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ],
    university_updates: [
      {
        id: 1,
        title: 'New Library Hours',
        content: 'The university library will now be open 24/7 during exam periods. Students can access study rooms and computer labs round the clock.',
        summary: 'Library now open 24/7 during exams',
        category: 'Facilities',
        priority: 'medium',
        target_audience: 'students',
        publish_date: new Date().toISOString().split('T')[0],
        is_published: true,
        created_by: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Semester Registration Open',
        content: 'Online registration for Fall 2025 semester is now open. Students must complete registration before the deadline.',
        summary: 'Fall 2025 registration is open',
        category: 'Academic',
        priority: 'high',
        target_audience: 'students',
        publish_date: new Date().toISOString().split('T')[0],
        is_published: true,
        created_by: 1,
        created_at: new Date().toISOString()
      }
    ],
    faqs: [
      {
        id: 1,
        question: 'What are the library opening hours?',
        answer: 'The library is open Monday to Friday from 8:00 AM to 10:00 PM, weekends from 9:00 AM to 6:00 PM. During exam periods, it operates 24/7.',
        category: 'Facilities',
        keywords: ['library', 'hours', 'timings'],
        popularity_score: 0,
        is_active: true,
        created_by: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        question: 'How do I access the university WiFi?',
        answer: 'Connect to "NovaCore-Student" network and use your student registration number as username and your date of birth (DDMMYYYY) as password.',
        category: 'Technology',
        keywords: ['wifi', 'internet', 'network', 'password'],
        popularity_score: 0,
        is_active: true,
        created_by: 1,
        created_at: new Date().toISOString()
      }
    ],
    chat_sessions: [],
    chat_messages: []
  };

  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify(initialData, null, 2));
    console.log('Development database initialized with sample data');
  }
  
  return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
};

// JSON Database operations
const jsonDB = {
  read: () => {
    if (!fs.existsSync(dbFile)) {
      return initializeDatabase();
    }
    return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  },
  
  write: (data) => {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
  },
  
  query: (table, filters = {}) => {
    const data = jsonDB.read();
    let results = data[table] || [];
    
    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        results = results.filter(item => {
          if (Array.isArray(filters[key])) {
            return filters[key].includes(item[key]);
          }
          return item[key] === filters[key];
        });
      }
    });
    
    return results;
  },
  
  insert: (table, record) => {
    const data = jsonDB.read();
    if (!data[table]) data[table] = [];
    
    // Generate ID
    const maxId = data[table].length > 0 ? Math.max(...data[table].map(r => r.id || 0)) : 0;
    record.id = maxId + 1;
    record.created_at = new Date().toISOString();
    record.updated_at = new Date().toISOString();
    
    data[table].push(record);
    jsonDB.write(data);
    
    return record;
  },
  
  update: (table, id, updates) => {
    const data = jsonDB.read();
    const index = data[table].findIndex(r => r.id === parseInt(id));
    
    if (index !== -1) {
      data[table][index] = { ...data[table][index], ...updates, updated_at: new Date().toISOString() };
      jsonDB.write(data);
      return data[table][index];
    }
    
    return null;
  },
  
  delete: (table, id) => {
    const data = jsonDB.read();
    const index = data[table].findIndex(r => r.id === parseInt(id));
    
    if (index !== -1) {
      const deleted = data[table].splice(index, 1)[0];
      jsonDB.write(data);
      return deleted;
    }
    
    return null;
  }
};

// Initialize database on require
initializeDatabase();

module.exports = { jsonDB, initializeDatabase };
