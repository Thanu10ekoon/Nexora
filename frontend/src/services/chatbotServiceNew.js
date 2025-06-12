import api from './api';
import { mockBackend } from './mockBackend';

/**
 * Campus Copilot Conversational AI Agent
 * Advanced natural conversation with intelligent campus information detection
 */

class CampusCopilotAgent {
  constructor() {
    this.tools = {
      getSchedules: this.getSchedules.bind(this),
      getMenus: this.getMenus.bind(this),
      getBuses: this.getBuses.bind(this),
      getEvents: this.getEvents.bind(this),
      getUpdates: this.getUpdates.bind(this),
      getFAQs: this.getFAQs.bind(this),
      searchFAQs: this.searchFAQs.bind(this),
      getCurrentTime: this.getCurrentTime.bind(this),
      getCurrentDate: this.getCurrentDate.bind(this)
    };
    
    this.conversationHistory = [];
    this.conversationContext = {
      userName: null,
      preferredTopics: [],
      lastCampusQuery: null,
      mood: 'neutral'
    };
  }

  // Helper method to make API calls with fallback to mock data
  async makeAPICall(endpoint, params = {}) {
    try {
      const response = await api.get(endpoint, { params });
      return {
        success: true,
        data: response.data.data || [],
        source: 'api'
      };
    } catch (error) {
      console.warn(`API call failed for ${endpoint}, using mock data:`, error.message);
      try {
        const mockData = await mockBackend.mockAPICall(endpoint, params);
        return {
          success: true,
          data: mockData,
          source: 'mock'
        };
      } catch (mockError) {
        return {
          success: false,
          error: mockError.message,
          source: 'none'
        };
      }
    }
  }

