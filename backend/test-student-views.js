// Campus Copilot Student Views Test
// This file tests all student view endpoints to ensure they work properly

const api = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test data for authentication
const testStudent = {
  regNo: 'STU001',
  password: 'student123'
};

let authToken = '';

const testEndpoints = async () => {
  try {
    console.log('🚀 Starting Campus Copilot Student Views Test\n');    // 1. Test Login
    console.log('1. Testing Student Login...');
    try {
      const loginResponse = await api.post(`${BASE_URL}/api/auth/login`, testStudent);
      if (loginResponse.data.success) {
        authToken = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('🔑 Token received:', authToken ? authToken.substring(0, 50) + '...' : 'No token');
        console.log('👤 User:', loginResponse.data.user?.full_name || 'Unknown user');
      } else {
        console.log('❌ Login failed:', loginResponse.data.message);
        return;
      }
    } catch (error) {
      console.log('❌ Login error:', error.response?.data?.message || error.message);
      return;
    }

    // Set up headers for authenticated requests
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    console.log('\n2. Testing Student View Endpoints:');    // 2. Test Schedules
    console.log('   📅 Testing Schedules...');
    try {
      const schedulesResponse = await api.get(`${BASE_URL}/api/schedules`, { headers });
      if (schedulesResponse.data.success) {
        console.log(`   ✅ Schedules: ${schedulesResponse.data.data.length} items found`);
      } else {
        console.log('   ❌ Schedules failed:', schedulesResponse.data.message);
      }
    } catch (error) {
      console.log('   ❌ Schedules error:', error.response?.data?.message || error.message);
    }

    // 3. Test Menus
    console.log('   🍽️  Testing Menus...');
    try {
      const menusResponse = await api.get(`${BASE_URL}/api/menus`, { headers });
      if (menusResponse.data.success) {
        console.log(`   ✅ Menus: ${menusResponse.data.data.length} items found`);
      } else {
        console.log('   ❌ Menus failed:', menusResponse.data.message);
      }
    } catch (error) {
      console.log('   ❌ Menus error:', error.response?.data?.message || error.message);
    }

    // 4. Test Buses
    console.log('   🚌 Testing Buses...');
    try {
      const busesResponse = await api.get(`${BASE_URL}/api/buses`, { headers });
      if (busesResponse.data.success) {
        console.log(`   ✅ Buses: ${busesResponse.data.data.length} items found`);
      } else {
        console.log('   ❌ Buses failed:', busesResponse.data.message);
      }
    } catch (error) {
      console.log('   ❌ Buses error:', error.response?.data?.message || error.message);
    }

    // 5. Test Events
    console.log('   🎉 Testing Events...');
    try {
      const eventsResponse = await api.get(`${BASE_URL}/api/events`, { headers });
      if (eventsResponse.data.success) {
        console.log(`   ✅ Events: ${eventsResponse.data.data.length} items found`);
      } else {
        console.log('   ❌ Events failed:', eventsResponse.data.message);
      }
    } catch (error) {
      console.log('   ❌ Events error:', error.response?.data?.message || error.message);
    }

    // 6. Test Updates
    console.log('   📢 Testing Updates...');
    try {
      const updatesResponse = await api.get(`${BASE_URL}/api/updates`, { headers });
      if (updatesResponse.data.success) {
        console.log(`   ✅ Updates: ${updatesResponse.data.data.length} items found`);
      } else {
        console.log('   ❌ Updates failed:', updatesResponse.data.message);
      }
    } catch (error) {
      console.log('   ❌ Updates error:', error.response?.data?.message || error.message);
    }

    // 7. Test FAQs
    console.log('   ❓ Testing FAQs...');
    try {
      const faqsResponse = await api.get(`${BASE_URL}/api/faqs`, { headers });
      if (faqsResponse.data.success) {
        console.log(`   ✅ FAQs: ${faqsResponse.data.data.length} items found`);
      } else {
        console.log('   ❌ FAQs failed:', faqsResponse.data.message);
      }
    } catch (error) {
      console.log('   ❌ FAQs error:', error.response?.data?.message || error.message);
    }

    // 8. Test Chatbot Start
    console.log('\n3. Testing AI Chatbot:');
    console.log('   🤖 Testing Chatbot Start...');
    try {
      const chatStartResponse = await api.post(`${BASE_URL}/api/chatbot/chat/start`, {}, { headers });
      if (chatStartResponse.data.success) {
        const sessionId = chatStartResponse.data.sessionId;
        console.log('   ✅ Chatbot session started:', sessionId);
        
        // Test sending a message
        console.log('   💬 Testing Chatbot Message...');
        const messageResponse = await api.post(`${BASE_URL}/api/chatbot/chat/message`, {
          sessionId: sessionId,
          message: 'What is available for lunch today?'
        }, { headers });
        
        if (messageResponse.data.success) {
          console.log('   ✅ Chatbot message sent and received');
          console.log('   🤖 Bot response:', messageResponse.data.botMessage.content.substring(0, 100) + '...');
        } else {
          console.log('   ❌ Chatbot message failed:', messageResponse.data.message);
        }
      } else {
        console.log('   ❌ Chatbot start failed:', chatStartResponse.data.message);
      }
    } catch (error) {
      console.log('   ❌ Chatbot error:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Campus Copilot Student Views Test Complete!');
    console.log('📊 Check the results above to see which components are working properly.');

  } catch (error) {
    console.error('❌ Test suite error:', error.message);
  }
};

// Run the test
testEndpoints();
