import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Star, Users, Tag } from 'lucide-react';
import api from '../../services/api';

const EventsView = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = ['Academic', 'Cultural', 'Sports', 'Technical', 'Social', 'Workshop', 'Seminar', 'Other'];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      if (response.data.success) {
        setEvents(response.data.data || []);
      } else {
        console.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    return (
      (!selectedCategory || event.event_type === selectedCategory)
    );
  });

  const upcomingEvents = filteredEvents.filter(event => new Date(event.event_date) >= new Date());
  const pastEvents = filteredEvents.filter(event => new Date(event.event_date) < new Date());

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const isEventToday = (dateString) => {
    const eventDate = new Date(dateString).toDateString();
    const today = new Date().toDateString();
    return eventDate === today;
  };

  const isEventUpcoming = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Academic': 'bg-blue-100 text-blue-800',
      'Cultural': 'bg-purple-100 text-purple-800',
      'Sports': 'bg-green-100 text-green-800',
      'Technical': 'bg-gray-100 text-gray-800',
      'Social': 'bg-pink-100 text-pink-800',
      'Workshop': 'bg-yellow-100 text-yellow-800',
      'Seminar': 'bg-indigo-100 text-indigo-800',
      'Other': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Calendar className="mr-3 text-indigo-600" />
                University Events
              </h1>
              <p className="text-gray-600 mt-2">Stay updated with campus events and activities</p>
            </div>
          </div>
        </div>        {/* Upcoming Events Banner */}
        {upcomingEvents.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Star className="mr-2" />
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.slice(0, 3).map(event => (
                <div key={event.id} className="bg-white bg-opacity-20 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">{event.title}</h3>                  <div className="space-y-1 text-sm opacity-90">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(event.event_date)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {event.start_time && event.end_time ? 
                        `${formatTime(event.start_time)} - ${formatTime(event.end_time)}` : 
                        (event.start_time ? formatTime(event.start_time) : 'All day')
                      }
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCategory('');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Today's Events */}
        {upcomingEvents.filter(event => isEventToday(event.event_date)).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Today's Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents
                .filter(event => isEventToday(event.event_date))                .map(event => (
                  <div key={event.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.event_type)}`}>
                        <Tag className="w-3 h-3 mr-1" />
                        {event.event_type}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>

                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {event.start_time && event.end_time ? 
                          `${formatTime(event.start_time)} - ${formatTime(event.end_time)}` : 
                          (event.start_time ? formatTime(event.start_time) : 'Time TBD')
                        }
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                      {event.max_participants && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Max {event.max_participants} participants
                        </div>                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📅 Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents
              .filter(event => !isEventToday(event.event_date))
              .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
              .map(event => (
                <div key={event.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.event_type)}`}>
                        <Tag className="w-3 h-3 mr-1" />
                        {event.event_type}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>

                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(event.event_date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {event.start_time && event.end_time ? 
                          `${formatTime(event.start_time)} - ${formatTime(event.end_time)}` : 
                          (event.start_time ? formatTime(event.start_time) : 'Time TBD')
                        }
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                      {event.max_participants && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Max {event.max_participants} participants
                        </div>
                      )}
                    </div>

                    {isEventUpcoming(event.event_date) && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                        <div className="text-green-800 text-sm font-medium">
                          🔔 This week!
                        </div>
                      </div>
                    )}

                    <button className="w-full px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200">
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {upcomingEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming events found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters or check back later for new events.
            </p>
          </div>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📝 Past Events</h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-200">
                {pastEvents
                  .sort((a, b) => new Date(b.event_date) - new Date(a.event_date))
                  .slice(0, 5)
                  .map(event => (
                    <div key={event.id} className="p-6 hover:bg-gray-50">                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.event_type)}`}>
                              {event.event_type}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(event.event_date)}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {event.location}
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-400">
                          <span className="text-xs">Completed</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsView;
