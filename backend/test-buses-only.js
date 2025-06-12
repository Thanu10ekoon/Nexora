const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testBusesOnly() {
  try {
    // Get admin token first
    console.log('Getting admin token...');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      regNo: 'ADMIN001',
      password: 'admin123'
    });
    
    const adminToken = adminLogin.data.data.token;
    console.log('Admin token obtained');

    // Test POST bus with detailed logging
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

    console.log('Sending bus data:', JSON.stringify(newBus, null, 2));

    const postBus = await axios.post(`${BASE_URL}/buses`, newBus, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ POST bus successful!', postBus.data);
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.log('Error response:', error.response.data);
    }
  }
}

testBusesOnly();
