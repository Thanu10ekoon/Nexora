// Updated test for intent analysis with word boundaries
const testIntentFixed = (message) => {
  console.log(`Testing: "${message}"`);
  
  const msg = message.toLowerCase();
  const intents = {
    greeting: {
      patterns: [
        'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
        'start', 'begin', 'thanks', 'thank you', 'greetings', 'howdy'
      ],
      priority: 3
    },
    casual: {
      patterns: [
        'how are you', 'what\'s up', 'whatsup', 'sup', 'yo', 'how do you do', 
        'nice to meet you', 'who are you', 'what can you do', 'help me', 
        'i need help', 'can you help', 'what are your capabilities', 'introduce yourself'
      ],
      priority: 2
    }
  };

  const scores = {};
  for (const [intent, config] of Object.entries(intents)) {
    let score = 0;
    for (const pattern of config.patterns) {
      // Use more precise matching for short patterns to avoid false positives
      if (pattern.length <= 3) {
        // For short patterns like "hi", "yo", "sup", use word boundary matching
        const regex = new RegExp('\\b' + pattern + '\\b', 'i');
        if (regex.test(msg)) {
          score += 1;
          console.log(`  ✓ Pattern "${pattern}" matched (word boundary)`);
        }
      } else {
        // For longer patterns, use simple includes
        if (msg.includes(pattern)) {
          score += 1;
          console.log(`  ✓ Pattern "${pattern}" matched (includes)`);
        }
      }
    }
    
    if (score > 0) {
      scores[intent] = (score / config.patterns.length) * config.priority;
      console.log(`  Intent "${intent}": score=${score}, weighted=${scores[intent]}`);
    }
  }

  let topIntent = ['general', 0];
  if (Object.keys(scores).length > 0) {
    topIntent = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    );
  }

  console.log(`  Result: ${topIntent[0]} (confidence: ${topIntent[1]})`);
  console.log('---');
};

// Test cases
testIntentFixed('hi');
testIntentFixed('hello');
testIntentFixed('hey');
testIntentFixed('how are you');
testIntentFixed('what can you do');
testIntentFixed('yo');