  // Advanced conversational intent analysis - detects campus info requests in natural conversation
  analyzeIntent(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Campus information detection patterns - comprehensive and flexible
    const campusInfoDetectors = {
      schedules: {
        keywords: [
          'schedule', 'class', 'classes', 'lecture', 'lectures', 'timetable', 
          'subject', 'course', 'courses', 'room', 'teacher', 'professor', 
          'instructor', 'timing', 'time table'
        ],
        phrases: [
          'what time is my', 'when is my', 'do i have class', 'any classes',
          'what\'s my schedule', 'class schedule', 'today\'s classes', 'tomorrow\'s classes',
          'next class', 'when does', 'what time does', 'room number', 'which room',
          'class today', 'lecture today', 'free periods', 'empty slots'
        ],
        contextWords: ['today', 'tomorrow', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'this week', 'next week'],
        weight: 1.5
      },
      menus: {
        keywords: [
          'food', 'eat', 'eating', 'meal', 'meals', 'menu', 'cafeteria', 
          'dining', 'restaurant', 'breakfast', 'lunch', 'dinner', 'snack', 
          'hungry', 'canteen', 'mess'
        ],
        phrases: [
          'what\'s for', 'what to eat', 'food available', 'dining options',
          'cafeteria menu', 'today\'s menu', 'lunch menu', 'dinner menu',
          'food prices', 'how much does', 'cost of food', 'cheap food',
          'hungry', 'grab something to eat', 'meal time'
        ],
        contextWords: ['today', 'tomorrow', 'breakfast', 'lunch', 'dinner', 'morning', 'afternoon', 'evening'],
        weight: 1.3
      },
      buses: {
        keywords: [
          'bus', 'buses', 'transport', 'transportation', 'shuttle', 'travel', 
          'ride', 'route', 'trip', 'commute', 'journey'
        ],
        phrases: [
          'how to get to', 'bus timing', 'bus schedule', 'next bus',
          'bus route', 'transportation to', 'shuttle service', 'bus fare',
          'when does the bus', 'bus arrival', 'bus departure', 'catch a bus',
          'public transport', 'how to reach'
        ],
        contextWords: ['city center', 'downtown', 'mall', 'hospital', 'airport', 'station', 'campus', 'hostel', 'library'],
        weight: 1.2
      },
      events: {
        keywords: [
          'event', 'events', 'activity', 'activities', 'program', 'programs', 
          'happening', 'seminar', 'workshop', 'conference', 'competition', 
          'fest', 'festival', 'celebration', 'party'
        ],
        phrases: [
          'what\'s happening', 'upcoming events', 'any events', 'events today',
          'activities available', 'programs running', 'seminars scheduled',
          'competitions coming', 'festival dates', 'event calendar',
          'something fun', 'entertainment', 'cultural programs'
        ],
        contextWords: ['today', 'tomorrow', 'this week', 'next week', 'upcoming', 'soon', 'later'],
        weight: 1.1
      },
      updates: {
        keywords: [
          'update', 'updates', 'news', 'announcement', 'announcements', 
          'notice', 'notices', 'information', 'important', 'urgent', 
          'deadline', 'notification'
        ],
        phrases: [
          'latest news', 'recent updates', 'important announcements', 'new information',
          'university news', 'campus updates', 'official notice', 'urgent updates',
          'deadline approaching', 'important dates', 'what\'s new', 'any news'
        ],
        contextWords: ['recent', 'latest', 'new', 'today', 'yesterday', 'this week'],
        weight: 1.0
      },
      faqs: {
        keywords: [
          'help', 'how', 'what', 'where', 'when', 'why', 'question', 
          'procedure', 'process', 'requirement', 'apply', 'registration',
          'admission', 'form', 'document'
        ],
        phrases: [
          'how do i', 'how to', 'what is the process', 'where can i',
          'how can i apply', 'registration process', 'admission procedure',
          'library card', 'student id', 'fee payment', 'hostel admission',
          'need help with', 'confused about', 'don\'t know how'
        ],
        contextWords: ['apply', 'register', 'admission', 'procedure', 'process', 'requirement', 'document', 'form'],
        weight: 0.8
      }
    };

    // Detect campus information requests with scoring
    const detectedTopics = [];
    let maxScore = 0;
    let primaryTopic = null;

    for (const [topic, detector] of Object.entries(campusInfoDetectors)) {
      let score = 0;
      let matches = [];

      // Check keywords
      detector.keywords.forEach(keyword => {
        if (message.includes(keyword)) {
          score += 1 * detector.weight;
          matches.push(`keyword: ${keyword}`);
        }
      });

      // Check phrases (higher weight)
      detector.phrases.forEach(phrase => {
        if (message.includes(phrase)) {
          score += 2 * detector.weight;
          matches.push(`phrase: ${phrase}`);
        }
      });

      // Check context words (bonus points)
      detector.contextWords.forEach(context => {
        if (message.includes(context)) {
          score += 0.5 * detector.weight;
          matches.push(`context: ${context}`);
        }
      });

      if (score > 0) {
        detectedTopics.push({
          topic,
          score,
          matches,
          confidence: Math.min(score / 4, 1.0)
        });

        if (score > maxScore) {
          maxScore = score;
          primaryTopic = topic;
        }
      }
    }

    // Determine conversation type
    const conversationType = this.determineConversationType(message);
    const campusInfoThreshold = 1.0;
    const isCampusInfoRequest = maxScore >= campusInfoThreshold;

    return {
      intent: isCampusInfoRequest ? primaryTopic : 'conversation',
      confidence: isCampusInfoRequest ? Math.min(maxScore / 4, 1.0) : 0.9,
      entities: this.extractEntities(message, primaryTopic || 'conversation'),
      detectedTopics,
      isCampusInfoRequest,
      conversationType,
      maxScore,
      message: userMessage
    };
  }

