/**
 * Mock Backend Service for Chatbot Development
 * This file provides mock responses for chatbot testing
 * Replace with actual backend integration when ready
 */

export class MockChatbotBackend {
  constructor() {
    this.sessions = new Map();
  }

  // Mock API responses for testing
  async mockAPICall(endpoint, params = {}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    switch (endpoint) {
      case '/schedules':
        return this.getMockSchedules(params);
      case '/menus':
        return this.getMockMenus(params);
      case '/buses':
        return this.getMockBuses(params);
      case '/events':
        return this.getMockEvents(params);
      case '/updates':
        return this.getMockUpdates(params);
      case '/faqs':
        return this.getMockFAQs(params);
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }
  }

  getMockSchedules(params) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    const schedules = [
      {
        id: 1,
        subject: 'Computer Science 101',
        instructor: 'Dr. Smith',
        room_number: 'A101',
        building: 'CS Building',
        day_of_week: today,
        start_time: '09:00',
        end_time: '10:30',
        semester: '2025 Spring'
      },
      {
        id: 2,
        subject: 'Mathematics 201',
        instructor: 'Prof. Johnson',
        room_number: 'B205',
        building: 'Math Building',
        day_of_week: today,
        start_time: '11:00',
        end_time: '12:30',
        semester: '2025 Spring'
      },
      {
        id: 3,
        subject: 'Physics 301',
        instructor: 'Dr. Brown',
        room_number: 'C301',
        building: 'Science Building',
        day_of_week: today,
        start_time: '14:00',
        end_time: '15:30',
        semester: '2025 Spring'
      }
    ];

    // Filter by subject if specified
    if (params.subject) {
      return schedules.filter(s => 
        s.subject.toLowerCase().includes(params.subject.toLowerCase())
      );
    }

