import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChatBot from '../components/chatbot/ChatBot';

const StudentDashboard = () => {
  const [todayData, setTodayData] = useState({
    schedule: [],
    menu: null,
    buses: [],
    events: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodayData();
  }, []);

  const fetchTodayData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const [scheduleRes, menuRes, busRes, eventsRes] = await Promise.all([
        api.get(`/schedules?date=${today}`),
        api.get(`/menus?date=${today}`),
        api.get('/buses'),
        api.get('/events?upcoming=true&limit=3')
      ]);

      setTodayData({
        schedule: scheduleRes.data.data || [],
        menu: menuRes.data.data?.[0] || null,
        buses: busRes.data.data || [],
        events: eventsRes.data.data || []
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to Campus Copilot - Your university companion</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Quick Access Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Link to="/student/schedules" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">Schedules</span>
          </Link>

          <Link to="/student/menus" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-center">
            <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">Menus</span>
          </Link>

          <Link to="/student/buses" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-center">
            <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">Buses</span>
          </Link>

          <Link to="/student/events" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-center">
            <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">Events</span>
          </Link>

          <Link to="/student/updates" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-center">
            <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">Updates</span>
          </Link>

          <Link to="/student/faqs" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-center">
            <div className="w-8 h-8 bg-indigo-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">FAQs</span>
          </Link>
        </div>

        {/* Today's Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Today's Classes</h3>
            </div>
            <div className="px-6 py-4">
              {todayData.schedule.length > 0 ? (
                <div className="space-y-3">
                  {todayData.schedule.slice(0, 5).map((class_, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{class_.subject_name}</p>
                        <p className="text-sm text-gray-600">{class_.room_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{class_.start_time} - {class_.end_time}</p>
                        <p className="text-sm text-gray-600">{class_.instructor_name}</p>
                      </div>
                    </div>
                  ))}
                  {todayData.schedule.length > 5 && (
                    <Link to="/student/schedules" className="block text-center text-blue-600 hover:text-blue-500 text-sm font-medium">
                      View all classes
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No classes scheduled for today</p>
              )}
            </div>
          </div>

          {/* Today's Menu */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Today's Menu</h3>
            </div>
            <div className="px-6 py-4">
              {todayData.menu ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Breakfast</h4>
                    <p className="text-gray-600">{todayData.menu.breakfast_items}</p>
                    <p className="text-sm text-green-600">LKR{todayData.menu.breakfast_price}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Lunch</h4>
                    <p className="text-gray-600">{todayData.menu.lunch_items}</p>
                    <p className="text-sm text-green-600">LKR{todayData.menu.lunch_price}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Dinner</h4>
                    <p className="text-gray-600">{todayData.menu.dinner_items}</p>
                    <p className="text-sm text-green-600">LKR{todayData.menu.dinner_price}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No menu available for today</p>
              )}
            </div>
          </div>

          {/* Next Buses */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Bus Timings</h3>
            </div>
            <div className="px-6 py-4">
              {todayData.buses.length > 0 ? (
                <div className="space-y-3">
                  {todayData.buses.slice(0, 4).map((bus, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">Route {bus.route_number}</p>
                        <p className="text-sm text-gray-600">{bus.route_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{bus.departure_time}</p>
                        <p className="text-sm text-gray-600">{bus.frequency}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No bus information available</p>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
            </div>
            <div className="px-6 py-4">
              {todayData.events.length > 0 ? (
                <div className="space-y-3">
                  {todayData.events.map((event, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-600">{event.location}</p>
                      <p className="text-sm text-gray-500">{new Date(event.event_date).toLocaleDateString()}</p>
                    </div>
                  ))}
                  <Link to="/student/events" className="block text-center text-blue-600 hover:text-blue-500 text-sm font-medium">
                    View all events
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No upcoming events</p>
              )}
            </div>
          </div>
        </div>        {/* AI Chatbot CTA */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-700/20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Need Help? Ask Campus Copilot AI!</h3>
                  <p className="text-blue-100 text-sm">Powered by intelligent agents with real-time campus data</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { icon: "📅", text: "Class Schedules" },
                  { icon: "🍽️", text: "Menu & Dining" },
                  { icon: "🚌", text: "Bus Routes" },
                  { icon: "📢", text: "Events & News" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <span className="text-lg">{feature.icon}</span>
                    <span className="text-blue-100">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="ml-6">
              <button 
                onClick={() => {
                  // Trigger chatbot open (this will be handled by the ChatBot component)
                  const chatToggle = document.querySelector('[data-chatbot-toggle]');
                  if (chatToggle) chatToggle.click();
                }}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                </svg>
                <span>Start Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  );
};

export default StudentDashboard;