  // Determine conversation type for natural responses
  determineConversationType(message) {
    const patterns = {
      greeting: /\b(hello|hi|hey|good morning|good afternoon|good evening|greetings|howdy)\b/i,
      farewell: /\b(bye|goodbye|see you|farewell|take care|catch you later)\b/i,
      gratitude: /\b(thank|thanks|appreciate|grateful|thx)\b/i,
      question_about_bot: /\b(who are you|what are you|what can you do|your capabilities|about yourself|introduce yourself)\b/i,
      casual_inquiry: /\b(how are you|what\'s up|how\'s it going|what\'s new|how you doing)\b/i,
      general_help: /\b(help|assist|support|guide me|can you help|need help)\b/i,
      clarification: /\b(what do you mean|can you explain|i don\'t understand|unclear|confused)\b/i,
      compliment: /\b(good job|well done|amazing|awesome|great|excellent|fantastic)\b/i,
      complaint: /\b(bad|terrible|awful|horrible|frustrated|annoyed)\b/i,
      joke_request: /\b(joke|funny|humor|laugh|entertainment)\b/i,
      weather: /\b(weather|temperature|rain|sunny|cloudy|climate)\b/i,
      time_query: /\b(time|clock|what time|current time)\b/i,
      date_query: /\b(date|today|what day|calendar)\b/i
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        return type;
      }
    }

    return 'general';
  }

  // Enhanced entity extraction
  extractEntities(message, intent) {
    const entities = { query: message };
    
    // Time patterns
    const timePatterns = {
      today: /\b(today|now|this day)\b/i,
      tomorrow: /\btomorrow\b/i,
      yesterday: /\byesterday\b/i,
      'this week': /\bthis week\b/i,
      'next week': /\bnext week\b/i,
      monday: /\bmonday\b/i,
      tuesday: /\btuesday\b/i,
      wednesday: /\bwednesday\b/i,
      thursday: /\bthursday\b/i,
      friday: /\bfriday\b/i,
      saturday: /\bsaturday\b/i,
      sunday: /\bsunday\b/i
    };

    for (const [time, pattern] of Object.entries(timePatterns)) {
      if (pattern.test(message)) {
        entities.timeframe = time;
        break;
      }
    }

    // Subject extraction for schedules
    if (intent === 'schedules') {
      const subjects = {
        'Computer Science': /\b(cs|computer science|programming|software|coding)\b/i,
        'Mathematics': /\b(math|mathematics|calculus|algebra|geometry)\b/i,
        'Physics': /\b(physics|mechanics|quantum|thermodynamics)\b/i,
        'Chemistry': /\b(chemistry|organic|inorganic|biochemistry)\b/i,
        'English': /\b(english|literature|grammar|writing)\b/i,
        'Biology': /\b(biology|bio|life science|anatomy)\b/i
      };

      for (const [subject, pattern] of Object.entries(subjects)) {
        if (pattern.test(message)) {
          entities.subject = subject;
          break;
        }
      }
    }

    // Meal type extraction
    if (intent === 'menus') {
      const mealTypes = {
        breakfast: /\b(breakfast|morning meal|morning food)\b/i,
        lunch: /\b(lunch|afternoon meal|midday)\b/i,
        dinner: /\b(dinner|evening meal|supper)\b/i,
        snacks: /\b(snack|snacks|tea time|refreshments)\b/i
      };

      for (const [meal, pattern] of Object.entries(mealTypes)) {
        if (pattern.test(message)) {
          entities.mealType = meal;
          break;
        }
      }
    }

    // Location extraction for buses
    if (intent === 'buses') {
      const locations = {
        'city center': /\b(city center|downtown|town center)\b/i,
        'airport': /\b(airport|flight)\b/i,
        'hospital': /\b(hospital|medical center)\b/i,
        'mall': /\b(mall|shopping center|market)\b/i,
        'library': /\b(library|books)\b/i,
        'hostel': /\b(hostel|dormitory|residence)\b/i
      };

      for (const [location, pattern] of Object.entries(locations)) {
        if (pattern.test(message)) {
          entities.destination = location;
          break;
        }
      }
    }

    return entities;
  }

  // Plan actions based on analysis
  planActions(analysis) {
    const { intent, entities, isCampusInfoRequest } = analysis;
    const actions = [];

    if (!isCampusInfoRequest) {
      // No API calls needed for general conversation
      return actions;
    }

    switch (intent) {
      case 'schedules':
        actions.push({
          tool: 'getSchedules',
          params: this.buildScheduleParams(entities)
        });
        break;

      case 'menus':
        actions.push({
          tool: 'getMenus',
          params: this.buildMenuParams(entities)
        });
        break;

      case 'buses':
        actions.push({
          tool: 'getBuses',
          params: this.buildBusParams(entities)
        });
        break;

      case 'events':
        actions.push({
          tool: 'getEvents',
          params: { upcoming: true, limit: 5 }
        });
        break;

      case 'updates':
        actions.push({
          tool: 'getUpdates',
          params: { limit: 5 }
        });
        break;

      case 'faqs':
        actions.push({
          tool: 'searchFAQs',
          params: entities.query || ''
        });
        break;
    }

    return actions;
  }

  // Build parameters for API calls
  buildScheduleParams(entities) {
    const params = {};
    if (entities.timeframe === 'today') {
      params.date = new Date().toISOString().split('T')[0];
    }
    if (entities.subject) {
      params.subject = entities.subject;
    }
    return params;
  }

  buildMenuParams(entities) {
    const params = {};
    if (entities.timeframe === 'today') {
      params.date = new Date().toISOString().split('T')[0];
    }
    if (entities.mealType) {
      params.mealType = entities.mealType;
    }
    return params;
  }

  buildBusParams(entities) {
    const params = {};
    if (entities.destination) {
      params.destination = entities.destination;
    }
    return params;
  }

  // Tool implementations (same as before)
  async getSchedules(params = {}) {
    try {
      const result = await this.makeAPICall('/schedules', params);
      return {
        success: result.success,
        data: result.data,
        message: result.success ? 'Retrieved class schedules successfully' : 'Failed to retrieve class schedules',
        source: result.source
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve class schedules'
      };
    }
  }

  async getMenus(params = {}) {
    try {
      const result = await this.makeAPICall('/menus', params);
      return {
        success: result.success,
        data: result.data,
        message: result.success ? 'Retrieved cafeteria menus successfully' : 'Failed to retrieve cafeteria menus',
        source: result.source
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve cafeteria menus'
      };
    }
  }

  async getBuses(params = {}) {
    try {
      const result = await this.makeAPICall('/buses', params);
      return {
        success: result.success,
        data: result.data,
        message: result.success ? 'Retrieved bus schedules successfully' : 'Failed to retrieve bus schedules',
        source: result.source
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve bus schedules'
      };
    }
  }

  async getEvents(params = {}) {
    try {
      const result = await this.makeAPICall('/events', params);
      return {
        success: result.success,
        data: result.data,
        message: result.success ? 'Retrieved events successfully' : 'Failed to retrieve events',
        source: result.source
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve events'
      };
    }
  }

  async getUpdates(params = {}) {
    try {
      const result = await this.makeAPICall('/updates', params);
      return {
        success: result.success,
        data: result.data,
        message: result.success ? 'Retrieved university updates successfully' : 'Failed to retrieve university updates',
        source: result.source
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve university updates'
      };
    }
  }

  async getFAQs(params = {}) {
    try {
      const result = await this.makeAPICall('/faqs', params);
      return {
        success: result.success,
        data: result.data,
        message: result.success ? 'Retrieved FAQs successfully' : 'Failed to retrieve FAQs',
        source: result.source
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve FAQs'
      };
    }
  }

  async searchFAQs(query) {
    try {
      const response = await this.getFAQs();
      if (response.success) {
        const faqs = response.data;
        const searchResults = faqs.filter(faq => 
          faq.question.toLowerCase().includes(query.toLowerCase()) ||
          faq.answer.toLowerCase().includes(query.toLowerCase())
        );
        return {
          success: true,
          data: searchResults,
          message: `Found ${searchResults.length} relevant FAQs`
        };
      }
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to search FAQs'
      };
    }
  }

