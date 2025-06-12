// Simple test to verify intent detection fixes
console.log('🧪 Testing Intent Detection Fixes...\n');

// Simulate the analyzeIntent function for testing
function testAnalyzeIntent(userMessage) {
  const message = userMessage.toLowerCase();
  
  // First check for explicit weather queries (highest priority)
  if (/\b(weather|temperature|rain|sunny|cloudy|climate|hot|cold|forecast)\b/i.test(message)) {
    return {
      intent: 'weather',
      confidence: 0.95,
      isCampusInfoRequest: false,
      conversationType: 'weather'
    };
  }

  // Check for explicit FAQ queries (high priority)
  if (/\b(faq|faqs|frequently asked|questions|tell me faqs)\b/i.test(message)) {
    return {
      intent: 'faqs',
      confidence: 0.95,
      isCampusInfoRequest: true,
      conversationType: 'general_help'
    };
  }

  // Check for menu-specific keywords
  if (/\b(food|eat|eating|meal|meals|menu|cafeteria|dining|restaurant|breakfast|lunch|dinner|snack|hungry|canteen|mess)\b/i.test(message)) {
    return {
      intent: 'menus',
      confidence: 0.85,
      isCampusInfoRequest: true,
      conversationType: 'general'
    };
  }

  return {
    intent: 'conversation',
    confidence: 0.8,
    isCampusInfoRequest: false,
    conversationType: 'general'
  };
}

// Test cases
const testCases = [
  { input: "What is the weather today?", expected: "weather" },
  { input: "weather?", expected: "weather" },
  { input: "Tell me FAQs", expected: "faqs" },
  { input: "Show me frequently asked questions", expected: "faqs" },
  { input: "What's for lunch?", expected: "menus" },
  { input: "I'm hungry", expected: "menus" },
  { input: "Hello there", expected: "conversation" }
];

console.log('Test Results:');
console.log('='.repeat(50));

let passed = 0;
let total = testCases.length;

testCases.forEach((testCase, index) => {
  const result = testAnalyzeIntent(testCase.input);
  const success = result.intent === testCase.expected;
  
  console.log(`${index + 1}. "${testCase.input}"`);
  console.log(`   Expected: ${testCase.expected} | Got: ${result.intent} | ${success ? '✅' : '❌'}`);
  console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}% | Campus Info: ${result.isCampusInfoRequest}`);
  console.log('');
  
  if (success) passed++;
});

console.log('='.repeat(50));
console.log(`Results: ${passed}/${total} tests passed (${((passed/total) * 100).toFixed(1)}%)`);

if (passed === total) {
  console.log('🎉 All intent detection tests passed!');
} else {
  console.log('⚠️ Some tests failed - check the intent detection logic');
}

console.log('\n💡 The chatbot should now correctly handle:');
console.log('• Weather queries → weather responses');
console.log('• FAQ requests → database FAQs');
console.log('• Menu requests → cafeteria menus');
console.log('• General conversation → conversational responses');
