// Comprehensive test for the enhanced chatbot system
import { campusCopilotAgent } from './src/services/chatbotService.js';

async function testEnhancedChatbot() {
  console.log('🤖 Testing Enhanced Campus Copilot...\n');

  const testMessages = [
    // Campus information queries
    "What's for lunch today?",
    "Do I have any classes tomorrow?",
    "When is the next bus to downtown?",
    "Any events happening this week?",
    "What are the latest university updates?",
    "How do I register for classes?",
    
    // Enhanced human-like features
    "Tell me a joke",
    "I need some motivation",
    "Give me a study tip",
    "Share a fun fact",
    "I'm feeling stressed",
    "What should I eat?",
    "What's the weather like?",
    "Tell me about sports facilities",
    
    // Conversational queries
    "Hi there!",
    "How are you doing?",
    "What can you help me with?",
    "Thank you for your help",
    "You're awesome!",
    "That was helpful"
  ];

  let passedTests = 0;
  let totalTests = testMessages.length;

  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`\n🧪 Test ${i + 1}: "${message}"`);
    console.log('─'.repeat(50));
    
    try {
      const result = await campusCopilotAgent.processMessage(message);
      
      if (result.success) {
        console.log(`✅ Success - Intent: ${result.intent}`);
        console.log(`📝 Response: ${result.response.substring(0, 100)}...`);
        console.log(`🎯 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`🏫 Campus Info: ${result.isCampusInfoRequest ? 'Yes' : 'No'}`);
        passedTests++;
      } else {
        console.log(`❌ Failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`🎯 Test Results: ${passedTests}/${totalTests} tests passed`);
  console.log(`📊 Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Enhanced chatbot is working perfectly!');
  } else {
    console.log('⚠️  Some tests failed. Check the implementation.');
  }

  console.log('\n🌟 Enhanced Features Available:');
  console.log('• 📚 Campus Information (schedules, menus, buses, events, updates, FAQs)');
  console.log('• 😄 Jokes and Humor');
  console.log('• 💪 Motivational Quotes');
  console.log('• 📖 Study Tips');
  console.log('• 🤓 Fun Facts');
  console.log('• 🌤️ Weather Information (simulated)');
  console.log('• 🏃‍♀️ Sports and Fitness Info');
  console.log('• 😌 Stress Relief and Mental Health Support');
  console.log('• 🍽️ Food Recommendations');
  console.log('• 💬 Natural Conversation');
}

// Run the test
testEnhancedChatbot().catch(console.error);
