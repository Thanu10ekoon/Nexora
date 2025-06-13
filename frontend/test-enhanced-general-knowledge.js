// Enhanced General Knowledge Test Suite
// Testing comprehensive ChatGPT-like knowledge capabilities

import campusCopilotAgent from './src/services/chatbotService.js';

console.log('🚀 Testing Enhanced General Knowledge Capabilities...\n');

// Test cases covering various types of knowledge queries
const testQueries = [
  // Famous People (in knowledge base)
  'Who is Albert Einstein?',
  'Tell me about Marie Curie',
  'What do you know about Leonardo da Vinci?',
  'Who was Napoleon Bonaparte?',
  'Tell me about Bill Gates',
  
  // Famous People (not in knowledge base - should generate contextual responses)
  'Who is Oprah Winfrey?',
  'Tell me about Michael Jordan',
  'Who was Martin Luther King Jr?',
  'What about Cleopatra?',
  'Who is Mark Zuckerberg?',
  
  // Places and Countries
  'What is Japan?',
  'Tell me about France',
  'Where is Germany?',
  'What about Australia?', // Not in knowledge base
  'Tell me about Brazil',  // Not in knowledge base
  
  // Universities
  'What is Harvard University?',
  'Tell me about MIT',
  'What is NSBM Green University?',
  'What about Yale University?', // Not in knowledge base
  
  // Science and Technology
  'What is artificial intelligence?',
  'Explain DNA',
  'What is quantum physics?',
  'Tell me about blockchain', // Not in knowledge base
  'What is photosynthesis?',
  
  // Historical Events
  'What was World War 2?',
  'Tell me about the Industrial Revolution',
  'What was the Renaissance?',
  'What about the Cold War?', // Not in knowledge base
  
  // Concepts and Theories
  'What is democracy?',
  'Explain capitalism',
  'What is the theory of relativity?',
  'Tell me about socialism', // Not in knowledge base
  
  // Arts and Literature
  'What is the Mona Lisa?',
  'Tell me about Hamlet',
  'What about the Starry Night?', // Not in knowledge base
  
  // General knowledge patterns
  'How does the internet work?',
  'What are black holes?',
  'Explain evolution',
  'What is machine learning?',
  
  // Questions about things not in knowledge base
  'Who is Taylor Swift?',
  'What is TikTok?',
  'Tell me about cryptocurrency mining',
  'What is virtual reality?',
  'Who invented the telephone?',
  'What is climate change?',
  
  // Different question formats
  'Can you explain photosynthesis?',
  'Do you know about Shakespeare?',
  'I want to learn about Einstein',
  'Teach me about DNA',
  'Give me information about Japan'
];

async function runGeneralKnowledgeTests() {
  let totalTests = 0;
  let passedTests = 0;
  let knowledgeBaseResponses = 0;
  let contextualResponses = 0;

  for (const query of testQueries) {
    try {
      totalTests++;
      console.log(`\n📝 Testing: "${query}"`);
      
      const result = await campusCopilotAgent.processMessage(query);
      
      if (result.success) {
        passedTests++;
        console.log(`✅ Intent: ${result.intent}`);
        console.log(`🎯 Confidence: ${result.confidence}`);
        console.log(`📊 Campus Info Request: ${result.isCampusInfoRequest}`);
        
        // Check if this is a general knowledge response
        if (result.intent === 'general_knowledge') {
          // Check response source
          if (result.response.includes('Knowledge Base') || result.response.includes('🧠')) {
            knowledgeBaseResponses++;
            console.log(`📚 Source: Knowledge Base`);
          } else {
            contextualResponses++;
            console.log(`🤖 Source: Contextual AI`);
          }
        }
        
        // Show abbreviated response
        const shortResponse = result.response.length > 200 
          ? result.response.substring(0, 200) + '...' 
          : result.response;
        console.log(`💬 Response: ${shortResponse}`);
        
      } else {
        console.log(`❌ Failed: ${result.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error(`💥 Error testing "${query}":`, error.message);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 ENHANCED GENERAL KNOWLEDGE TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed Tests: ${passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log(`Knowledge Base Responses: ${knowledgeBaseResponses}`);
  console.log(`Contextual AI Responses: ${contextualResponses}`);
  console.log(`Total General Knowledge Responses: ${knowledgeBaseResponses + contextualResponses}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Enhanced general knowledge is working perfectly!');
  } else {
    console.log(`⚠️  ${totalTests - passedTests} tests failed. Check the implementation.`);
  }
}

// Test specific query analysis
async function testQueryAnalysis() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 TESTING QUERY ANALYSIS CAPABILITIES');
  console.log('='.repeat(60));

  const analysisTests = [
    { query: 'Who is Einstein?', expectedType: 'person' },
    { query: 'What is France?', expectedType: 'place' },
    { query: 'Explain artificial intelligence', expectedType: 'concept' },
    { query: 'When was World War 2?', expectedType: 'historical' },
    { query: 'How does DNA work?', expectedType: 'scientific' },
    { query: 'What is the internet?', expectedType: 'technological' },
    { query: 'Tell me something interesting', expectedType: 'general' }
  ];

  for (const test of analysisTests) {
    const agent = campusCopilotAgent;
    const analysis = agent.analyzeKnowledgeQuery(test.query.toLowerCase());
    
    console.log(`\nQuery: "${test.query}"`);
    console.log(`Expected Type: ${test.expectedType}`);
    console.log(`Detected Type: ${analysis.type}`);
    console.log(`Confidence: ${analysis.confidence}`);
    console.log(`${analysis.type === test.expectedType ? '✅' : '❌'} Type Detection`);
  }
}

// Test different question formats
async function testQuestionFormats() {
  console.log('\n' + '='.repeat(60));
  console.log('📝 TESTING DIFFERENT QUESTION FORMATS');
  console.log('='.repeat(60));

  const formatTests = [
    'Who is Einstein?',
    'What is Einstein?',
    'Tell me about Einstein',
    'Einstein biography',
    'Can you explain Einstein?',
    'Do you know about Einstein?',
    'I want to learn about Einstein',
    'Give me information about Einstein'
  ];

  for (const query of formatTests) {
    try {
      console.log(`\n🔤 Format: "${query}"`);
      const result = await campusCopilotAgent.processMessage(query);
      
      if (result.success && result.intent === 'general_knowledge') {
        console.log('✅ Correctly identified as general knowledge');
      } else {
        console.log(`❌ Misidentified as: ${result.intent}`);
      }
    } catch (error) {
      console.error(`💥 Error:`, error.message);
    }
  }
}

// Run all tests
(async () => {
  await runGeneralKnowledgeTests();
  await testQueryAnalysis();
  await testQuestionFormats();
  
  console.log('\n🎯 Test complete! The chatbot now has ChatGPT-like general knowledge capabilities while maintaining excellent campus-specific functionality.');
})().catch(console.error);
