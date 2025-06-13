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
      getUpdates: this.getUpdates.bind(this),      getFAQs: this.getFAQs.bind(this),
      searchFAQs: this.searchFAQs.bind(this),
      getCurrentTime: this.getCurrentTime.bind(this),
      getCurrentDate: this.getCurrentDate.bind(this),
      getWeatherInfo: this.getWeatherInfo.bind(this),
      getMotivationalQuote: this.getMotivationalQuote.bind(this),
      getStudyTip: this.getStudyTip.bind(this),
      getFunFact: this.getFunFact.bind(this),
      getGeneralKnowledge: this.getGeneralKnowledge.bind(this)
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
  }  // Advanced conversational intent analysis - detects campus info requests AND general knowledge questions
  analyzeIntent(userMessage) {
    const message = userMessage.toLowerCase();
    
    // First check for explicit weather queries (highest priority)
    if (/\b(weather|temperature|rain|sunny|cloudy|climate|hot|cold|forecast)\b/i.test(message)) {
      return {
        intent: 'weather',
        confidence: 0.95,
        entities: { query: userMessage },
        detectedTopics: [{ topic: 'weather', score: 5, confidence: 0.95 }],
        isCampusInfoRequest: false,
        conversationType: 'weather',
        maxScore: 5,
        message: userMessage
      };
    }

    // Check for explicit FAQ queries (high priority)
    if (/\b(faq|faqs|frequently asked|questions|tell me faqs)\b/i.test(message)) {
      return {
        intent: 'faqs',
        confidence: 0.95,
        entities: { query: userMessage },
        detectedTopics: [{ topic: 'faqs', score: 5, confidence: 0.95 }],
        isCampusInfoRequest: true,
        conversationType: 'general_help',
        maxScore: 5,
        message: userMessage
      };
    }

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
        weight: 2.0
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
        weight: 1.8
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
        weight: 1.5
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
        weight: 1.3
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
        weight: 1.2
      },
      faqs: {
        keywords: [
          'faq', 'faqs', 'question', 'questions', 'help', 'procedure', 'process', 
          'requirement', 'apply', 'registration', 'admission', 'form', 'document'
        ],
        phrases: [
          'how do i', 'how to', 'what is the process', 'where can i',
          'how can i apply', 'registration process', 'admission procedure',
          'library card', 'student id', 'fee payment', 'hostel admission',
          'need help with', 'confused about', 'don\'t know how', 'frequently asked',
          'tell me faqs', 'show me faqs'
        ],
        contextWords: ['apply', 'register', 'admission', 'procedure', 'process', 'requirement', 'document', 'form'],
        weight: 1.4
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
    const campusInfoThreshold = 2.0; // Increased threshold for more precision
    const isCampusInfoRequest = maxScore >= campusInfoThreshold;

    // If not a campus info request, check if it's a general knowledge question
    if (!isCampusInfoRequest) {
      const isGeneralKnowledgeQuestion = this.isGeneralKnowledgeQuestion(message);
      if (isGeneralKnowledgeQuestion) {
        return {
          intent: 'general_knowledge',
          confidence: 0.85,
          entities: this.extractEntities(message, 'general_knowledge'),
          detectedTopics,
          isCampusInfoRequest: false,
          conversationType: 'general_knowledge',
          maxScore: 0,
          message: userMessage
        };
      }
    }

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

  // Check if a message is a general knowledge question
  isGeneralKnowledgeQuestion(message) {
    const questionPatterns = [
      /^(what|who|when|where|why|how|which|can you tell me|do you know|explain|define|describe)/i,
      /\b(what is|who is|what are|who are|tell me about|explain|definition of|meaning of)\b/i,
      /\?(.*)?$/,  // Ends with question mark
      /(is|are|was|were|does|do|did|will|would|could|should|may|might)\s+/i
    ];

    // Check if it matches question patterns
    const isQuestion = questionPatterns.some(pattern => pattern.test(message));
    
    // Also check for specific knowledge areas
    const knowledgeAreas = [
      /\b(history|science|physics|chemistry|biology|mathematics|geography|literature|philosophy|psychology|sociology|economics|politics|technology|computer|programming|art|music|culture|religion|sports|medicine|health|astronomy|space|nature|environment|climate|countries|cities|languages|famous people|celebrities|inventors|scientists|writers|artists|musicians|leaders|presidents|kings|queens)\b/i,
      /\b(university|college|school|education|degree|diploma|course|study|learning|research|academic|scholarly|professor|teacher|student|exam|test|grade|semester|term|thesis|dissertation|library|laboratory|experiment)\b/i,
      /\b(company|business|corporation|organization|industry|economy|market|finance|investment|technology|innovation|startup|entrepreneur|CEO|founder|brand|product|service)\b/i
    ];

    const hasKnowledgeKeywords = knowledgeAreas.some(pattern => pattern.test(message));

    return isQuestion || hasKnowledgeKeywords;
  }

  // Determine conversation type for natural responses
  determineConversationType(message) {
    const patterns = {
      greeting: /\b(hello|hi|hey|good morning|good afternoon|good evening|greetings|howdy)\b/i,
      farewell: /\b(bye|goodbye|see you|farewell|take care|catch you later)\b/i,
      gratitude: /\b(thank|thanks|appreciate|grateful|thx)\b/i,      question_about_bot: /\b(who are you|what are you|what can you do|your capabilities|about yourself|introduce yourself)\b/i,
      casual_inquiry: /\b(how are you|whats up|hows it going|whats new|how you doing)\b/i,
      general_help: /\b(help|assist|support|guide me|can you help|need help)\b/i,
      clarification: /\b(what do you mean|can you explain|i dont understand|unclear|confused)\b/i,
      compliment: /\b(good job|well done|amazing|awesome|great|excellent|fantastic)\b/i,
      complaint: /\b(bad|terrible|awful|horrible|frustrated|annoyed)\b/i,      joke_request: /\b(joke|funny|humor|laugh|entertainment|make me laugh|tell me a joke)\b/i,
      weather: /\b(weather|temperature|rain|sunny|cloudy|climate|hot|cold|forecast)\b/i,
      sports: /\b(sport|sports|game|games|football|basketball|cricket|match|tournament|fitness|gym|exercise)\b/i,
      motivation: /\b(motivate|motivation|inspire|inspiration|encourage|boost|confident|believe|dream|goal|achieve)\b/i,
      fun_fact: /\b(fun fact|interesting|did you know|trivia|fact|random fact|tell me something)\b/i,
      study_tips: /\b(study|studying|exam|test|preparation|tips|focus|concentration|learning)\b/i,
      stress_relief: /\b(stress|stressed|anxious|worried|overwhelmed|tired|exhausted|relax|calm)\b/i,
      food_recommendation: /\b(hungry|food recommendation|what should i eat|craving|snack|meal idea)\b/i,
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
    }    switch (intent) {
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
        break;      case 'faqs':
        if (entities.query && entities.query.toLowerCase().includes('faq')) {
          // General FAQ request - get all FAQs
          actions.push({
            tool: 'getFAQs',
            params: {}
          });
        } else {
          // Specific question - search FAQs
          actions.push({
            tool: 'searchFAQs',
            params: entities.query || 'general'
          });
        }
        break;

      default:
        // No actions needed for general conversation
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

  // Enhanced weather info (simulated since we don't have real weather API)
  getWeatherInfo() {
    const weatherOptions = [
      { condition: 'Sunny', temp: '22°C', emoji: '☀️', advice: 'Perfect day for outdoor activities on campus!' },
      { condition: 'Partly Cloudy', temp: '20°C', emoji: '⛅', advice: 'Great weather for a campus walk!' },
      { condition: 'Cloudy', temp: '18°C', emoji: '☁️', advice: 'Good day for indoor studying at the library!' },
      { condition: 'Light Rain', temp: '16°C', emoji: '🌦️', advice: 'Cozy weather for the student center!' },
      { condition: 'Overcast', temp: '19°C', emoji: '🌫️', advice: 'Perfect atmosphere for focused studying!' }
    ];
    
    const randomWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
    
    return {
      success: true,
      data: randomWeather,
      message: `Current weather: ${randomWeather.condition}, ${randomWeather.temp}`
    };
  }

  // Motivational quotes
  getMotivationalQuote() {
    const quotes = [
      { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
      { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
      { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
      { quote: "The expert in anything was once a beginner.", author: "Helen Hayes" },
      { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
      { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
      { quote: "The only impossible journey is the one you never begin.", author: "Tony Robbins" }
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    return {
      success: true,
      data: randomQuote,
      message: 'Motivational quote retrieved'
    };
  }

  // Study tips
  getStudyTip() {
    const tips = [
      "🧠 Use the Feynman Technique: Explain concepts in simple terms as if teaching someone else.",
      "⏰ Try the Pomodoro Technique: 25 minutes focused study + 5 minute break.",
      "📝 Active recall beats passive reading: Test yourself frequently without looking at notes.",
      "🎵 Study with instrumental music or white noise to improve concentration.",
      "💧 Stay hydrated! Dehydration can reduce cognitive performance by up to 12%.",
      "🚶‍♀️ Take walking breaks: Light exercise boosts memory and creativity.",
      "🌅 Study your hardest subjects when your energy is highest (usually morning).",
      "📚 Spaced repetition: Review material after 1 day, 3 days, 1 week for long-term retention."
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    return {
      success: true,
      data: randomTip,
      message: 'Study tip retrieved'
    };
  }

  // Fun facts
  getFunFact() {
    const facts = [
      "🧠 Your brain generates about 20 watts of electrical power - enough to power a dim light bulb!",
      "📚 Reading for just 6 minutes can reduce stress levels by up to 68%.",
      "☕ Coffee doesn't actually give you energy - it just blocks the chemicals that make you feel tired.",
      "🌙 You're about 1cm taller in the morning than at night due to gravity compressing your spine.",
      "🐙 Octopuses have three hearts and blue blood!",
      "🍯 Honey never spoils - edible honey has been found in ancient Egyptian tombs.",
      "🧊 Hot water freezes faster than cold water under certain conditions (Mpemba effect).",
      "🦋 Butterflies taste with their feet and smell with their antennae!"
    ];
    
    const randomFact = facts[Math.floor(Math.random() * facts.length)];
      return {
      success: true,
      data: randomFact,
      message: 'Fun fact retrieved'
    };
  }
  // Universal Knowledge AI - Comprehensive knowledge system like ChatGPT
  getGeneralKnowledge(query) {
    // Analyze the query to determine what type of information is being requested
    const normalizedQuery = query.toLowerCase().trim();
    
    // Enhanced pattern matching for different types of questions
    const queryAnalysis = this.analyzeKnowledgeQuery(normalizedQuery);
    
    // Try to generate a comprehensive response based on the query type
    return this.generateKnowledgeResponse(query, queryAnalysis);
  }

  // Analyze what type of knowledge query this is
  analyzeKnowledgeQuery(query) {
    const patterns = {
      person: {
        patterns: [
          /who is|who was|tell me about|about (.*?)(\?|$)/i,
          /biography of|life of|history of (.*?)(\?|$)/i,
          /(.*?) biography|life story/i
        ],
        indicators: ['person', 'people', 'scientist', 'author', 'president', 'actor', 'singer', 'leader', 'inventor', 'philosopher', 'artist']
      },
      place: {
        patterns: [
          /where is|what is|tell me about (.*?) (country|city|place|location)/i,
          /capital of|population of|history of (.*?)(\?|$)/i
        ],
        indicators: ['country', 'city', 'place', 'continent', 'ocean', 'mountain', 'river', 'capital']
      },
      concept: {
        patterns: [
          /what is|what are|explain|define|definition of/i,
          /how does|how do|what does|what do/i,
          /meaning of|concept of/i
        ],
        indicators: ['theory', 'concept', 'principle', 'law', 'equation', 'formula', 'process']
      },
      historical: {
        patterns: [
          /when did|when was|what happened|history of/i,
          /during|in (.*?) (war|period|era|century)/i
        ],
        indicators: ['war', 'battle', 'revolution', 'empire', 'dynasty', 'period', 'era', 'century', 'ancient', 'medieval']
      },
      scientific: {
        patterns: [
          /how does|what is|explain|science of/i,
          /chemical|physical|biological|medical/i
        ],
        indicators: ['element', 'molecule', 'atom', 'cell', 'organ', 'species', 'evolution', 'genetics', 'physics', 'chemistry', 'biology']
      },
      technological: {
        patterns: [
          /how does|what is|technology|computer|software|internet/i
        ],
        indicators: ['computer', 'software', 'internet', 'algorithm', 'programming', 'artificial', 'digital', 'cyber']
      }
    };

    let queryType = 'general';
    let confidence = 0;

    for (const [type, data] of Object.entries(patterns)) {
      let typeScore = 0;
      
      // Check patterns
      for (const pattern of data.patterns) {
        if (pattern.test(query)) {
          typeScore += 3;
        }
      }
      
      // Check indicators
      for (const indicator of data.indicators) {
        if (query.includes(indicator)) {
          typeScore += 1;
        }
      }
      
      if (typeScore > confidence) {
        confidence = typeScore;
        queryType = type;
      }
    }

    return { type: queryType, confidence, originalQuery: query };
  }

  // Generate comprehensive knowledge responses based on query analysis
  generateKnowledgeResponse(originalQuery, analysis) {
    const query = analysis.originalQuery.toLowerCase().trim();
    
    // First, try exact and partial matches in our enhanced knowledge base
    const knowledgeMatch = this.searchEnhancedKnowledgeBase(query);
    if (knowledgeMatch) {
      return knowledgeMatch;
    }

    // If no direct match, generate contextual responses based on query type
    return this.generateContextualResponse(originalQuery, analysis);
  }

  // Enhanced knowledge base with broader coverage
  searchEnhancedKnowledgeBase(query) {
    const knowledgeBase = {
      // Famous People - Scientists
      "albert einstein": "Albert Einstein (1879-1955) was a German-born theoretical physicist who developed the theory of relativity, one of the pillars of modern physics. Famous for E=mc², he won the Nobel Prize in Physics in 1921. His work revolutionized our understanding of space, time, and gravity.",
      "isaac newton": "Sir Isaac Newton (1643-1727) was an English mathematician, physicist, and astronomer. He formulated the laws of motion and universal gravitation, invented calculus, and wrote 'Principia Mathematica'. He's considered one of the greatest scientists in history.",
      "nikola tesla": "Nikola Tesla (1856-1943) was a Serbian-American inventor and electrical engineer. He developed AC electrical systems, wireless technology, and over 300 patents. His inventions include the Tesla coil and contributions to modern electrical power systems.",
      "marie curie": "Marie Curie (1867-1934) was a Polish-French physicist and chemist who conducted pioneering research on radioactivity. She was the first woman to win a Nobel Prize and the only person to win Nobel Prizes in two different sciences (Physics and Chemistry).",
      "galileo galilei": "Galileo Galilei (1564-1642) was an Italian astronomer, physicist, and engineer. He improved the telescope, discovered Jupiter's moons, and supported heliocentrism. His work laid the foundation for modern observational astronomy and physics.",
      "charles darwin": "Charles Darwin (1809-1882) was an English naturalist who proposed the theory of evolution through natural selection. His book 'On the Origin of Species' revolutionized biology and our understanding of life on Earth.",
      "stephen hawking": "Stephen Hawking (1942-2018) was a British theoretical physicist known for his work on black holes and cosmology. Despite having ALS, he wrote 'A Brief History of Time' and made groundbreaking contributions to our understanding of the universe.",

      // Historical Figures
      "leonardo da vinci": "Leonardo da Vinci (1452-1519) was an Italian Renaissance polymath - artist, inventor, scientist, and engineer. He painted the Mona Lisa and The Last Supper, designed flying machines, and made anatomical studies centuries ahead of his time.",
      "william shakespeare": "William Shakespeare (1564-1616) was an English playwright and poet, widely regarded as the greatest writer in English literature. He wrote 39 plays and 154 sonnets, including Hamlet, Romeo and Juliet, and Macbeth.",
      "napoleon bonaparte": "Napoleon Bonaparte (1769-1821) was a French military general and political leader who became Emperor of the French. He conquered much of continental Europe and left lasting impacts on law, education, and governance.",
      "abraham lincoln": "Abraham Lincoln (1809-1865) was the 16th President of the United States who led the nation through the Civil War. He issued the Emancipation Proclamation and is remembered for preserving the Union and ending slavery.",
      "mahatma gandhi": "Mahatma Gandhi (1869-1948) was an Indian independence activist who led India's non-violent resistance movement against British rule. His philosophy of non-violent civil disobedience influenced civil rights movements worldwide.",
      "nelson mandela": "Nelson Mandela (1918-2013) was a South African anti-apartheid activist and politician who served as President of South Africa from 1994-1999. He spent 27 years in prison and became a symbol of resistance to apartheid.",

      // Modern Figures
      "bill gates": "Bill Gates (born 1955) is an American business magnate, software developer, and philanthropist. He co-founded Microsoft Corporation and became one of the world's richest people. Now focuses on global health and education through the Gates Foundation.",
      "steve jobs": "Steve Jobs (1955-2011) was an American entrepreneur and co-founder of Apple Inc. He revolutionized personal computing, mobile phones, and digital entertainment with products like the iPhone, iPad, and iPod.",
      "elon musk": "Elon Musk (born 1971) is a South African-American entrepreneur and business magnate. He's CEO of Tesla and SpaceX, and has been involved in PayPal, Neuralink, and other ventures. Known for advancing electric vehicles and space exploration.",
      "jeff bezos": "Jeff Bezos (born 1964) is an American entrepreneur who founded Amazon.com in 1994. He built it from an online bookstore into one of the world's largest e-commerce and cloud computing companies.",

      // Countries and Places
      "united states": "The United States of America is a federal republic of 50 states located in North America. Founded in 1776, it's the world's largest economy and third-most populous country, known for its cultural diversity and global influence.",
      "china": "China, officially the People's Republic of China, is the world's most populous country with over 1.4 billion people. It has the world's second-largest economy and a rich history spanning thousands of years.",
      "japan": "Japan is an island nation in East Asia known for its unique culture, advanced technology, and strong economy. It consists of four main islands and is famous for sushi, anime, automobiles, and electronics.",
      "france": "France is a country in Western Europe known for its rich culture, cuisine, art, and fashion. Home to the Eiffel Tower, Louvre Museum, and the French Riviera, it's the world's most visited tourist destination.",
      "germany": "Germany is a country in Central Europe known for its strong economy, engineering expertise, and rich history. It's the most populous member of the European Union and a leader in automotive and manufacturing industries.",

      // Universities and Educational Institutions
      "harvard university": "Harvard University, founded in 1636, is a private Ivy League research university in Cambridge, Massachusetts. It's one of the world's most prestigious universities, known for producing numerous presidents, Nobel laureates, and business leaders.",
      "mit": "MIT (Massachusetts Institute of Technology) is a private research university in Cambridge, Massachusetts. Founded in 1861, it's renowned for its programs in engineering, computer science, and technology innovation.",
      "oxford university": "The University of Oxford, founded around 1096, is the oldest university in the English-speaking world. Located in Oxford, England, it's one of the world's leading academic institutions.",
      "cambridge university": "The University of Cambridge, founded in 1209, is a collegiate research university in Cambridge, England. It's one of the world's oldest and most prestigious universities, known for academic excellence.",
      "stanford university": "Stanford University is a private research university in California's Silicon Valley. Founded in 1885, it's known for its strong programs in technology, business, and medicine, and its proximity to tech companies.",
      "nsbm green university": "NSBM Green University is a leading private university in Sri Lanka, established in 2010. Known for its green campus concept and modern facilities, it offers undergraduate and postgraduate programs in business, computing, engineering, and management.",

      // Science and Technology
      "artificial intelligence": "Artificial Intelligence (AI) is the simulation of human intelligence in machines. It includes machine learning, natural language processing, computer vision, and robotics, aiming to create systems that can perform tasks requiring human-like intelligence.",
      "machine learning": "Machine Learning is a subset of AI that enables computers to learn and improve from experience without being explicitly programmed. It uses algorithms to analyze data, identify patterns, and make predictions or decisions.",
      "quantum physics": "Quantum physics is the branch of physics that studies matter and energy at the smallest scales - atoms and subatomic particles. It reveals that particles can exist in multiple states simultaneously and behave differently than our everyday experience suggests.",
      "dna": "DNA (Deoxyribonucleic Acid) is the hereditary material in all living organisms. It contains genetic instructions for development, functioning, and reproduction, structured as a double helix with four chemical bases: A, T, G, and C.",
      "internet": "The Internet is a global network of interconnected computers that communicate using standardized protocols. Originating from ARPANET in the 1960s, it has revolutionized communication, commerce, education, and entertainment worldwide.",
      "cryptocurrency": "Cryptocurrency is a digital or virtual currency secured by cryptography, making it nearly impossible to counterfeit. Bitcoin, created in 2009, was the first cryptocurrency, and thousands of others now exist.",

      // Historical Events
      "world war 2": "World War II (1939-1945) was the deadliest conflict in human history, involving most of the world's nations. Key events include the Holocaust, Pearl Harbor, D-Day, and the atomic bombings of Hiroshima and Nagasaki.",
      "industrial revolution": "The Industrial Revolution (1760-1840) was a period of major technological and social change that began in Britain. It marked the transition from manual labor to mechanized manufacturing, fundamentally changing society.",
      "renaissance": "The Renaissance (14th-17th centuries) was a period of cultural rebirth in Europe, marking the transition from medieval to modern times. It saw advances in art, science, literature, and philosophy, with figures like Leonardo da Vinci and Michelangelo.",

      // Concepts and Theories
      "theory of relativity": "Einstein's theory of relativity consists of special (1905) and general (1915) relativity. It revolutionized physics by showing that space and time are interwoven and that gravity is the curvature of spacetime.",
      "evolution": "Evolution is the process by which different kinds of living organisms develop from earlier forms. Charles Darwin's theory of natural selection explains how species change over time through survival of the fittest.",
      "democracy": "Democracy is a system of government where citizens exercise power by voting. In a direct democracy, citizens vote on policy initiatives directly, while in representative democracy, they elect representatives to make decisions.",
      "capitalism": "Capitalism is an economic system based on private ownership of production means and free markets. It emphasizes individual economic freedom, competition, and profit motive as drivers of economic growth.",

      // Arts and Literature
      "mona lisa": "The Mona Lisa is Leonardo da Vinci's famous portrait painting (1503-1519) of Lisa Gherardini. Known for her enigmatic smile, it's housed in the Louvre Museum and is considered one of the world's most valuable paintings.",
      "hamlet": "Hamlet is a tragedy written by William Shakespeare around 1600-1601. It tells the story of Prince Hamlet's revenge against his uncle Claudius, who murdered Hamlet's father. It's one of the most performed and studied plays in English literature."
    };

    // Enhanced search with partial matching and synonyms
    const searchTerms = [
      query,
      ...this.generateSearchVariations(query)
    ];

    for (const term of searchTerms) {
      // Direct match
      if (knowledgeBase[term]) {
        return {
          success: true,
          data: {
            question: query,
            answer: knowledgeBase[term],
            source: "knowledge_base"
          },
          message: 'Knowledge retrieved successfully'
        };
      }

      // Partial match
      for (const [key, answer] of Object.entries(knowledgeBase)) {
        if (key.includes(term) || term.includes(key)) {
          return {
            success: true,
            data: {
              question: query,
              answer: answer,
              source: "knowledge_base"
            },
            message: 'Knowledge retrieved successfully'
          };
        }
      }
    }

    return null;
  }

  // Generate search variations for better matching
  generateSearchVariations(query) {
    const variations = [];
    
    // Remove common question words
    const cleaned = query.replace(/^(who is|what is|tell me about|about|when was|where is|how does|why does|explain|define)\s*/i, '');
    if (cleaned !== query) {
      variations.push(cleaned);
    }

    // Handle possessive forms
    const withoutPossessive = query.replace(/'s\b/g, '');
    if (withoutPossessive !== query) {
      variations.push(withoutPossessive);
    }

    // Handle plurals
    if (query.endsWith('s') && query.length > 3) {
      variations.push(query.slice(0, -1));
    }

    return variations;
  }

  // Generate contextual responses for queries not in the knowledge base
  generateContextualResponse(originalQuery, analysis) {
    const responseTemplates = {
      person: this.generatePersonResponse(originalQuery),
      place: this.generatePlaceResponse(originalQuery),
      concept: this.generateConceptResponse(originalQuery),
      historical: this.generateHistoricalResponse(originalQuery),
      scientific: this.generateScientificResponse(originalQuery),
      technological: this.generateTechnologicalResponse(originalQuery),
      general: this.generateGeneralResponse(originalQuery)
    };

    const response = responseTemplates[analysis.type] || responseTemplates.general;

    return {
      success: true,
      data: {
        question: originalQuery,
        answer: response,
        source: "contextual_ai"
      },
      message: 'Contextual response generated'
    };
  }

  generatePersonResponse(query) {
    // Extract potential name from the query
    const nameMatch = query.match(/(?:who is|tell me about|about)\s+([^?]+)/i);
    const name = nameMatch ? nameMatch[1].trim() : query;

    return `I'd be happy to help you learn about ${name}! While I don't have specific biographical information about this person in my current knowledge base, here are some ways I can assist:

🔍 **If this is a:**
• **Historical Figure**: I can discuss their era, historical context, or related events
• **Scientist/Inventor**: I can explain their field of study or related scientific concepts
• **Artist/Writer**: I can discuss their artistic movement or genre
• **Political Leader**: I can provide context about their time period or political system

💡 **What I can definitely help with:**
• Explaining concepts related to their field
• Discussing historical periods they lived in
• Providing information about similar figures I do know about
• Answering campus-related questions anytime!

Could you provide more context about ${name} or ask about a related topic? I'm here to help with both general knowledge and campus information! 😊`;
  }

  generatePlaceResponse(query) {
    const placeMatch = query.match(/(?:where is|what is|about)\s+([^?]+)/i);
    const place = placeMatch ? placeMatch[1].trim() : query;

    return `I'd love to help you learn about ${place}! While I don't have specific details about this location in my current database, I can help in several ways:

🌍 **Geographic Context:**
• If it's a **country**: I can discuss its region, neighboring countries, or general characteristics
• If it's a **city**: I can explain its significance or the country it's in
• If it's a **landmark**: I can discuss its historical or cultural importance

📚 **Related Information I Can Provide:**
• Historical context of the region
• Cultural or geographical features of the area
• Economic or political systems
• Related places I do have information about

🎓 **Plus Campus Help:**
• Transportation information if you're planning to visit
• Study abroad programs our university might offer
• Cultural events on campus related to different countries

Feel free to ask more specific questions about ${place} or anything else - including campus services! 🌟`;
  }

  generateConceptResponse(query) {
    return `That's a great question about "${query}"! I love helping with conceptual understanding. While I might not have the complete details on this specific topic, here's how I can help:

🧠 **Learning Approach:**
• **Break it down**: What specific aspect interests you most?
• **Related concepts**: I might know about similar or foundational ideas
• **Practical applications**: How this concept might be used in real life
• **Academic context**: Which field of study this belongs to

💡 **Study Support:**
• If this is for a class, I can help you understand the broader subject
• Study techniques for complex concepts
• Campus resources like library databases or study groups
• Tutoring services available on campus

📚 **What I can definitely explain:**
• Basic scientific principles
• Historical contexts
• Technological foundations
• Academic methodologies

Could you tell me more about what specific aspect you're trying to understand? Or would you like me to help you find campus resources for deeper research? I'm here for both academic support and general curiosity! 🎓`;
  }

  generateHistoricalResponse(query) {
    return `History is fascinating! While I don't have detailed information about "${query}" specifically, I can definitely help you explore this historical topic:

📜 **Historical Context I Can Provide:**
• **Time periods**: Ancient, medieval, modern eras and their characteristics
• **Major civilizations**: Their rise, achievements, and influence
• **Historical patterns**: How events typically unfolded in different eras
• **Cause and effect**: How historical events influenced each other

🎓 **Academic Support:**
• Research methodology for historical topics
• How to analyze primary vs secondary sources
• Campus library resources for historical research
• History study groups or tutoring available

🌍 **Broader Understanding:**
• How this event/period connects to world history
• Similar events or patterns in other regions
• Long-term impacts and legacy
• Related topics I can explain in detail

💫 **What I excel at:**
• Explaining historical concepts and methodologies
• Discussing major historical figures and events I know well
• Helping with campus resources for your research
• Study techniques for history courses

Would you like me to help you find campus resources for researching this topic, or ask about a related historical concept? I'm here for both academic support and satisfying curiosity! 📚`;
  }

  generateScientificResponse(query) {
    return `Science questions are my favorite! While I don't have specific details about "${query}" in my current knowledge base, I can definitely help you understand this scientific concept:

🔬 **Scientific Understanding I Can Provide:**
• **Fundamental principles**: Basic laws and theories that might relate
• **Scientific method**: How this topic would be studied or researched
• **Related fields**: What branch of science this belongs to
• **Real-world applications**: How this concept might be used practically

⚗️ **Study Support:**
• Breaking down complex scientific concepts
• Laboratory safety and procedures (if applicable)
• Campus science resources and facilities
• Study techniques for science courses
• Tutoring and study groups available

🧪 **What I excel at explaining:**
• Basic physics, chemistry, and biology principles
• How scientific theories develop and change
• Connections between different scientific fields
• Research methodologies

💡 **Practical Help:**
• Finding campus lab facilities
• Science club activities and events
• Research opportunities with professors
• Science career guidance

Would you like me to explain a related scientific principle I do know, help you find campus science resources, or break down what specific aspect of this topic interests you most? I'm here for both scientific curiosity and academic success! 🧬`;
  }

  generateTechnologicalResponse(query) {
    return `Technology is evolving so rapidly! While I don't have specific information about "${query}" in my current database, I can definitely help you understand this technological concept:

💻 **Technology Context I Can Provide:**
• **Core principles**: Fundamental concepts that underlie most technologies
• **Historical development**: How technologies typically evolve
• **Practical applications**: How technology solves real-world problems
• **Future implications**: General trends in technological advancement

🔧 **Learning Support:**
• Breaking down complex technical concepts
• Understanding how different technologies work together
• Campus computer labs and technology resources
• Programming and software development resources

⚡ **What I excel at explaining:**
• Basic computer science principles
• Internet and networking fundamentals
• Artificial intelligence and machine learning basics
• Software development concepts
• Technology's impact on society

🎓 **Campus Technology Resources:**
• Computer labs and software access
• Technology clubs and competitions
• Internship opportunities in tech
• Courses related to your technology interest

Would you like me to explain a foundational technology concept, help you find campus tech resources, or discuss how this technology might relate to your studies? I'm here for both tech curiosity and academic planning! 🚀`;
  }

  generateGeneralResponse(query) {
    return `Great question about "${query}"! I love learning about new topics together. While I don't have specific information about this in my current knowledge base, here's how I can help:

🤔 **Let's Explore Together:**
• What specific aspect interests you most?
• Is this related to a class or personal curiosity?
• Are you looking for basic understanding or detailed analysis?
• How does this connect to your studies or interests?

📚 **Learning Resources I Can Help With:**
• Campus library and research databases
• Study techniques for new topics
• Finding subject matter experts on campus
• Related concepts I do know about

💪 **My Strengths:**
• Explaining complex ideas in simple terms
• Connecting topics to real-world applications
• Breaking down learning into manageable steps
• Campus resources and services navigation

🎓 **Academic Support:**
• Research methodology and source evaluation
• Study groups and tutoring services
• Professor office hours and how to prepare
• Course planning and academic advising

🌟 **What I definitely excel at:**
• Campus information (schedules, menus, events, buses)
• Study tips and motivation
• University procedures and resources
• General conversation and support

Would you like me to help you find campus resources to research this topic, explain a related concept I do know, or assist with something campus-related? I'm here to support your learning journey in every way I can! 😊`;
  }

  // Execute planned actions
  async executeActions(actions) {
    const results = [];
    
    for (const action of actions) {
      try {
        const tool = this.tools[action.tool];
        if (tool) {
          let result;
          // Special handling for searchFAQs which takes a string parameter
          if (action.tool === 'searchFAQs') {
            result = await tool(action.params || 'general');
          } else {
            result = await tool(action.params);
          }
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
  }// Advanced conversational response generation
  generateResponse(userMessage, analysis, actionResults) {
    const { intent, isCampusInfoRequest, conversationType } = analysis;    // Handle weather queries first (special case)
    if (intent === 'weather') {
      const weatherInfo = this.getWeatherInfo();
      if (weatherInfo.success) {
        const weather = weatherInfo.data;
        return `${weather.emoji} **Current Weather:** ${weather.condition}, ${weather.temp}\n\n💡 ${weather.advice}\n\n*Note: This is simulated weather data. For real-time weather, check your weather app!*`;
      }
    }

    // Handle general knowledge questions
    if (intent === 'general_knowledge') {
      const knowledgeResult = this.getGeneralKnowledge(userMessage);
      if (knowledgeResult.success) {
        const knowledge = knowledgeResult.data;
        if (knowledge.source === "knowledge_base") {
          return `🧠 **${knowledge.question}**\n\n${knowledge.answer}\n\n💡 *Hope that helps! Feel free to ask me anything else - whether it's about campus life or general knowledge!*`;
        } else {
          // Fallback response
          return knowledge.answer;
        }
      }
    }

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
  }  // Generate natural conversational responses
  generateConversationalResponse(userMessage, conversationType, analysis) {
    // For certain conversation types, call tools and format responses
    if (conversationType === 'motivation') {
      const quote = this.getMotivationalQuote();
      if (quote.success) {
        return `✨ **Here's some inspiration for you:**\n\n"${quote.data.quote}"\n*— ${quote.data.author}*\n\n💪 You've got this! Keep pushing forward and remember that every small step counts toward your goals!`;
      }
    }
    
    if (conversationType === 'study_tips') {
      const tip = this.getStudyTip();
      if (tip.success) {
        return `📚 **Study Tip of the Day:**\n\n${tip.data}\n\n💡 *Remember: Consistency beats intensity. Small, regular study sessions are more effective than cramming!*\n\nNeed help finding a good study spot on campus?`;
      }
    }
      if (conversationType === 'fun_fact') {
      const fact = this.getFunFact();
      if (fact.success) {
        return `🤓 **Fun Fact Alert!**\n\n${fact.data}\n\n✨ *Isn't that amazing? Learning something new every day keeps the mind sharp!*\n\nWant another fun fact or is there something campus-related I can help with?`;
      }
    }

    if (conversationType === 'general_knowledge') {
      const knowledgeResult = this.getGeneralKnowledge(userMessage);
      if (knowledgeResult.success) {
        const knowledge = knowledgeResult.data;
        if (knowledge.source === "knowledge_base") {
          return `🧠 **Knowledge Corner: ${knowledge.question}**\n\n${knowledge.answer}\n\n🎓 *I love sharing knowledge! Ask me anything else - about campus life, science, history, or any topic that interests you!*`;
        } else {
          return knowledge.answer;
        }
      }
    }

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
        "What do you call a student who doesn't want to go to school? Absent-minded! 🤣 Want more jokes?",
        "Why don't math teachers ever get sick? Because they have natural immunity to algebra! 😆",
        "What did the professor say when the student asked if they could go to the bathroom? 'I don't know, CAN you?' 😂",
        "Why did the computer go to the doctor? Because it had a virus! 💻😷"
      ],
      
      weather: [
        "I wish I could check the current weather for you! 🌤️ I don't have access to real-time weather data, but here's what I can suggest:\n\n☀️ Check your weather app or ask a voice assistant\n🌧️ If it's rainy, the library is always cozy for studying!\n❄️ Cold day? The student center has great heating and hot drinks\n🌈 Nice weather? Maybe grab some food and eat outside!\n\nIs there anything campus-related I can help you with instead?",
        "I'd love to help with weather info, but that's outside my current abilities! ☀️ However, I can tell you about indoor campus activities if the weather isn't cooperating, or suggest great outdoor spots on campus for nice days! What sounds interesting?"
      ],
      
      sports: [
        "I love that you're into sports! 🏃‍♂️ While I don't have real-time sports scores, I can share some campus sports info:\n\n🏀 **Campus Gym**: Open 6 AM - 10 PM\n⚽ **Sports Complex**: Great for football, basketball, tennis\n🏊‍♀️ **Swimming Pool**: Perfect for fitness\n🏃‍♂️ **Track Field**: Open for running\n\nWant me to check if there are any sports events happening on campus? Or maybe you're looking for intramural team info?",
        "Sports enthusiast! 💪 That's awesome! Our campus has amazing sports facilities:\n\n🎾 Tennis courts, basketball courts, football field\n🏋️‍♀️ Fully equipped fitness center\n🏊‍♀️ Olympic-size swimming pool\n🏃‍♂️ 400m track for running\n\nI can check for upcoming sports events or tournaments if you're interested! What sport are you most passionate about?",
        "Great to meet a sports fan! 🏆 Staying active is so important for student life. Our campus recreation center is fantastic - they offer everything from pickup games to organized tournaments. Want me to look up any upcoming sports events or maybe information about joining intramural teams?"
      ],
      
      motivation: [
        "You've got this! 💪 Remember, every expert was once a beginner, and every pro was once an amateur. Your potential is unlimited!\n\n✨ **Daily Reminder**: You're capable of amazing things\n🎯 Focus on progress, not perfection\n🌟 Small steps lead to big achievements\n💫 Believe in yourself - I believe in you!\n\nWhat goal are you working towards? I'd love to help you stay motivated!",
        "Here's some motivation for you! 🌟 You're stronger than you think, smarter than you know, and more capable than you imagine!\n\n🔥 **Remember**: \n• Every challenge is a chance to grow\n• Your dreams are valid and achievable\n• Progress beats perfection every time\n• You're exactly where you need to be\n\nKeep pushing forward! What's something you're working hard on right now?",
        "Motivation coming your way! 🚀 Success isn't about being perfect - it's about being persistent!\n\n💎 **Today's Inspiration**:\n• Your journey is unique and valuable\n• Every small step counts\n• You have everything within you to succeed\n• Challenges make you stronger\n\nYou're doing better than you think! Want to share what you're working towards?"
      ],
      
      fun_fact: [
        "Here's a fun fact! 🤓 Did you know that honey never spoils? Archaeologists have found perfectly edible honey in ancient Egyptian tombs that's over 3,000 years old!\n\n🍯 Speaking of sweet things, want me to check what desserts are available in the cafeteria today?",
        "Fun fact time! 🧠 Your brain uses about 20% of your body's total energy, even though it's only 2% of your body weight. That's why studying makes you hungry!\n\n🍎 Perfect excuse to grab a healthy snack - want me to check today's menu?",
        "Here's something cool! 🐙 Octopuses have three hearts and blue blood! Two hearts pump blood to the gills, and one pumps to the rest of the body.\n\n💙 Nature is amazing! Want another fun fact or is there something campus-related I can help with?",
        "Did you know? 📚 The average person blinks about 17,000 times per day! But when you're reading or studying, you blink much less - which is why your eyes can get dry during long study sessions.\n\n👀 Remember to take breaks and blink more when studying! Need any study tips?"
      ],
      
      study_tips: [
        "Great study tips coming your way! 📚✨\n\n🎯 **Effective Study Strategies**:\n• **25-min focus + 5-min break** (Pomodoro Technique)\n• Study in the **same place** regularly\n• **Teach someone else** - best way to remember\n• **Practice testing** yourself regularly\n• **Sleep well** - your brain consolidates memory during sleep\n\n💡 **Pro Tip**: Mix up subjects every 2 hours to keep your brain engaged!\n\nWhat subject are you studying? I might have specific tips!",
        "Study success secrets! 🧠💪\n\n📈 **Proven Methods**:\n• **Active reading**: Summarize each paragraph\n• **Spaced repetition**: Review material after 1 day, 3 days, 1 week\n• **Study groups**: Explain concepts to friends\n• **Mind maps**: Visual connections help memory\n• **Regular exercise**: Boosts brain power!\n\n🌟 **Remember**: Quality over quantity. 2 focused hours beat 6 distracted hours!\n\nAny specific study challenges I can help with?",
        "Let me share some study wisdom! 📖🎓\n\n🔥 **Game-Changing Tips**:\n• **Morning study**: Your brain is freshest\n• **No multitasking**: Focus on one thing at a time\n• **Handwrite notes**: Better for memory than typing\n• **Quiz yourself**: Testing beats re-reading\n• **Reward progress**: Celebrate small wins!\n\n💭 **Mindset**: Think 'I get to learn' instead of 'I have to study'\n\nWant me to check library hours for your study sessions?"
      ],
      
      stress_relief: [
        "I hear you, and it's completely normal to feel stressed sometimes. 🤗 Here are some quick stress-busters:\n\n🌸 **Immediate Relief**:\n• **Deep breathing**: 4 counts in, 6 counts out\n• **Progressive muscle relaxation**: Tense and release each muscle group\n• **Take a walk**: Even 5 minutes helps\n• **Listen to music**: Your favorite calming songs\n• **Call a friend**: Connection reduces stress\n\n💚 **Campus Resources**:\n• Counseling center for support\n• Quiet study spaces in the library\n• Green spaces for fresh air\n\nYou're stronger than you think! What's been weighing on your mind?",
        "Sending you calm vibes! 🕯️ Stress is temporary, but you're resilient!\n\n🧘‍♀️ **Quick Stress Fixes**:\n• **Box breathing**: 4-4-4-4 pattern\n• **Gratitude practice**: Name 3 good things today\n• **Gentle stretching**: Release physical tension\n• **Mindful moment**: Focus on your senses right now\n• **Positive affirmations**: 'This too shall pass'\n\n🌱 **Remember**: You've overcome challenges before, and you'll overcome this too!\n\nWant me to find some quiet study spots on campus where you can relax?",
        "Hey, take a deep breath with me! 🌬️ Stress happens to everyone, especially students.\n\n💙 **Gentle Reminders**:\n• **You're doing your best**, and that's enough\n• **Progress isn't always linear** - ups and downs are normal\n• **Self-care isn't selfish** - it's necessary\n• **Ask for help** when you need it\n• **This feeling is temporary**\n\n🌈 **Campus Calm Spots**:\n• Library quiet zones\n• Garden areas\n• Student wellness center\n\nYou've got this! What's one small thing that might help you feel better right now?"
      ],
      
      food_recommendation: [
        "Hungry? Let me help! 🍽️ Here are some tasty suggestions:\n\n🥗 **Healthy Options**:\n• Fresh salads with grilled protein\n• Fruit bowls for natural energy\n• Whole grain sandwiches\n• Smoothies with berries\n\n🍕 **Comfort Food**:\n• Pizza slices for sharing\n• Pasta with your favorite sauce\n• Warm soups on cold days\n• Grilled cheese and tomato soup\n\n🥪 **Quick Bites**:\n• Wraps with veggies\n• Energy bars for study fuel\n• Fresh fruit and nuts\n\nWant me to check today's cafeteria menu for you? I can see what's actually available right now!",
        "Food cravings? I've got ideas! 😋\n\n🌮 **By Mood**:\n• **Stressed**: Comfort food like mac & cheese\n• **Energetic**: Fresh wraps or salads\n• **Sleepy**: Protein-rich options\n• **Happy**: Treat yourself to something special!\n\n☕ **Study Fuel**:\n• Nuts and dried fruits\n• Greek yogurt with berries\n• Green tea for calm focus\n• Dark chocolate for brain power\n\n🍎 **Pro Tip**: Eat the rainbow - colorful foods have more nutrients!\n\nShould I check what's cooking in the cafeteria today?"
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
          response += `• ${item.item_name} - ₹${item.price}\n`;
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
      response += `💰 ₹${bus.fare}\n\n`;
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
