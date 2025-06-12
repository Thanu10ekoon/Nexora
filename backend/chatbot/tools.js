// Campus Copilot AI Tools
const axios = require('axios');

class CampusTools {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
  }

  // Schedule Tool
  async getSchedule(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/schedules`, { params });
      const schedules = response.data.data || [];
      
      if (schedules.length === 0) {
        return "No classes scheduled for the requested time.";
      }

      let formatted = "📅 **Your Class Schedule**\n\n";
      schedules.forEach(schedule => {
        formatted += `• **${schedule.subject_name || 'Subject'}**\n`;
        formatted += `  ⏰ ${schedule.start_time} - ${schedule.end_time}\n`;
        formatted += `  📍 Room: ${schedule.room_number || 'TBA'}\n`;
        formatted += `  👨‍🏫 Instructor: ${schedule.instructor_name || 'TBA'}\n`;
        if (schedule.day_of_week) {
          formatted += `  📆 ${schedule.day_of_week}\n`;
        }
        formatted += "\n";
      });

      return formatted;
    } catch (error) {
      return "Sorry, I couldn't retrieve the schedule information right now. Please try again later.";
    }
  }

  // Menu Tool
  async getMenu(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/menus`, { params });
      const menus = response.data.data || [];
      
      if (menus.length === 0) {
        return "No menu items found for the requested criteria.";
      }

      // Group by date and meal type
      const grouped = {};
      menus.forEach(item => {
        const key = `${item.menu_date} - ${item.meal_type}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
      });

      let formatted = "🍽️ **Cafeteria Menu**\n\n";
      Object.entries(grouped).forEach(([key, items]) => {
        formatted += `**${key.replace('-', '•')}**\n`;
        items.forEach(item => {
          const vegIcon = item.is_vegetarian ? "🌱" : "🍖";
          formatted += `${vegIcon} ${item.item_name} - LKR${item.price}\n`;
          if (item.description) {
            formatted += `   *${item.description}*\n`;
          }
        });
        formatted += "\n";
      });

      return formatted;
    } catch (error) {
      return "Sorry, I couldn't retrieve the menu information right now. Please try again later.";
    }
  }

  // Bus Tool
  async getBusSchedule(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/buses`, { params });
      const buses = response.data.data || [];
      
      if (buses.length === 0) {
        return "No bus information found for the requested criteria.";
      }

      let formatted = "🚌 **Bus Schedule**\n\n";
      buses.forEach(bus => {
        formatted += `• **Route: ${bus.route_name}**\n`;
        formatted += `  🚌 Bus #${bus.bus_number}\n`;
        formatted += `  📍 From: ${bus.departure_location}\n`;
        formatted += `  ⏰ Time: ${bus.departure_time}\n`;
        formatted += `  📅 Days: ${bus.days_of_operation}\n`;
        formatted += `  💺 Capacity: ${bus.capacity} passengers\n\n`;
      });

      return formatted;
    } catch (error) {
      return "Sorry, I couldn't retrieve the bus schedule information right now. Please try again later.";
    }
  }

  // Events Tool
  async getEvents(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/events`, { params });
      const events = response.data.data || [];
      
      if (events.length === 0) {
        return "No events found for the requested criteria.";
      }

      let formatted = "🎉 **Campus Events**\n\n";
      events.forEach(event => {
        formatted += `• **${event.title}**\n`;
        formatted += `  📅 Date: ${event.event_date}\n`;
        if (event.start_time) {
          formatted += `  ⏰ Time: ${event.start_time}`;
          if (event.end_time) formatted += ` - ${event.end_time}`;
          formatted += "\n";
        }
        formatted += `  📍 Location: ${event.location}\n`;
        formatted += `  🏷️ Type: ${event.event_type}\n`;
        if (event.description) {
          formatted += `  📝 ${event.description}\n`;
        }
        formatted += "\n";
      });

      return formatted;
    } catch (error) {
      return "Sorry, I couldn't retrieve the events information right now. Please try again later.";
    }
  }

  // Updates Tool
  async getUpdates(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/updates`, { params });
      const updates = response.data.data || [];
      
      if (updates.length === 0) {
        return "No updates found.";
      }

      let formatted = "📢 **Campus Updates**\n\n";
      updates.forEach(update => {
        formatted += `• **${update.title}**\n`;
        formatted += `  📅 ${update.posted_date}\n`;
        formatted += `  🏷️ ${update.category}\n`;
        if (update.content) {
          formatted += `  📝 ${update.content}\n`;
        }
        formatted += "\n";
      });

      return formatted;
    } catch (error) {
      return "Sorry, I couldn't retrieve the updates information right now. Please try again later.";
    }
  }

  // FAQ Tool
  async getFAQs(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/faqs`, { params });
      const faqs = response.data.data || [];
      
      if (faqs.length === 0) {
        return "No FAQs found for the requested criteria.";
      }

      let formatted = "❓ **Frequently Asked Questions**\n\n";
      faqs.forEach(faq => {
        formatted += `**Q: ${faq.question}**\n`;
        formatted += `A: ${faq.answer}\n`;
        if (faq.category) {
          formatted += `Category: ${faq.category}\n`;
        }
        formatted += "\n";
      });

      return formatted;
    } catch (error) {
      return "Sorry, I couldn't retrieve the FAQ information right now. Please try again later.";
    }
  }
}

module.exports = CampusTools;
