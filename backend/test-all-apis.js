const axios = require('axios');
const { db } = require('./config/database');

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let studentToken = '';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAuthentication() {
  log('\n🔐 Testing Authentication...', 'blue');
  
  try {
    // Test admin login
    log('Attempting admin login...', 'cyan');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      regNo: 'ADMIN001',
      password: 'admin123'
    });
    
    log(`Admin login response: ${JSON.stringify(adminLogin.data)}`, 'cyan');
    
    if (adminLogin.data.success && adminLogin.data.data && adminLogin.data.data.token) {
      adminToken = adminLogin.data.data.token;
      log('✅ Admin login successful', 'green');
    } else {
      log('❌ Admin login failed - no token in response', 'red');
      return false;
    }    // Test student login
    const studentLogin = await axios.post(`${BASE_URL}/auth/login`, {
      regNo: 'STU001',
      password: 'student123'
    });
    
    if (studentLogin.data.success && studentLogin.data.data && studentLogin.data.data.token) {
      studentToken = studentLogin.data.data.token;
      log('✅ Student login successful', 'green');
    } else {
      log('❌ Student login failed', 'red');
      return false;
    }

    // Test profile endpoint
    const profile = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (profile.data.success) {
      log('✅ Profile fetch successful', 'green');
    } else {
      log('❌ Profile fetch failed', 'red');
    }

    return true;
  } catch (error) {
    log(`❌ Authentication test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testDashboard() {
  log('\n📊 Testing Dashboard...', 'blue');
  
  try {
    const dashboard = await axios.get(`${BASE_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (dashboard.data.success) {
      log('✅ Dashboard stats working', 'green');
      log(`   Users: ${dashboard.data.data.totalUsers}`, 'cyan');
      log(`   Schedules: ${dashboard.data.data.totalSchedules}`, 'cyan');
      log(`   Events: ${dashboard.data.data.totalEvents}`, 'cyan');
    } else {
      log('❌ Dashboard stats failed', 'red');
    }
  } catch (error) {
    log(`❌ Dashboard test failed: ${error.message}`, 'red');
  }
}

async function testSchedules() {
  log('\n📅 Testing Schedules...', 'blue');
  
  try {
    // Test GET schedules
    const getSchedules = await axios.get(`${BASE_URL}/schedules`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    if (getSchedules.data.success) {
      log(`✅ GET schedules working (${getSchedules.data.data.length} schedules)`, 'green');
    } else {
      log('❌ GET schedules failed', 'red');
    }

    // Test POST schedule (admin only)
    const newSchedule = {
      className: 'TEST101',
      subject: 'Test Subject',
      instructor: 'Test Instructor',
      department: 'Test Department',
      semester: 'Test Semester',
      dayOfWeek: 'Monday',
      startTime: '10:00',
      endTime: '11:30',
      roomNumber: 'T101',
      building: 'Test Building'
    };

    const postSchedule = await axios.post(`${BASE_URL}/schedules`, newSchedule, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (postSchedule.data.success) {
      log('✅ POST schedule working', 'green');
      
      // Test GET specific schedule
      const scheduleId = postSchedule.data.data.id;
      const getSchedule = await axios.get(`${BASE_URL}/schedules/${scheduleId}`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      
      if (getSchedule.data.success) {
        log('✅ GET specific schedule working', 'green');
      }

      // Test PUT schedule
      const updateSchedule = await axios.put(`${BASE_URL}/schedules/${scheduleId}`, {
        ...newSchedule,
        subject: 'Updated Test Subject'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (updateSchedule.data.success) {
        log('✅ PUT schedule working', 'green');
      }

      // Test DELETE schedule
      const deleteSchedule = await axios.delete(`${BASE_URL}/schedules/${scheduleId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (deleteSchedule.data.success) {
        log('✅ DELETE schedule working', 'green');
      }
    } else {
      log('❌ POST schedule failed', 'red');
    }
  } catch (error) {
    log(`❌ Schedules test failed: ${error.message}`, 'red');
  }
}

async function testMenus() {
  log('\n🍽️ Testing Menus...', 'blue');
  
  try {
    // Test GET menus
    const getMenus = await axios.get(`${BASE_URL}/menus`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    if (getMenus.data.success) {
      log(`✅ GET menus working (${getMenus.data.data.length} items)`, 'green');
    } else {
      log('❌ GET menus failed', 'red');
    }

    // Test POST menu (admin only)
    const newMenu = {
      menuDate: '2025-06-11',
      mealType: 'lunch',
      itemName: 'Test Dish',
      description: 'Test Description',
      price: 9.99,
      category: 'main',
      isVegetarian: true
    };

    const postMenu = await axios.post(`${BASE_URL}/menus`, newMenu, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (postMenu.data.success) {
      log('✅ POST menu working', 'green');
      
      // Test DELETE menu
      const menuId = postMenu.data.data.id;
      const deleteMenu = await axios.delete(`${BASE_URL}/menus/${menuId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (deleteMenu.data.success) {
        log('✅ DELETE menu working', 'green');
      }
    } else {
      log('❌ POST menu failed', 'red');
    }
  } catch (error) {
    log(`❌ Menus test failed: ${error.message}`, 'red');
  }
}

async function testEvents() {
  log('\n🎉 Testing Events...', 'blue');
  
  try {
    // Test GET events
    const getEvents = await axios.get(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    if (getEvents.data.success) {
      log(`✅ GET events working (${getEvents.data.data.length} events)`, 'green');
    } else {
      log('❌ GET events failed', 'red');
    }    // Test POST event (admin only)
    const newEvent = {
      title: 'Test Event',
      description: 'Test Description',
      eventDate: '2025-06-15',
      startTime: '10:00',
      endTime: '12:00',
      location: 'Test Location',
      organizer: 'Test Organizer',
      department: 'Computer Science',
      eventType: 'Academic',
      registrationRequired: false,
      maxParticipants: 50,
      contactEmail: 'test@novacore.edu'
    };

    const postEvent = await axios.post(`${BASE_URL}/events`, newEvent, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (postEvent.data.success) {
      log('✅ POST event working', 'green');
    } else {
      log('❌ POST event failed', 'red');
    }
  } catch (error) {
    log(`❌ Events test failed: ${error.message}`, 'red');
  }
}

async function testBuses() {
  log('\n🚌 Testing Buses...', 'blue');
  
  try {
    // Test GET buses
    const getBuses = await axios.get(`${BASE_URL}/buses`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    if (getBuses.data.success) {
      log(`✅ GET buses working (${getBuses.data.data.length} routes)`, 'green');
    } else {
      log('❌ GET buses failed', 'red');
    }

    // Test POST bus (admin only)
    const newBus = {
      routeName: 'Test Route',
      busNumber: 'B001',
      departureLocation: 'Test Campus',
      arrivalLocation: 'Test City Center',
      departureTime: '08:00',
      arrivalTime: '09:30',
      daysOfOperation: ['Monday', 'Wednesday', 'Friday'],
      fare: 2.50,
      capacity: 40
    };

    const postBus = await axios.post(`${BASE_URL}/buses`, newBus, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (postBus.data.success) {
      log('✅ POST bus working', 'green');
      
      // Test DELETE bus
      const busId = postBus.data.data.id;
      const deleteBus = await axios.delete(`${BASE_URL}/buses/${busId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (deleteBus.data.success) {
        log('✅ DELETE bus working', 'green');
      }
    } else {
      log('❌ POST bus failed', 'red');
      if (postBus.data.errors) {
        postBus.data.errors.forEach(error => {
          log(`   - ${error.msg}`, 'yellow');
        });
      }
    }
  } catch (error) {
    log(`❌ Buses test failed: ${error.message}`, 'red');
    if (error.response?.data?.errors) {
      error.response.data.errors.forEach(err => {
        log(`   - ${err.msg}`, 'yellow');
      });
    }
  }
}

async function testFAQs() {
  log('\n❓ Testing FAQs...', 'blue');
  
  try {
    // Test GET FAQs
    const getFAQs = await axios.get(`${BASE_URL}/faqs`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    if (getFAQs.data.success) {
      log(`✅ GET FAQs working (${getFAQs.data.data.length} FAQs)`, 'green');
    } else {
      log('❌ GET FAQs failed', 'red');
    }

    // Test GET FAQ categories
    const getCategories = await axios.get(`${BASE_URL}/faqs/categories/all`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    if (getCategories.data.success) {
      log(`✅ GET FAQ categories working (${getCategories.data.data.length} categories)`, 'green');
    } else {
      log('❌ GET FAQ categories failed', 'red');
    }
  } catch (error) {
    log(`❌ FAQs test failed: ${error.message}`, 'red');
  }
}

async function testUpdates() {
  log('\n📢 Testing Updates...', 'blue');
  
  try {
    // Test GET updates
    const getUpdates = await axios.get(`${BASE_URL}/updates`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    if (getUpdates.data.success) {
      log(`✅ GET updates working (${getUpdates.data.data.length} updates)`, 'green');
    } else {
      log('❌ GET updates failed', 'red');
    }
  } catch (error) {
    log(`❌ Updates test failed: ${error.message}`, 'red');
  }
}

async function runAllTests() {
  try {
    log('🧪 Starting Comprehensive API Testing...', 'yellow');
    log('==========================================', 'yellow');
    
    const authSuccess = await testAuthentication();
    if (!authSuccess) {
      log('❌ Authentication failed, stopping tests', 'red');
      return;
    }

    await testDashboard();
    await testSchedules();
    await testMenus();
    await testEvents();
    await testBuses();
    await testFAQs();
    await testUpdates();
    
    log('\n🎉 All API tests completed!', 'green');
    log('==========================================', 'yellow');
    
  } catch (error) {
    log(`❌ Test suite failed: ${error.message}`, 'red');
  } finally {
    process.exit(0);
  }
}

// Install axios if not present
try {
  require('axios');
} catch (e) {
  log('❌ axios not found. Please run: npm install axios', 'red');
  process.exit(1);
}

runAllTests();
