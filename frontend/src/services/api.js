import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
    
    const token = localStorage.getItem('campus_copilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('campus_copilot_token');
      localStorage.removeItem('campus_copilot_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (regNo, password) => api.post('/auth/login', { regNo, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  verifyToken: () => api.get('/auth/verify'),
};

// Dashboard API calls
export const dashboardAPI = {
  getAdminStats: () => api.get('/dashboard/admin/stats'),
  getStudentOverview: () => api.get('/dashboard/student/overview'),
  getQuickAccess: () => api.get('/dashboard/quick-access'),
};

// Schedules API calls
export const scheduleAPI = {
  getAll: (params = {}) => api.get('/schedules', { params }),
  getById: (id) => api.get(`/schedules/${id}`),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
};

// Menus API calls
export const menuAPI = {
  getAll: (params = {}) => api.get('/menus', { params }),
  getById: (id) => api.get(`/menus/${id}`),
  create: (data) => api.post('/menus', data),
  update: (id, data) => api.put(`/menus/${id}`, data),
  delete: (id) => api.delete(`/menus/${id}`),
  getMealTypes: () => api.get('/menus/types/all'),
};

// Bus schedules API calls
export const busAPI = {
  getAll: (params = {}) => api.get('/buses', { params }),
  getById: (id) => api.get(`/buses/${id}`),
  create: (data) => api.post('/buses', data),
  update: (id, data) => api.put(`/buses/${id}`, data),
  delete: (id) => api.delete(`/buses/${id}`),
};

// Events API calls
export const eventAPI = {
  getAll: (params = {}) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

// Updates API calls
export const updateAPI = {
  getAll: (params = {}) => api.get('/updates', { params }),
  getById: (id) => api.get(`/updates/${id}`),
  create: (data) => api.post('/updates', data),
  update: (id, data) => api.put(`/updates/${id}`, data),
  delete: (id) => api.delete(`/updates/${id}`),
};

// FAQs API calls
export const faqAPI = {
  getAll: (params = {}) => api.get('/faqs', { params }),
  getById: (id) => api.get(`/faqs/${id}`),
  create: (data) => api.post('/faqs', data),
  update: (id, data) => api.put(`/faqs/${id}`, data),
  delete: (id) => api.delete(`/faqs/${id}`),
  getCategories: () => api.get('/faqs/categories/all'),
};

// Chatbot API calls
export const chatbotAPI = {
  processMessage: (message, sessionId) => api.post('/chatbot/process', { message, sessionId }),
  startSession: () => api.post('/chatbot/session/start'),
  endSession: (sessionId) => api.post('/chatbot/session/end', { sessionId }),
  getHistory: (sessionId) => api.get(`/chatbot/history/${sessionId}`),
};

export default api;
