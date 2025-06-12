// Test script to validate field mapping across all modules
const axios = require('axios');

const baseURL = 'http://localhost:5000/api';
let authToken = '';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.magenta}\n=== ${msg} ===${colors.reset}`),
  subheader: (msg) => console.log(`${colors.cyan}\n--- ${msg} ---${colors.reset}`)
};

// Test data for each module with correct field names
const testData = {
  buses: {
    routeName: "Test Route A1",
    busNumber: "NOV-001",
    departureLocation: "Main Campus",
    arrivalLocation: "City Center",
    departureTime: "08:30",
    arrivalTime: "09:15",
    daysOfOperation: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    fare: 25.50,
    capacity: 45
  },
  events: {
    title: "Test Technology Workshop",
    description: "A hands-on workshop about latest technologies",
    eventDate: "2024-12-15",
    startTime: "14:00",
    endTime: "16:30",
    location: "Tech Lab A",
    organizer: "Dr. Smith",
    department: "Computer Science",
    eventType: "Workshop",
    registrationRequired: true,
    maxParticipants: 30,
    contactEmail: "tech@novacore.edu",
    contactPhone: "+1234567890"
  },
  updates: {
    title: "Test System Maintenance Notice",
    content: "The campus network will undergo scheduled maintenance",
    summary: "Network maintenance on Dec 20",
    category: "Technical",
    priority: "medium",
    targetAudience: "all",
    publishDate: "2024-12-10",
    expiryDate: "2024-12-25",
    isPublished: true
  },
  faqs: {
    question: "How do I access the library resources?",
    answer: "You can access library resources using your student ID card",
    category: "Library",
    keywords: ["library", "access", "resources", "student ID"],
    isActive: true
  }
};

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${baseURL}${endpoint}`,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      data
    };
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status 
    };
  }
};

// Authentication
const authenticate = async () => {
  log.header('AUTHENTICATION TEST');
  
  const loginData = {
    regNo: 'ADMIN001',
    password: 'admin123'
  };
  
  const result = await makeRequest('POST', '/auth/login', loginData);
  
  if (result.success && result.data.token) {
    authToken = result.data.token;
    log.success('Admin authentication successful');
    return true;
  } else {
    log.error(`Authentication failed: ${JSON.stringify(result.error)}`);
    return false;
  }
};

// Test CRUD operations for a module
const testModule = async (moduleName, endpoint, testDataObj) => {
  log.subheader(`Testing ${moduleName.toUpperCase()} Module`);
  
  let createdId = null;
  
  // Test CREATE
  log.info(`Testing CREATE ${moduleName}...`);
  const createResult = await makeRequest('POST', endpoint, testDataObj);
  
  if (createResult.success) {
    log.success(`✓ CREATE ${moduleName} successful`);
    createdId = createResult.data.data?.id || createResult.data.id;
    log.info(`Created ${moduleName} with ID: ${createdId}`);
  } else {
    log.error(`✗ CREATE ${moduleName} failed: ${JSON.stringify(createResult.error)}`);
    if (createResult.error?.errors) {
      createResult.error.errors.forEach(err => {
        log.error(`  Field validation error: ${err.param} - ${err.msg}`);
      });
    }
    return false;
  }
  
  // Test READ
  log.info(`Testing READ ${moduleName}...`);
  const readResult = await makeRequest('GET', endpoint);
  
  if (readResult.success) {
    log.success(`✓ READ ${moduleName} successful`);
    const items = readResult.data.data || readResult.data;
    log.info(`Found ${items.length} ${moduleName} items`);
  } else {
    log.error(`✗ READ ${moduleName} failed: ${JSON.stringify(readResult.error)}`);
  }
  
  // Test UPDATE
  if (createdId) {
    log.info(`Testing UPDATE ${moduleName}...`);
    const updateData = { ...testDataObj };
    
    // Modify a field for update test
    if (updateData.title) updateData.title = `Updated ${updateData.title}`;
    if (updateData.routeName) updateData.routeName = `Updated ${updateData.routeName}`;
    if (updateData.question) updateData.question = `Updated ${updateData.question}`;
    
    const updateResult = await makeRequest('PUT', `${endpoint}/${createdId}`, updateData);
    
    if (updateResult.success) {
      log.success(`✓ UPDATE ${moduleName} successful`);
    } else {
      log.error(`✗ UPDATE ${moduleName} failed: ${JSON.stringify(updateResult.error)}`);
      if (updateResult.error?.errors) {
        updateResult.error.errors.forEach(err => {
          log.error(`  Field validation error: ${err.param} - ${err.msg}`);
        });
      }
    }
  }
  
  // Test DELETE
  if (createdId) {
    log.info(`Testing DELETE ${moduleName}...`);
    const deleteResult = await makeRequest('DELETE', `${endpoint}/${createdId}`);
    
    if (deleteResult.success) {
      log.success(`✓ DELETE ${moduleName} successful`);
    } else {
      log.error(`✗ DELETE ${moduleName} failed: ${JSON.stringify(deleteResult.error)}`);
    }
  }
  
  return true;
};

// Main test function
const runFieldMappingTests = async () => {
  log.header('CAMPUS COPILOT FIELD MAPPING VALIDATION TEST');
  log.info('Testing all modules for field mapping consistency...\n');
  
  // Authenticate first
  const authSuccess = await authenticate();
  if (!authSuccess) {
    log.error('Cannot proceed without authentication');
    return;
  }
  
  // Test all modules
  const modules = [
    { name: 'buses', endpoint: '/buses', data: testData.buses },
    { name: 'events', endpoint: '/events', data: testData.events },
    { name: 'updates', endpoint: '/updates', data: testData.updates },
    { name: 'faqs', endpoint: '/faqs', data: testData.faqs }
  ];
  
  let successCount = 0;
  
  for (const module of modules) {
    const success = await testModule(module.name, module.endpoint, module.data);
    if (success) successCount++;
    console.log(''); // Add spacing
  }
  
  // Summary
  log.header('TEST SUMMARY');
  log.info(`Tested ${modules.length} modules`);
  log.success(`${successCount} modules passed field mapping tests`);
  
  if (successCount === modules.length) {
    log.success('🎉 All field mappings are working correctly!');
  } else {
    log.warning(`${modules.length - successCount} modules need field mapping fixes`);
  }
};

// Run the tests
runFieldMappingTests().catch(error => {
  log.error(`Test execution failed: ${error.message}`);
  process.exit(1);
});