    return schedules;
  }

  getMockMenus(params) {
    const menus = [
      {
        id: 1,
        menu_date: new Date().toISOString().split('T')[0],
        meal_type: 'breakfast',
        item_name: 'Pancakes with Syrup',
        description: 'Fluffy pancakes served with maple syrup',
        price: 120,
        category: 'Main Course',
        is_vegetarian: true
      },
      {
        id: 2,
        menu_date: new Date().toISOString().split('T')[0],
        meal_type: 'breakfast',
        item_name: 'Fresh Fruit Bowl',
        description: 'Seasonal fresh fruits',
        price: 80,
        category: 'Healthy',
        is_vegetarian: true
      },
      {
        id: 3,
        menu_date: new Date().toISOString().split('T')[0],
        meal_type: 'lunch',
        item_name: 'Chicken Biryani',
        description: 'Aromatic basmati rice with spiced chicken',
        price: 200,
        category: 'Main Course',
        is_vegetarian: false
      },
      {
        id: 4,
        menu_date: new Date().toISOString().split('T')[0],
        meal_type: 'lunch',
        item_name: 'Vegetable Curry',
        description: 'Mixed vegetables in curry sauce',
        price: 150,
        category: 'Main Course',
        is_vegetarian: true
      },
      {
        id: 5,
        menu_date: new Date().toISOString().split('T')[0],
        meal_type: 'dinner',
        item_name: 'Grilled Fish',
        description: 'Fresh fish grilled with herbs',
        price: 250,
        category: 'Main Course',
        is_vegetarian: false
      }
    ];

    // Filter by meal type if specified
    if (params.mealType) {
      return menus.filter(m => m.meal_type === params.mealType);
    }

    return menus;
  }

  getMockBuses(params) {
    const buses = [
      {
        id: 1,
        route_name: 'Campus Shuttle A',
        bus_number: 'BUS001',
        departure_location: 'Main Gate',
        arrival_location: 'City Center',
        departure_time: '08:00',
        arrival_time: '08:30',
        fare: 25,
        capacity: 50,
        is_active: true,
        days_of_operation: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      },
      {
        id: 2,
        route_name: 'Library Express',
        bus_number: 'BUS002',
        departure_location: 'Hostel Block',
        arrival_location: 'Central Library',
        departure_time: '09:00',
        arrival_time: '09:15',
        fare: 15,
        capacity: 30,
        is_active: true,
        days_of_operation: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      {
        id: 3,
        route_name: 'Evening Service',
        bus_number: 'BUS003',
        departure_location: 'Academic Block',
        arrival_location: 'Metro Station',
        departure_time: '17:30',
        arrival_time: '18:00',
        fare: 30,
        capacity: 45,
        is_active: true,
        days_of_operation: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    ];

    return buses.filter(bus => bus.is_active);
  }

  getMockEvents(params) {
    const events = [
      {
        id: 1,
        title: 'Tech Symposium 2025',
        description: 'Annual technology symposium featuring industry experts',
        event_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        start_time: '10:00',
        end_time: '17:00',
        location: 'Main Auditorium',
        organizer: 'CS Department',
        event_type: 'Technical'
      },
      {
        id: 2,
        title: 'Cultural Night',
        description: 'Celebrate diversity with music, dance, and food',
        event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        start_time: '18:00',
        end_time: '22:00',
        location: 'Campus Grounds',
        organizer: 'Student Council',
        event_type: 'Cultural'
      },
      {
        id: 3,
        title: 'Career Fair 2025',
        description: 'Meet with top employers and explore career opportunities',
        event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        start_time: '09:00',
        end_time: '16:00',
        location: 'Exhibition Hall',
        organizer: 'Placement Cell',
        event_type: 'Career'
      }
    ];

    return events;
  }

  getMockUpdates(params) {
    const updates = [
      {
        id: 1,
        title: 'Exam Schedule Released',
        content: 'The final examination schedule for Spring 2025 has been published.',
        summary: 'Check your exam dates and venues on the student portal.',
        category: 'Academic',
        priority: 'high',
        target_audience: 'students',
        is_published: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Library Hours Extended',
        content: 'Library will remain open 24/7 during exam period.',
        summary: 'Extended hours from June 15-30 to support students.',
        category: 'General',
        priority: 'medium',
        target_audience: 'all',
        is_published: true,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        title: 'New Cafeteria Menu',
        content: 'Fresh menu items added including healthy options.',
        summary: 'Try our new continental breakfast and salad bar.',
        category: 'General',
        priority: 'low',
        target_audience: 'all',
        is_published: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return updates;
  }

  getMockFAQs(params) {
    const faqs = [
      {
        id: 1,
        question: 'How do I access the student portal?',
        answer: 'You can access the student portal at portal.novacore.edu using your student ID and password. If you forgot your password, contact the IT helpdesk.',
        category: 'Technical Support',
        keywords: JSON.stringify(['portal', 'login', 'access', 'password']),
        is_active: true
      },
      {
        id: 2,
        question: 'What are the library timings?',
        answer: 'The library is open Monday to Friday: 8:00 AM - 10:00 PM, Saturday: 9:00 AM - 8:00 PM, Sunday: 10:00 AM - 6:00 PM. During exams, it operates 24/7.',
        category: 'Library',
        keywords: JSON.stringify(['library', 'timings', 'hours', 'open']),
        is_active: true
      },
      {
        id: 3,
        question: 'How can I apply for hostel accommodation?',
        answer: 'Hostel applications can be submitted online through the student portal. The deadline for next semester applications is typically 30 days before the semester starts.',
        category: 'Hostel',
        keywords: JSON.stringify(['hostel', 'accommodation', 'apply', 'room']),
        is_active: true
      },
      {
        id: 4,
        question: 'What is the fee payment deadline?',
        answer: 'Semester fees must be paid by the 15th of each month. Late payments incur a penalty of LKR500. You can pay online or at the accounts office.',
        category: 'Fee & Payment',
        keywords: JSON.stringify(['fee', 'payment', 'deadline', 'penalty']),
        is_active: true
      },
      {
        id: 5,
        question: 'How do I register for elective courses?',
        answer: 'Elective course registration opens 2 weeks before each semester. Log into the academic portal, navigate to course registration, and select your preferred electives.',
        category: 'Academic',
        keywords: JSON.stringify(['elective', 'course', 'registration', 'academic']),
        is_active: true
      }
    ];

    return faqs.filter(faq => faq.is_active);
  }
}

export const mockBackend = new MockChatbotBackend();
