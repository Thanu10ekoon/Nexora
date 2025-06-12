// Test script for Campus Copilot chatbot functionality
import { campusCopilotAgent } from './services/chatbotService.js';

const testChatbot = async () => {
  console.log('🤖 Testing Campus Copilot Agent...\n');

  const testMessages = [
    "Hello!",
    "How are you?",
    "What's my schedule for today?",
    "What's for lunch today?",
    "When is the next bus?",
    "Any upcoming events?",
    "What time is it?",
    "Help me with registration process",
    "Thanks!"
  ];

  for (const message of testMessages) {
    console.log(`\n👤 User: ${message}`);
    try {
      const response = await campusCopilotAgent.processMessage(message);
      console.log(`🤖 Bot (${response.intent}): ${response.response.substring(0, 200)}${response.response.length > 200 ? '...' : ''}`);
      console.log(`📊 Confidence: ${Math.round((response.confidence || 0) * 100)}%`);
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    // Add small delay between messages
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ Chatbot test completed!');
};

// Run the test
testChatbot().catch(console.error);
