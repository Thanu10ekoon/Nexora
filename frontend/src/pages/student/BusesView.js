import React, { useState, useEffect } from 'react';
import { Bus, Clock, MapPin, User, Navigation, Phone } from 'lucide-react';
import api from '../../services/api';

const BusesView = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState('');

  useEffect(() => {
    fetchBuses();
  }, []);
  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/buses');
      if (response.data.success) {
        setBuses((response.data.data || []).filter(bus => bus.is_active));
      } else {
        console.error('Failed to fetch buses');
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueRoutes = () => {
    const routes = [...new Set(buses.map(bus => bus.route_name))];
    return routes;
  };

  const filteredBuses = buses.filter(bus => {
    return !selectedRoute || bus.route_name === selectedRoute;
  });

  const getNextDeparture = (departureTime) => {
    const now = new Date();
    const [hours, minutes] = departureTime.split(':');
    const departure = new Date();
    departure.setHours(parseInt(hours), parseInt(minutes), 0);
    
    if (departure < now) {
      departure.setDate(departure.getDate() + 1);
    }
    
    const diff = departure - now;
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  };

  const formatTime = (time) => {
    return time.substring(0, 5);
  };

  const getStatusColor = (departureTime) => {
    const now = new Date();
    const [hours, minutes] = departureTime.split(':');
    const departure = new Date();
    departure.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const diff = departure - now;
    const diffMinutes = diff / (1000 * 60);
    
    if (diffMinutes < 0) {
      return 'bg-gray-100 text-gray-600'; // Departed
    } else if (diffMinutes <= 30) {
      return 'bg-red-100 text-red-700'; // Soon
    } else if (diffMinutes <= 60) {
      return 'bg-yellow-100 text-yellow-700'; // Upcoming
    } else {
      return 'bg-green-100 text-green-700'; // Available
    }
  };

  const getStatusText = (departureTime) => {
    const now = new Date();
    const [hours, minutes] = departureTime.split(':');
    const departure = new Date();
    departure.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const diff = departure - now;
    const diffMinutes = diff / (1000 * 60);
    
    if (diffMinutes < 0) {
      return 'Departed';
    } else if (diffMinutes <= 30) {
      return 'Leaving Soon';
    } else if (diffMinutes <= 60) {
      return 'Upcoming';
    } else {
      return 'Available';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
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
                <Bus className="mr-3 text-purple-600" />
                University Bus Service
              </h1>
              <p className="text-gray-600 mt-2">Track bus schedules and plan your campus commute</p>
            </div>
          </div>
        </div>

        {/* Live Status Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <h2 className="text-xl font-bold mb-4">🚌 Live Bus Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl font-bold">{buses.filter(bus => getStatusText(bus.departure_time) === 'Available').length}</div>
              <div className="text-sm opacity-90">Buses Available</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl font-bold">{buses.filter(bus => getStatusText(bus.departure_time) === 'Leaving Soon').length}</div>
              <div className="text-sm opacity-90">Leaving Soon</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl font-bold">{getUniqueRoutes().length}</div>
              <div className="text-sm opacity-90">Active Routes</div>
            </div>
          </div>
        </div>

        {/* Route Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Route</label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Routes</option>
                {getUniqueRoutes().map(route => (
                  <option key={route} value={route}>{route}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setSelectedRoute('')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Clear Filter
              </button>
            </div>
          </div>
        </div>

        {/* Bus Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuses
            .sort((a, b) => a.departure_time.localeCompare(b.departure_time))
            .map(bus => (
            <div key={bus.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Bus className="text-purple-600 mr-3" size={24} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{bus.route_name}</h3>
                      <p className="text-sm text-gray-500">Bus #{bus.bus_number}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bus.departure_time)}`}>
                    {getStatusText(bus.departure_time)}
                  </div>
                </div>

                {/* Route Information */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-start">
                    <Navigation className="text-gray-400 mr-3 mt-1" size={16} />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Route</div>
                      <div className="text-sm text-gray-600">{bus.start_location} → {bus.end_location}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="text-gray-400 mr-3" size={16} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Departure Time</div>
                      <div className="text-sm text-gray-600">{formatTime(bus.departure_time)}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="text-gray-400 mr-3" size={16} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Next in</div>
                      <div className="text-sm text-purple-600 font-medium">{getNextDeparture(bus.departure_time)}</div>
                    </div>
                  </div>
                </div>

                {/* Driver Information */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="text-gray-400 mr-2" size={16} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{bus.driver_name}</div>
                        <div className="text-xs text-gray-500">Driver</div>
                      </div>
                    </div>
                    {bus.driver_contact && (
                      <div className="flex items-center text-purple-600">
                        <Phone className="mr-1" size={16} />
                        <span className="text-sm font-medium">{bus.driver_contact}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  <button className="w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200">
                    Track Bus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBuses.length === 0 && (
          <div className="text-center py-12">
            <Bus className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No buses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters or check back later for updated schedules.
            </p>
          </div>
        )}

        {/* Route Map */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Route Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getUniqueRoutes().map(route => {
              const routeBuses = buses.filter(bus => bus.route_name === route);
              const activeBuses = routeBuses.filter(bus => getStatusText(bus.departure_time) !== 'Departed');
              
              return (
                <div key={route} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{route}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Total Buses: {routeBuses.length}</div>
                    <div>Active: {activeBuses.length}</div>
                    <div>Next Departure: {
                      activeBuses.length > 0 
                        ? formatTime(activeBuses.sort((a, b) => a.departure_time.localeCompare(b.departure_time))[0].departure_time)
                        : 'No active buses'
                    }</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusesView;
