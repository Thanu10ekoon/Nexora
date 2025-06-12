// Quick test for intent analysis
const testIntent = (message) => {
  console.log(`Testing: "${message}"`);
  
  const msg = message.toLowerCase();
  const intents = {
    greeting: {
      patterns: [
        'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
        'start', 'begin', 'thanks', 'thank you', 'how are you', 'what\'s up',
        'whatsup', 'sup', 'yo', 'greetings', 'howdy'
      ],
      priority: 3
    },
    casual: {
      patterns: [
        'how are you', 'what\'s up', 'how do you do', 'nice to meet you',
        'who are you', 'what can you do', 'help me', 'i need help',
        'can you help', 'what are your capabilities', 'introduce yourself'
      ],
      priority: 2
    }
  };

  const scores = {};
  for (const [intent, config] of Object.entries(intents)) {
    let score = 0;
    for (const pattern of config.patterns) {
      if (msg.includes(pattern)) {
        score += 1;
        console.log(`  ✓ Pattern "${pattern}" matched`);
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
testIntent('hi');
testIntent('hello');
testIntent('hey');
testIntent('how are you');
testIntent('what can you do');
testIntent('schedule');