  getCurrentTime() {
    return {
      success: true,
      data: new Date().toLocaleTimeString(),
      message: 'Retrieved current time'
    };
  }

  getCurrentDate() {
    return {
      success: true,
      data: new Date().toISOString().split('T')[0],
      message: 'Retrieved current date'
    };
  }

  // Execute planned actions
  async executeActions(actions) {
    const results = [];
    
    for (const action of actions) {
      try {
        const tool = this.tools[action.tool];
        if (tool) {
          const result = await tool(action.params);
          results.push({
            action: action.tool,
            result
          });
        }
      } catch (error) {
        results.push({
          action: action.tool,
          result: {
            success: false,
            error: error.message
          }
        });
      }
    }

    return results;
  }

  // Advanced conversational response generation
  generateResponse(userMessage, analysis, actionResults) {
    const { intent, isCampusInfoRequest, conversationType, detectedTopics } = analysis;

    // Handle campus information requests
    if (isCampusInfoRequest) {
      // Check for API failures
      const failures = actionResults.filter(r => !r.result.success);
      if (failures.length > 0) {
        return "I'm having some trouble accessing that information right now. Let me try to help you in another way, or you could try asking again in a moment.";
      }

      // Generate campus info response with conversational context
      const infoResponse = this.formatCampusInfoResponse(intent, actionResults);
      const conversationalWrapper = this.addConversationalWrapper(infoResponse, conversationType, userMessage);
      return conversationalWrapper;
    }

    // Handle pure conversation
    return this.generateConversationalResponse(userMessage, conversationType, analysis);
  }

