import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Calendar, 
  Utensils, 
  Bus, 
  Calendar as CalendarIcon, 
  Megaphone, 
  HelpCircle, 
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = user?.userType === 'admin';
  const baseRoute = isAdmin ? '/admin' : '/student';

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      color: 'text-blue-600'
    },
    {
      name: 'Schedules',
      icon: Calendar,
      path: `${baseRoute}/schedules`,
      color: 'text-green-600'
    },
    {
      name: 'Menus',
      icon: Utensils,
      path: `${baseRoute}/menus`,
      color: 'text-orange-600'
    },
    {
      name: 'Buses',
      icon: Bus,
      path: `${baseRoute}/buses`,
      color: 'text-purple-600'
    },
    {
      name: 'Events',
      icon: CalendarIcon,
      path: `${baseRoute}/events`,
      color: 'text-indigo-600'
    },
    {
      name: 'Updates',
      icon: Megaphone,
      path: `${baseRoute}/updates`,
      color: 'text-red-600'
    },
    {
      name: 'FAQs',
      icon: HelpCircle,
      path: `${baseRoute}/faqs`,
      color: 'text-teal-600'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center min-w-0 flex-shrink-0">
            <div className="flex items-center">
              <img 
                src="/NexoraLogo.png" 
                alt="Nexora" 
                className="h-8 w-8 object-contain mr-2"
              />
              <div className="text-xl font-bold text-gray-900 hidden sm:block">
                Campus <span className="text-blue-600">Copilot</span>
              </div>              <div className="text-lg font-bold text-gray-900 sm:hidden">
                <img src="/NexoraLogo.png" alt="Nexora" className="h-6 w-6 object-contain" />
              </div>
            </div>
          </div>          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2 flex-1 justify-center overflow-hidden max-w-3xl mx-4">
            <div className="flex items-center space-x-1 lg:space-x-2 max-w-full">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isCurrentPath(item.path);
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center px-1 lg:px-2 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors duration-200 flex-shrink-0 ${
                      isActive
                        ? `${item.color} bg-gray-100`
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  ><Icon className={`h-4 w-4 lg:h-5 lg:w-5 ${isActive ? item.color : ''}`} />
                    <span className="hidden xl:inline ml-1 lg:ml-2">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3 min-w-0 flex-shrink-0">
            <div className="flex items-center space-x-1 lg:space-x-2 min-w-0">
              <User className="h-4 w-4 text-gray-600 flex-shrink-0" />
              <span className="text-xs lg:text-sm font-medium text-gray-700 truncate max-w-16 lg:max-w-20">
                {user?.username || 'User'}
              </span>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 whitespace-nowrap ${
              isAdmin 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {isAdmin ? 'Admin' : 'Student'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center px-2 py-2 rounded-md text-xs lg:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200 flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden xl:inline ml-1">Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isCurrentPath(item.path);
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? `${item.color} bg-white`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? item.color : ''}`} />
                  {item.name}
                </button>
              );
            })}
            
            {/* Mobile User Info */}
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="flex items-center px-3 py-2">
                <User className="h-5 w-5 text-gray-600 mr-3" />
                <div className="flex-1">
                  <div className="text-base font-medium text-gray-800">
                    {user?.username || 'User'}
                  </div>
                  <div className={`text-sm ${
                    isAdmin ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {isAdmin ? 'Administrator' : 'Student'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors duration-200"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
