// Campus Copilot AI Agent
const CampusTools = require('./tools');

class CampusAgent {
  constructor() {
    this.tools = new CampusTools();
    this.systemPrompt = `You are Campus Copilot, a helpful AI assistant for Nexora University students. 
You can help students with:
- Class schedules and timetables
- Cafeteria menus and food information
- Bus schedules and transportation
- Campus events and activities
- University updates and announcements
- Frequently asked questions

When students ask about any of these topics, use the appropriate tools to get real-time information.
Be friendly, helpful, and conversational. If you need to use tools, explain what you're doing.
Always format responses in a clear, easy-to-read manner using emojis and markdown.

Current date: ${new Date().toLocaleDateString()}`;
  }

  async processMessage(message, context = {}) {
    const userMessage = message.toLowerCase().trim();
    
    try {
      // Determine intent and call appropriate tool
      if (this.isScheduleQuery(userMessage)) {
        const params = this.extractScheduleParams(userMessage);
        const result = await this.tools.getSchedule(params);
        return {
          response: result,
          type: 'tool_response',
          tool_used: 'schedule'
        };
      }
      
      if (this.isMenuQuery(userMessage)) {
        const params = this.extractMenuParams(userMessage);
        const result = await this.tools.getMenu(params);
        return {
          response: result,
          type: 'tool_response',
          tool_used: 'menu'
        };
      }
      
      if (this.isBusQuery(userMessage)) {
        const params = this.extractBusParams(userMessage);
        const result = await this.tools.getBusSchedule(params);
        return {
          response: result,
          type: 'tool_response',
          tool_used: 'bus'
        };
      }
      
      if (this.isEventQuery(userMessage)) {
        const params = this.extractEventParams(userMessage);
        const result = await this.tools.getEvents(params);
        return {
          response: result,
          type: 'tool_response',
          tool_used: 'events'
        };
      }
      
      if (this.isUpdateQuery(userMessage)) {
        const params = this.extractUpdateParams(userMessage);
        const result = await this.tools.getUpdates(params);
        return {
          response: result,
          type: 'tool_response',
          tool_used: 'updates'
        };
      }
      
      if (this.isFAQQuery(userMessage)) {
        const params = this.extractFAQParams(userMessage);
        const result = await this.tools.getFAQs(params);
        return {
          response: result,
          type: 'tool_response',
          tool_used: 'faq'
        };
      }
      
      // General conversation
      return {
        response: this.generateGeneralResponse(userMessage),
        type: 'general_response'
      };
      
    } catch (error) {
      console.error('Agent processing error:', error);
      return {
        response: "I'm sorry, I encountered an error while processing your request. Please try again.",
        type: 'error'
      };
    }
  }

  // Intent detection methods
  isScheduleQuery(message) {
    const scheduleKeywords = ['schedule', 'class', 'timetable', 'lecture', 'subject', 'when', 'time'];
    return scheduleKeywords.some(keyword => message.includes(keyword));
  }

  isMenuQuery(message) {
    const menuKeywords = ['menu', 'food', 'cafeteria', 'eat', 'meal', 'breakfast', 'lunch', 'dinner', 'snack'];
    return menuKeywords.some(keyword => message.includes(keyword));
  }

  isBusQuery(message) {
    const busKeywords = ['bus', 'transport', 'route', 'travel', 'go to', 'get to'];
    return busKeywords.some(keyword => message.includes(keyword));
  }

  isEventQuery(message) {
    const eventKeywords = ['event', 'activity', 'happening', 'festival', 'competition', 'workshop'];
    return eventKeywords.some(keyword => message.includes(keyword));
  }

  isUpdateQuery(message) {
    const updateKeywords = ['update', 'news', 'announcement', 'notice', 'important'];
    return updateKeywords.some(keyword => message.includes(keyword));
  }

  isFAQQuery(message) {
    const faqKeywords = ['faq', 'question', 'help', 'how to', 'what is', 'explain'];
    return faqKeywords.some(keyword => message.includes(keyword));
  }

  // Parameter extraction methods
  extractScheduleParams(message) {
    const params = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const foundDay = days.find(day => message.includes(day));
    if (foundDay) params.day = foundDay;
    return params;
  }

  extractMenuParams(message) {
    const params = {};
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const foundMeal = mealTypes.find(meal => message.includes(meal));
    if (foundMeal) params.meal_type = foundMeal;
    
    // Check for date references
    if (message.includes('today')) {
      params.date = new Date().toISOString().split('T')[0];
    } else if (message.includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      params.date = tomorrow.toISOString().split('T')[0];
    }
    
    return params;
  }

  extractBusParams(message) {
    const params = {};
    // Could extract route names or destinations
    return params;
  }

  extractEventParams(message) {
    const params = {};
    if (message.includes('today')) {
      params.date = new Date().toISOString().split('T')[0];
    } else if (message.includes('this week')) {
      // Could add date range logic
    }
    return params;
  }

  extractUpdateParams(message) {
    return {};
  }

  extractFAQParams(message) {
    return {};
  }

  generateGeneralResponse(message) {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    const isGreeting = greetings.some(greeting => message.includes(greeting));
    
    if (isGreeting) {
      return `Hello! 👋 I'm Campus Copilot, your university assistant. I can help you with:

📅 **Class Schedules** - Ask about your timetable
🍽️ **Cafeteria Menus** - Check what's for breakfast, lunch, or dinner
🚌 **Bus Schedules** - Find transportation around campus
🎉 **Events** - Discover campus activities and events
📢 **Updates** - Get the latest university announcements
❓ **FAQs** - Find answers to common questions

What would you like to know about?`;
    }
    
    if (message.includes('help')) {
      return `I'm here to help! 🤖 You can ask me about:

• "What's my schedule for today?"
• "What's for lunch today?"
• "When is the next bus to downtown?"
• "What events are happening this week?"
• "Any important updates?"
• "How do I register for courses?"

Just ask naturally, and I'll do my best to help!`;
    }
    
    return `I understand you're asking about "${message}". I can help you with campus information! Try asking about schedules, menus, buses, events, updates, or FAQs. For example:

• "Show me today's menu"
• "What's my schedule?"
• "Any events this week?"

What specific information would you like? 🤔`;
  }
}

module.exports = CampusAgent;