  // Generate natural conversational responses
  generateConversationalResponse(userMessage, conversationType, analysis) {
    const responses = {
      greeting: [
        "Hello there! 👋 I'm Campus Copilot, your friendly AI assistant for Novacore University. How can I help make your day better?",
        "Hi! 😊 Great to see you! I'm here to help with anything you need around campus.",
        "Hey! 🎓 Welcome! I'm your campus AI buddy - ready to chat or help with university stuff!"
      ],
      
      farewell: [
        "Goodbye! 👋 Have a wonderful day, and feel free to come back anytime you need help!",
        "See you later! 😊 Take care, and remember I'm always here when you need campus assistance!",
        "Catch you later! 🎓 Hope your day goes amazingly well!"
      ],
      
      gratitude: [
        "You're very welcome! 😊 I'm so glad I could help. Anything else on your mind?",
        "Happy to help! 🤗 That's what I'm here for. Is there anything else you'd like to know?",
        "My pleasure! 💫 I love being able to assist students like you!"
      ],
      
      question_about_bot: [
        "I'm Campus Copilot! 🤖 Think of me as your personal campus assistant who never sleeps. I can help you with schedules, menus, transportation, events - basically anything to make your university life easier. Plus, I love having genuine conversations! What would you like to know about me?",
        "Great question! I'm an AI assistant created specifically for Novacore University students. I can chat about anything, help you find campus information, and I'm always learning to be more helpful. I'm like having a knowledgeable friend who's available 24/7! 😊",
        "I'm Campus Copilot - your AI companion for university life! 🎓 I can discuss any topic, help with campus services, and I genuinely enjoy our conversations. Think of me as that helpful friend who always knows what's happening on campus!"
      ],
      
      casual_inquiry: [
        "I'm doing fantastic! 😄 Thanks for asking! I love chatting with students and helping out around campus. How are you doing today? Anything exciting happening?",
        "I'm great, thanks for checking in! 🌟 Every conversation makes my day brighter. How about you? How's your day treating you?",
        "I'm wonderful! 😊 I get energized by every interaction. What about you? How are things going in your world?"
      ],
      
      general_help: [
        "I'd be delighted to help! 🤝 I can assist with campus information like schedules, menus, bus times, events, and university updates. Or we can just chat about whatever's on your mind! What would you like to explore?",
        "Absolutely! I'm here to help with anything you need. 💪 Whether it's finding campus info, answering questions, or just having a good conversation - I'm all ears! What's up?",
        "Of course! That's exactly why I'm here! 🌟 I can help with university services or we can talk about anything that interests you. What's on your mind?"
      ],
      
      compliment: [
        "Aww, thank you so much! 🥰 That really makes my day! I try my best to be helpful and friendly.",
        "You're so kind! 😊 Thank you! I really appreciate that. It motivates me to keep improving!",
        "Thank you! 🌟 Comments like yours make me want to be even better at helping students!"
      ],
      
      complaint: [
        "I'm sorry you're feeling that way. 😔 Is there something specific I can help improve or fix? I want to make sure you have a better experience.",
        "I understand your frustration. Let me see how I can help make things better for you. What's been bothering you?",
        "I'm sorry to hear that. Your feedback is important to me - how can I assist you better?"
      ],
      
      joke_request: [
        "Here's one for you! 😄 Why don't scientists trust atoms? Because they make up everything! Need another one?",
        "How about this: Why did the student eat his homework? Because the teacher said it was a piece of cake! 😂",
        "What do you call a student who doesn't want to go to school? Absent-minded! 🤣 Want more jokes?"
      ],
      
      weather: [
        "I wish I could check the weather for you! 🌤️ I don't have access to weather data, but you could check your weather app or ask about campus indoor activities if it's not great outside!",
        "I'd love to help with weather info, but that's outside my current abilities! ☀️ Is there anything campus-related I can help you with instead?"
      ],
      
      time_query: [
        `⏰ The current time is **${new Date().toLocaleTimeString()}**. Need help with anything time-sensitive?`,
        `Right now it's **${new Date().toLocaleTimeString()}**! ⏰ Are you checking the time for something specific?`
      ],
      
      date_query: [
        `📅 Today is **${new Date().toLocaleDateString()}**. Planning something special?`,
        `Today's date is **${new Date().toLocaleDateString()}**! 📅 Anything happening today I can help you with?`
      ],
      
      clarification: [
        "I'd be happy to explain better! 😊 What part would you like me to clarify? I want to make sure I'm being helpful and clear.",
        "Of course! Let me try to explain that differently. What specifically can I help clarify for you?",
        "No problem! I want to make sure I'm being clear. What would you like me to explain better?"
      ]
    };

    // Get response for the conversation type
    const responseArray = responses[conversationType] || [
      "That's interesting! 😊 I enjoy our conversation. Is there anything specific about campus life I can help you with, or would you like to keep chatting?",
      "I appreciate you sharing that with me! 🌟 What else is on your mind today?",
      "Thanks for chatting with me! 💫 I'm here for any campus questions or just good conversation. What would you like to talk about?"
    ];

    let response = responseArray[Math.floor(Math.random() * responseArray.length)];

    // Add contextual suggestions based on detected but not strong enough campus topics
    if (analysis.detectedTopics && analysis.detectedTopics.length > 0) {
      const weakTopics = analysis.detectedTopics.filter(t => t.score < 1.0);
      if (weakTopics.length > 0) {
        response += `\n\n💡 *By the way, I noticed you might be interested in ${weakTopics[0].topic}. Feel free to ask me about that anytime!*`;
      }
    }

    return response;
  }

