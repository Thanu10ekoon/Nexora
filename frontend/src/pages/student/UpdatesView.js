import React, { useState, useEffect } from 'react';
import { Megaphone, Clock, AlertTriangle, Info, CheckCircle, Calendar } from 'lucide-react';
import api from '../../services/api';

const UpdatesView = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState('');

  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  useEffect(() => {
    fetchUpdates();
  }, []);
  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/updates');
      if (response.data.success) {
        setUpdates((response.data.data || []).filter(update => update.is_published));
      } else {
        console.error('Failed to fetch updates');
      }
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUpdates = updates.filter(update => {
    return !selectedPriority || update.priority === selectedPriority;
  });

  const criticalUpdates = updates.filter(update => update.priority === 'Critical');
  const recentUpdates = updates.slice(0, 5);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'Critical':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'High':
        return <AlertTriangle className="text-orange-500" size={20} />;
      case 'Medium':
        return <Info className="text-blue-500" size={20} />;
      case 'Low':
        return <CheckCircle className="text-green-500" size={20} />;
      default:
        return <Info className="text-gray-500" size={20} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isNewUpdate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
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
                <Megaphone className="mr-3 text-red-600" />
                University Updates
              </h1>
              <p className="text-gray-600 mt-2">Stay informed with the latest announcements and news</p>
            </div>
          </div>
        </div>

        {/* Critical Updates Alert */}
        {criticalUpdates.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-600 mr-2" size={24} />
              <h2 className="text-xl font-bold text-red-900">🚨 Critical Updates</h2>
            </div>
            <div className="space-y-3">
              {criticalUpdates.slice(0, 3).map(update => (
                <div key={update.id} className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900">{update.title}</h3>
                      <p className="text-red-700 text-sm mt-1">{update.content}</p>
                    </div>
                    <div className="text-red-600 text-xs ml-4">
                      {getTimeAgo(update.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Megaphone className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{updates.length}</div>
                <div className="text-gray-600 text-sm">Total Updates</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{criticalUpdates.length}</div>
                <div className="text-gray-600 text-sm">Critical</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Clock className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {updates.filter(update => isNewUpdate(update.created_at)).length}
                </div>
                <div className="text-gray-600 text-sm">New (24h)</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {updates.filter(update => {
                    const updateDate = new Date(update.created_at);
                    const today = new Date();
                    return updateDate.toDateString() === today.toDateString();
                  }).length}
                </div>
                <div className="text-gray-600 text-sm">Today</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Priorities</option>
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setSelectedPriority('')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Clear Filter
              </button>
            </div>
          </div>
        </div>

        {/* Updates List */}
        <div className="space-y-6">
          {filteredUpdates
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map(update => (
              <div key={update.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getPriorityIcon(update.priority)}
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(update.priority)}`}>
                        {update.priority} Priority
                      </div>
                      {isNewUpdate(update.created_at) && (
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          NEW
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{formatDate(update.created_at)}</div>
                      <div className="text-xs">{formatTime(update.created_at)}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{update.title}</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">{update.content}</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Published {getTimeAgo(update.created_at)}
                      </div>
                      <div className="flex items-center space-x-4">
                        <button className="text-blue-600 hover:text-blue-800 font-medium">
                          Share
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 font-medium">
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {filteredUpdates.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No updates found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters or check back later for new announcements.
            </p>
          </div>
        )}

        {/* Recent Updates Timeline */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Updates Timeline</h2>
          <div className="space-y-4">
            {recentUpdates.map((update, index) => (
              <div key={update.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{update.title}</h4>
                    <div className="flex items-center space-x-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(update.priority)}`}>
                        {update.priority}
                      </div>
                      <span className="text-xs text-gray-500">{getTimeAgo(update.created_at)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{update.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatesView;
