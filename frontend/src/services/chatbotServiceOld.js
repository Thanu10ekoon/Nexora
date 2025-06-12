import api from './api';
import { mockBackend } from './mockBackend';

/**
 * Campus Copilot Intelligent Agent Service
 * Implements ReAct (Reasoning + Acting) pattern with tools for API calls
 */

class CampusCopilotAgent {
  constructor() {
    this.useMockData = process.env.NODE_ENV === 'development' || false; // Set to true for development
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
  }

  // Helper method to make API calls with fallback to mock data
  async makeAPICall(endpoint, params = {}) {
    try {
      // Try real API first
      const response = await api.get(endpoint, { params });
      return {
        success: true,
        data: response.data.data || [],
        source: 'api'
      };
    } catch (error) {
      console.warn(`API call failed for ${endpoint}, using mock data:`, error.message);
      // Fallback to mock data
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
  // Tool: Get class schedules
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

  // Tool: Get cafeteria menus
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

  // Tool: Get bus schedules
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

  // Tool: Get events
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

  // Tool: Get university updates
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

  // Tool: Get FAQs
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

  // Tool: Search FAQs by keywords
  async searchFAQs(query) {
    try {
      const response = await this.getFAQs();
      if (response.success) {
        const faqs = response.data;
        const searchResults = faqs.filter(faq => 
          faq.question.toLowerCase().includes(query.toLowerCase()) ||
          faq.answer.toLowerCase().includes(query.toLowerCase()) ||
          (faq.keywords && JSON.parse(faq.keywords).some(keyword => 
            keyword.toLowerCase().includes(query.toLowerCase())
          ))
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

  // Tool: Get current time
  getCurrentTime() {
    return {
      success: true,
      data: new Date().toLocaleTimeString(),
      message: 'Retrieved current time'
    };
  }

  // Tool: Get current date
  getCurrentDate() {
    return {
      success: true,
      data: new Date().toISOString().split('T')[0],
      message: 'Retrieved current date'
    };
  }  // ReAct Agent: Analyze user intent and plan actions
  analyzeIntent(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Enhanced intent patterns with context
    const intents = {
      schedules: {
        patterns: [
          'schedule', 'class', 'timetable', 'when is', 'what time', 'lecture', 
          'subject', 'today\'s classes', 'tomorrow class', 'next class',
          'cs class', 'math class', 'physics class', 'room number'
        ],
        priority: 1
      },
      menus: {
        patterns: [
          'menu', 'food', 'cafeteria', 'meal', 'breakfast', 'lunch', 'dinner', 
          'eat', 'dining', 'what\'s for', 'today\'s menu', 'price', 'cost'
        ],
        priority: 1
      },
      buses: {
        patterns: [
          'bus', 'transport', 'shuttle', 'route', 'departure', 'arrival', 
          'travel', 'next bus', 'bus timing', 'campus shuttle'
        ],
        priority: 1
      },
      events: {
        patterns: [
          'event', 'activity', 'program', 'happening', 'upcoming', 'seminar', 
          'workshop', 'conference', 'competition', 'fest'
        ],
        priority: 1
      },
      updates: {
        patterns: [
          'update', 'news', 'announcement', 'notice', 'information', 'latest',
          'urgent', 'important', 'deadline'
        ],
        priority: 1
      },
      faqs: {
        patterns: [
          'faq', 'help', 'question', 'how to', 'what is', 'where is', 'why', 
          'when', 'procedure', 'process', 'requirements'
        ],
        priority: 2
      },      greeting: {
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
      },
      time: {
        patterns: ['time', 'current time', 'what time is it', 'clock'],
        priority: 2
      },
      date: {
        patterns: ['date', 'today', 'current date', 'what day', 'calendar'],
        priority: 2
      }
    };    // Calculate scores for each intent
    const scores = {};
    for (const [intent, config] of Object.entries(intents)) {
      let score = 0;
      for (const pattern of config.patterns) {
        // Use more precise matching for short patterns to avoid false positives
        if (pattern.length <= 3) {
          // For short patterns like "hi", "yo", "sup", use word boundary matching
          const regex = new RegExp('\\b' + pattern + '\\b', 'i');
          if (regex.test(message)) {
            score += 1;
          }
        } else {
          // For longer patterns, use simple includes
          if (message.includes(pattern)) {
            score += 1;
          }
        }
      }
      
      // Apply priority weighting
      if (score > 0) {
        scores[intent] = (score / config.patterns.length) * config.priority;
      }
    }    // Find the highest scoring intent
    let topIntent = ['general', 0];
    if (Object.keys(scores).length > 0) {
      topIntent = Object.entries(scores).reduce((a, b) => 
        scores[a[0]] > scores[b[0]] ? a : b
      );
    }

    return {
      intent: topIntent[0],
      confidence: Math.min(topIntent[1], 1.0),
      entities: this.extractEntities(message, topIntent[0]),
      allScores: scores
    };
  }

  // Enhanced entity extraction
  extractEntities(message, intent) {
    const entities = {};
    
    // Time-related entities
    const timePatterns = {
      today: /\b(today|now)\b/i,
      tomorrow: /\btomorrow\b/i,
      monday: /\bmonday\b/i,
      tuesday: /\btuesday\b/i,
      wednesday: /\bwednesday\b/i,
      thursday: /\bthursday\b/i,
      friday: /\bfriday\b/i,
      saturday: /\bsaturday\b/i,
      sunday: /\bsunday\b/i,
      next_week: /\bnext week\b/i,
      this_week: /\bthis week\b/i
    };

    for (const [key, pattern] of Object.entries(timePatterns)) {
      if (pattern.test(message)) {
        entities.timeframe = key;
        break;
      }
    }

    // Subject-specific entities for schedules
    if (intent === 'schedules') {
      const subjectPatterns = {
        'Computer Science': /\b(cs|computer science|programming|software)\b/i,
        'Mathematics': /\b(math|mathematics|calculus|algebra)\b/i,
        'Physics': /\b(physics|mechanics|quantum)\b/i,
        'Chemistry': /\b(chemistry|organic|inorganic)\b/i,
        'English': /\b(english|literature|grammar)\b/i
      };

      for (const [subject, pattern] of Object.entries(subjectPatterns)) {
        if (pattern.test(message)) {
          entities.subject = subject;
          break;
        }
      }

      // Room number extraction
      const roomMatch = message.match(/\broom\s*(\d+[a-z]?)\b/i);
      if (roomMatch) entities.room = roomMatch[1];
    }

    // Meal-specific entities for menus
    if (intent === 'menus') {
      const mealPatterns = {
        breakfast: /\b(breakfast|morning)\b/i,
        lunch: /\b(lunch|afternoon)\b/i,
        dinner: /\b(dinner|evening|supper)\b/i,
        snacks: /\b(snack|snacks|tea)\b/i
      };

      for (const [meal, pattern] of Object.entries(mealPatterns)) {
        if (pattern.test(message)) {
          entities.mealType = meal;
          break;
        }
      }

      // Price-related queries
      if (/\b(price|cost|how much|cheap|expensive)\b/i.test(message)) {
        entities.priceQuery = true;
      }
    }

    // Route-specific entities for buses
    if (intent === 'buses') {
      const routeMatch = message.match(/\broute\s*([a-z0-9]+)\b/i);
      if (routeMatch) entities.route = routeMatch[1];

      // Location extraction
      const locationPatterns = {
        'main gate': /\bmain gate\b/i,
        'library': /\blibrary\b/i,
        'hostel': /\bhostel\b/i,
        'cafeteria': /\bcafeteria\b/i,
        'city center': /\bcity center\b/i
      };

      for (const [location, pattern] of Object.entries(locationPatterns)) {
        if (pattern.test(message)) {
          entities.location = location;
          break;
        }
      }
    }

    // General search query extraction
    entities.query = message;

    return entities;
  }

  // Plan actions based on intent
  planActions(analysis) {
    const { intent, entities } = analysis;
    const actions = [];

    switch (intent) {
      case 'schedules':
        actions.push({
          tool: 'getSchedules',
          params: this.buildScheduleParams(entities)
        });
        if (entities.timeframe === 'today') {
          actions.push({ tool: 'getCurrentDate' });
        }
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
        // If it's a specific question, search FAQs
        const searchQuery = this.extractSearchQuery(entities);
        if (searchQuery) {
          actions.push({
            tool: 'searchFAQs',
            params: searchQuery
          });
        } else {
          actions.push({
            tool: 'getFAQs',
            params: { limit: 5 }
          });
        }
        break;      case 'time':
        actions.push({ tool: 'getCurrentTime' });
        break;

      case 'date':
        actions.push({ tool: 'getCurrentDate' });
        break;

      case 'greeting':
      case 'casual':
        // No API calls needed for greetings and casual conversation
        // These will be handled directly in generateResponse
        break;

      default:
        // For general queries, search FAQs first
        actions.push({
          tool: 'searchFAQs',
          params: entities.query || ''
        });
        break;
    }

    return actions;
  }

  // Build parameters for schedule queries
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

  // Build parameters for menu queries
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

  // Build parameters for bus queries
  buildBusParams(entities) {
    const params = {};
    if (entities.route) {
      params.route = entities.route;
    }
    return params;
  }

  // Extract search query from message
  extractSearchQuery(entities) {
    return entities.query || '';
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
  // Generate natural language response
  generateResponse(userMessage, analysis, actionResults) {
    const { intent } = analysis;
    
    // Check if any actions failed (skip for intents that don't need API calls)
    if (!['greeting', 'casual'].includes(intent)) {
      const failures = actionResults.filter(r => !r.result.success);
      if (failures.length > 0) {
        return "I'm sorry, I'm having trouble accessing some information right now. Please try again in a moment.";
      }
    }// Generate response based on intent and results
    switch (intent) {
      case 'greeting':
        return this.generateGreetingResponse(userMessage);

      case 'casual':
        return this.generateCasualResponse(userMessage);

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

      case 'time':
        const timeResult = actionResults.find(r => r.action === 'getCurrentTime');
        return `⏰ The current time is **${timeResult?.result.data}**`;

      case 'date':
        const dateResult = actionResults.find(r => r.action === 'getCurrentDate');
        return `📅 Today's date is **${new Date(dateResult?.result.data).toLocaleDateString()}**`;      default:
        // Try to provide helpful FAQs or general assistance
        const faqResults = actionResults.find(r => r.action === 'searchFAQs');
        if (faqResults && faqResults.result.success && faqResults.result.data.length > 0) {
          return this.formatFAQResponse(actionResults);
        }
        return "I'd be happy to help! You can ask me about:\n\n📅 Class schedules\n🍽️ Today's menu\n🚌 Bus timings\n📢 Upcoming events\n❓ General questions\n\nWhat would you like to know?";
    }
  }

  // Generate personalized greeting responses
  generateGreetingResponse(userMessage) {
    const message = userMessage.toLowerCase();
    const greetings = [
      "Hello! 👋 I'm Campus Copilot, your AI assistant for Novacore University.",
      "Hi there! 😊 Welcome to Campus Copilot!",
      "Hey! 🎓 Great to see you here!",
      "Good to meet you! I'm your campus assistant."
    ];

    const timeGreetings = {
      morning: "Good morning! ☀️ Ready to start your day?",
      afternoon: "Good afternoon! 🌤️ Hope your day is going well!",
      evening: "Good evening! 🌅 How can I help you today?"
    };

    let response = "";
    
    // Time-based greetings
    if (message.includes('good morning')) {
      response = timeGreetings.morning;
    } else if (message.includes('good afternoon')) {
      response = timeGreetings.afternoon;
    } else if (message.includes('good evening')) {
      response = timeGreetings.evening;
    } else if (message.includes('thanks') || message.includes('thank you')) {
      return "You're very welcome! 😊 Is there anything else I can help you with?";
    } else {
      response = greetings[Math.floor(Math.random() * greetings.length)];
    }

    response += "\n\nI can help you with:\n\n📅 **Class Schedules** - \"What's my schedule today?\"\n🍽️ **Cafeteria Menus** - \"What's for lunch?\"\n🚌 **Bus Schedules** - \"When is the next bus?\"\n📢 **Events & Updates** - \"Any upcoming events?\"\n❓ **FAQs** - \"Help with procedures\"\n\nWhat would you like to know?";
    
    return response;
  }

  // Generate casual conversation responses
  generateCasualResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('how are you')) {
      return "I'm doing great, thank you for asking! 😊 I'm here and ready to help you with anything campus-related. How are you doing today?";
    } else if (message.includes('what\'s up') || message.includes('whatsup')) {
      return "Not much, just here helping students like you! 🤖 What's up with you? Need help with anything on campus?";
    } else if (message.includes('who are you')) {
      return "I'm Campus Copilot! 🎓 I'm an AI assistant created specifically for Novacore University students. I'm here to help you navigate campus life - from class schedules to cafeteria menus and everything in between!";
    } else if (message.includes('what can you do') || message.includes('capabilities')) {
      return "I'm pretty capable! 💪 Here's what I can do:\n\n🔍 **Find Information** - Schedules, menus, bus times\n📊 **Answer Questions** - FAQs, procedures, campus info\n⚡ **Quick Updates** - Events, announcements, news\n🗨️ **Chat Naturally** - Just like we're doing now!\n\nI'm always learning and improving. What would you like to try?";
    } else if (message.includes('help') || message.includes('can you help')) {
      return "Absolutely! I'd love to help you! 🤝 I'm here for anything campus-related. Whether you need to check your schedule, find out what's for dinner, or get answers to university questions - just ask away!";
    } else if (message.includes('introduce yourself')) {
      return "Nice to meet you! 🤝 I'm Campus Copilot, your friendly AI assistant for Novacore University.\n\nI was created to make campus life easier for students like you. Think of me as your digital campus buddy who knows everything about:\n\n• Class schedules and room locations\n• Cafeteria menus and meal times\n• Bus routes and timings\n• Campus events and activities\n• University updates and announcements\n• FAQs and procedures\n\nI'm available 24/7 and always happy to help! What can I assist you with today?";
    } else {
      return "That's interesting! 😊 I enjoy our conversation. Is there anything specific about campus life I can help you with today?";
    }
  }

  // Format schedule response
  formatScheduleResponse(results) {
    const scheduleResult = results.find(r => r.action === 'getSchedules');
    if (!scheduleResult || !scheduleResult.result.success) {
      return "I couldn't retrieve the class schedules right now. Please try again later.";
    }

    const schedules = scheduleResult.result.data;
    if (schedules.length === 0) {
      return "📅 No classes are scheduled for the requested time.";
    }

    let response = "📅 **Class Schedules:**\n\n";
    schedules.slice(0, 5).forEach(schedule => {
      response += `🎓 **${schedule.subject}**\n`;
      response += `⏰ ${schedule.start_time} - ${schedule.end_time}\n`;
      response += `📍 Room ${schedule.room_number}, ${schedule.building}\n`;
      response += `👨‍🏫 ${schedule.instructor}\n`;
      response += `📅 ${schedule.day_of_week}\n\n`;
    });

    if (schedules.length > 5) {
      response += `_...and ${schedules.length - 5} more classes. Visit the Schedules page for complete details._`;
    }

    return response;
  }

  // Format menu response
  formatMenuResponse(results) {
    const menuResult = results.find(r => r.action === 'getMenus');
    if (!menuResult || !menuResult.result.success) {
      return "I couldn't retrieve the cafeteria menu right now. Please try again later.";
    }

    const menus = menuResult.result.data;
    if (menus.length === 0) {
      return "🍽️ No menu items found for the requested time.";
    }

    let response = "🍽️ **Cafeteria Menu:**\n\n";
    
    // Group by meal type
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
    mealTypes.forEach(mealType => {
      const mealItems = menus.filter(menu => menu.meal_type === mealType);
      if (mealItems.length > 0) {
        response += `**${mealType.charAt(0).toUpperCase() + mealType.slice(1)}:**\n`;
        mealItems.slice(0, 3).forEach(item => {
          response += `• ${item.item_name} - LKR${item.price}\n`;
          if (item.description) {
            response += `  _${item.description}_\n`;
          }
        });
        response += '\n';
      }
    });

    return response;
  }

  // Format bus response
  formatBusResponse(results) {
    const busResult = results.find(r => r.action === 'getBuses');
    if (!busResult || !busResult.result.success) {
      return "I couldn't retrieve the bus schedules right now. Please try again later.";
    }

    const buses = busResult.result.data.filter(bus => bus.is_active);
    if (buses.length === 0) {
      return "🚌 No active bus routes found.";
    }

    let response = "🚌 **Bus Schedules:**\n\n";
    buses.slice(0, 5).forEach(bus => {
      response += `🚌 **${bus.route_name}** (Bus #${bus.bus_number})\n`;
      response += `📍 ${bus.departure_location} → ${bus.arrival_location}\n`;
      response += `⏰ ${bus.departure_time} - ${bus.arrival_time}\n`;
      response += `💰 Fare: LKR${bus.fare}\n\n`;
    });

    if (buses.length > 5) {
      response += `_...and ${buses.length - 5} more routes. Visit the Buses page for complete details._`;
    }

    return response;
  }

  // Format event response
  formatEventResponse(results) {
    const eventResult = results.find(r => r.action === 'getEvents');
    if (!eventResult || !eventResult.result.success) {
      return "I couldn't retrieve the events right now. Please try again later.";
    }

    const events = eventResult.result.data;
    if (events.length === 0) {
      return "📢 No upcoming events found.";
    }

    let response = "📢 **Upcoming Events:**\n\n";
    events.forEach(event => {
      response += `🎉 **${event.title}**\n`;
      response += `📅 ${new Date(event.event_date).toLocaleDateString()}\n`;
      response += `📍 ${event.location}\n`;
      if (event.description) {
        response += `📝 ${event.description.substring(0, 100)}...\n`;
      }
      response += '\n';
    });

    return response;
  }

  // Format update response
  formatUpdateResponse(results) {
    const updateResult = results.find(r => r.action === 'getUpdates');
    if (!updateResult || !updateResult.result.success) {
      return "I couldn't retrieve the updates right now. Please try again later.";
    }

    const updates = updateResult.result.data;
    if (updates.length === 0) {
      return "📢 No recent updates found.";
    }

    let response = "📢 **Latest Updates:**\n\n";
    updates.forEach(update => {
      response += `📌 **${update.title}**\n`;
      if (update.summary) {
        response += `${update.summary}\n`;
      }
      response += `🏷️ ${update.category} | Priority: ${update.priority}\n\n`;
    });

    return response;
  }

  // Format FAQ response
  formatFAQResponse(results) {
    const faqResult = results.find(r => r.action === 'searchFAQs' || r.action === 'getFAQs');
    if (!faqResult || !faqResult.result.success) {
      return "I couldn't retrieve the FAQs right now. Please try again later.";
    }

    const faqs = faqResult.result.data;
    if (faqs.length === 0) {
      return "❓ I couldn't find any relevant information. Try asking about schedules, menus, buses, or events.";
    }

    let response = "❓ **Here's what I found:**\n\n";
    faqs.slice(0, 3).forEach(faq => {
      response += `**Q: ${faq.question}**\n`;
      response += `A: ${faq.answer}\n\n`;
    });

    if (faqs.length > 3) {
      response += `_Found ${faqs.length - 3} more related answers. Visit the FAQs page for more details._`;
    }

    return response;
  }

  // Main chat processing method
  async processMessage(userMessage) {
    try {
      // Step 1: Analyze user intent (ReAct - Reasoning)
      const analysis = this.analyzeIntent(userMessage);
      
      // Step 2: Plan actions based on intent (ReAct - Planning)
      const actions = this.planActions(analysis);
      
      // Step 3: Execute actions (ReAct - Acting)
      const actionResults = await this.executeActions(actions);
      
      // Step 4: Generate natural language response
      const response = this.generateResponse(userMessage, analysis, actionResults);
      
      // Step 5: Update conversation history
      this.conversationHistory.push({
        user: userMessage,
        intent: analysis.intent,
        response: response,
        timestamp: new Date()
      });

      return {
        success: true,
        response,
        intent: analysis.intent,
        confidence: analysis.confidence
      };
    } catch (error) {
      console.error('Chat processing error:', error);
      return {
        success: false,
        response: "I'm sorry, I encountered an error while processing your request. Please try again.",
        error: error.message
      };
    }
  }
}

// Export a singleton instance
export const campusCopilotAgent = new CampusCopilotAgent();
export default campusCopilotAgent;