  // Add conversational wrapper to campus info responses
  addConversationalWrapper(infoResponse, conversationType, userMessage) {
    const wrappers = [
      "Great question! Here's what I found:",
      "I'd be happy to help with that! Here's the information:",
      "Let me check that for you... Got it!",
      "Here's what I can tell you about that:",
      "Perfect! I have that information right here:"
    ];

    const wrapper = wrappers[Math.floor(Math.random() * wrappers.length)];
    
    return `${wrapper}\n\n${infoResponse}\n\n💬 *Feel free to ask me anything else or just chat!*`;
  }

  // Format campus information responses
  formatCampusInfoResponse(intent, actionResults) {
    switch (intent) {
      case 'schedules':
        return this.formatScheduleResponse(actionResults);
      case 'menus':
        return this.formatMenuResponse(actionResults);
      case 'buses':
        return this.formatBusResponse(actionResults);
      case 'events':
        return this.formatEventResponse(actionResults);
      case 'updates':
        return this.formatUpdateResponse(actionResults);
      case 'faqs':
        return this.formatFAQResponse(actionResults);
      default:
        return "I found some information, but I'm not sure how to present it best. Could you be more specific about what you're looking for?";
    }
  }

  // Format response methods (same as before but more conversational)
  formatScheduleResponse(results) {
    const scheduleResult = results.find(r => r.action === 'getSchedules');
    if (!scheduleResult || !scheduleResult.result.success) {
      return "I couldn't retrieve the class schedules right now. Maybe try again in a moment?";
    }

    const schedules = scheduleResult.result.data;
    if (schedules.length === 0) {
      return "📅 Looks like you're free - no classes scheduled for that time! Perfect opportunity to relax or catch up on other things! 😊";
    }

    let response = "📅 **Your Class Schedule:**\n\n";
    schedules.slice(0, 5).forEach(schedule => {
      response += `🎓 **${schedule.subject}**\n`;
      response += `⏰ ${schedule.start_time} - ${schedule.end_time}\n`;
      response += `📍 Room ${schedule.room_number}, ${schedule.building}\n`;
      response += `👨‍🏫 ${schedule.instructor}\n\n`;
    });

    if (schedules.length > 5) {
      response += `*...and ${schedules.length - 5} more classes. You've got a busy schedule!*`;
    }

    return response;
  }

  formatMenuResponse(results) {
    const menuResult = results.find(r => r.action === 'getMenus');
    if (!menuResult || !menuResult.result.success) {
      return "I couldn't get the menu right now. Maybe the cafeteria system is updating? Try again in a bit!";
    }

    const menus = menuResult.result.data;
    if (menus.length === 0) {
      return "🍽️ Hmm, looks like the menu isn't available for that time. Maybe check with the cafeteria directly?";
    }

    let response = "🍽️ **Today's Delicious Options:**\n\n";
    
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
    mealTypes.forEach(mealType => {
      const mealItems = menus.filter(menu => menu.meal_type === mealType);
      if (mealItems.length > 0) {
        response += `**${mealType.charAt(0).toUpperCase() + mealType.slice(1)}:**\n`;
        mealItems.slice(0, 3).forEach(item => {
          response += `• ${item.item_name} - LKR${item.price}\n`;
        });
        response += '\n';
      }
    });

    response += "*Hope you find something tasty! 😋*";
    return response;
  }

  formatBusResponse(results) {
    const busResult = results.find(r => r.action === 'getBuses');
    if (!busResult || !busResult.result.success) {
      return "I couldn't get the bus schedules right now. Transportation info might be updating!";
    }

    const buses = busResult.result.data.filter(bus => bus.is_active);
    if (buses.length === 0) {
      return "🚌 No active buses right now. Maybe check back later or consider alternative transport?";
    }

    let response = "🚌 **Available Bus Routes:**\n\n";
    buses.slice(0, 5).forEach(bus => {
      response += `🚌 **${bus.route_name}**\n`;
      response += `📍 ${bus.departure_location} → ${bus.arrival_location}\n`;
      response += `⏰ ${bus.departure_time} - ${bus.arrival_time}\n`;
      response += `💰 LKR${bus.fare}\n\n`;
    });

    response += "*Have a safe trip! 🚌*";
    return response;
  }

  formatEventResponse(results) {
    const eventResult = results.find(r => r.action === 'getEvents');
    if (!eventResult || !eventResult.result.success) {
      return "I couldn't get the event info right now. Maybe try again later?";
    }

    const events = eventResult.result.data;
    if (events.length === 0) {
      return "📢 No upcoming events found. Things might be quiet for now, or maybe new events are being planned!";
    }

    let response = "📢 **Exciting Upcoming Events:**\n\n";
    events.forEach(event => {
      response += `🎉 **${event.title}**\n`;
      response += `📅 ${new Date(event.event_date).toLocaleDateString()}\n`;
      response += `📍 ${event.location}\n\n`;
    });

    response += "*Hope you find something fun to join! 🎉*";
    return response;
  }

  formatUpdateResponse(results) {
    const updateResult = results.find(r => r.action === 'getUpdates');
    if (!updateResult || !updateResult.result.success) {
      return "I couldn't get the latest updates right now. Try checking again in a moment!";
    }

    const updates = updateResult.result.data;
    if (updates.length === 0) {
      return "📢 No recent updates. That's either really good news or things are just quiet! 😊";
    }

    let response = "📢 **Latest Campus Updates:**\n\n";
    updates.forEach(update => {
      response += `📌 **${update.title}**\n`;
      if (update.summary) {
        response += `${update.summary}\n\n`;
      }
    });

    response += "*Stay informed! 📰*";
    return response;
  }

  formatFAQResponse(results) {
    const faqResult = results.find(r => r.action === 'searchFAQs' || r.action === 'getFAQs');
    if (!faqResult || !faqResult.result.success) {
      return "I couldn't search the FAQs right now. Feel free to ask me directly - I might still be able to help!";
    }

    const faqs = faqResult.result.data;
    if (faqs.length === 0) {
      return "❓ I couldn't find specific FAQs for that, but feel free to ask me directly! I might know the answer or can point you in the right direction.";
    }

    let response = "❓ **Here's what I found:**\n\n";
    faqs.slice(0, 3).forEach(faq => {
      response += `**Q: ${faq.question}**\n`;
      response += `A: ${faq.answer}\n\n`;
    });

    if (faqs.length > 3) {
      response += `*Found ${faqs.length - 3} more related answers.*`;
    }

    return response;
  }

  // Main processing method
  async processMessage(userMessage) {
    try {
      // Analyze the message
      const analysis = this.analyzeIntent(userMessage);
      
      // Plan and execute actions if needed
      const actions = this.planActions(analysis);
      const actionResults = await this.executeActions(actions);
      
      // Generate response
      const response = this.generateResponse(userMessage, analysis, actionResults);
      
      // Update conversation history
      this.conversationHistory.push({
        user: userMessage,
        intent: analysis.intent,
        isCampusInfo: analysis.isCampusInfoRequest,
        response: response,
        timestamp: new Date()
      });

      return {
        success: true,
        response,
        intent: analysis.intent,
        confidence: analysis.confidence,
        isCampusInfoRequest: analysis.isCampusInfoRequest
      };
    } catch (error) {
      console.error('Chat processing error:', error);
      return {
        success: false,
        response: "I'm having a bit of trouble processing that right now. Could you try rephrasing, or ask me something else? I'm still here to help! 😊",
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const campusCopilotAgent = new CampusCopilotAgent();
export default campusCopilotAgent;
