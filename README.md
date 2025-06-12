# Campus Copilot - Novacore University AI Assistant

Campus Copilot is a comprehensive university management system with an integrated AI chatbot assistant. It provides students and administrators with easy access to schedules, menus, bus routes, events, updates, and FAQs through both a web interface and conversational AI.

## Demo Video
https://youtu.be/AY11-BWdJms

## 🏗 Technology Stack

### Frontend
- React.js - Modern JavaScript library for building user interfaces
- Tailwind CSS - Utility-first CSS framework for styling
- React Router - Client-side routing
- Axios - HTTP client for API requests
- React Hook Form - Form handling and validation
- Framer Motion - Animation library
- Lucide React - Icon library
- Socket.IO Client - Real-time communication

### Backend
- Node.js - JavaScript runtime environment
- Express.js - Web application framework
- Socket.IO - Real-time bidirectional communication
- MySQL - Relational database (with JSON fallback)
- JWT - JSON Web Tokens for authentication
- bcryptjs - Password hashing
- Express Validator - Input validation middleware
- Helmet - Security middleware
- CORS - Cross-origin resource sharing
- Rate Limiting - API protection

## 📋 Prerequisites

Before running the application, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MySQL](https://www.mysql.com/) (optional - JSON database fallback available)

## 🚀 Installation & Setup

### 1. Clone the Repository
bash
git clone https://github.com/Thanu10ekoon/Nexora
cd Nexora


### 2. Backend Setup

Navigate to the backend directory and install dependencies:
bash
cd backend
npm install


Create a .env file in the backend directory:
(This is also available in the github repository)

API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
DB_HOST=begdrfvyggsuuhdquznk-mysql.services.clever-cloud.com
DB_PORT=3306
DB_NAME=begdrfvyggsuuhdquznk
DB_USER=u2bsvi08d5viz2cn
DB_PASSWORD=26i87ckTHRfT1DxjkBXD
JWT_SECRET=NExora_1.0_CampusC-C0pilot
JWT_EXPIRES_IN=30d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
OpenAI_API_KEY=ADD_ONE
CORS_ORIGIN=http://localhost:3000


Initialize the database (optional - will use JSON database if MySQL is not available):
bash
node test-data.js


Start the backend server:
bash
npm run start


The backend server will start on http://localhost:5000

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:
bash
cd ../frontend
npm install


Create a .env file in the frontend directory (optional):
env
REACT_APP_API_URL=http://localhost:5000/api


Start the frontend development server:
bash
npm start


The frontend application will open at http://localhost:3000

## 🎯 Features

### For Students
- Dashboard - Quick overview of today's schedule, menu, and upcoming events
- Class Schedules - View class timetables with filtering options
- Cafeteria Menus - Browse daily menus with vegetarian indicators
- Bus Schedules - Check bus routes, timings, and availability
- Events - Discover upcoming campus events and activities
- University Updates - Stay informed with official announcements
- FAQs - Find answers to common questions
- AI Chatbot - Get instant help through conversational AI

### For Administrators
- Admin Dashboard - System statistics and quick access to management tools
- Schedule Management - Create, edit, and manage class schedules
- Menu Management - Update daily cafeteria menus and pricing
- Bus Management - Manage bus routes, timings, and capacity
- Event Management - Create and manage campus events
- Updates Management - Post university announcements and updates
- FAQ Management - Maintain frequently asked questions database

### AI Chatbot Features
- Natural Language Processing - Understands conversational queries
- Campus Information - Provides information about schedules, menus, buses, events
- Real-time Responses - Instant answers to common questions
- Contextual Awareness - Maintains conversation context
- Multi-format Support - Handles text with markdown formatting
- Langgraph, ReAct Agent, Node-nlp Technologies were used

## 📁 Project Structure


Nexora/
├── backend/                 # Node.js backend
│   ├── chatbot/            # AI chatbot implementation
│   ├── config/             # Database configuration
│   ├── data/               # JSON database files
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
│
├── frontend/               # React frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.js          # Main app component
│   └── package.json        # Frontend dependencies
│
└── database/               # Database schema
    └── schema.sql          # MySQL database schema


## 🔧 API Endpoints

### Authentication
- POST /api/auth/login - User login
- POST /api/auth/register - User registration
- GET /api/auth/profile - Get user profile

### Student & Admin Features
- GET /api/schedules - Get class schedules
- GET /api/menus - Get cafeteria menus
- GET /api/buses - Get bus schedules
- GET /api/events - Get events
- GET /api/updates - Get university updates
- GET /api/faqs - Get FAQs

### Chatbot
- POST /api/chatbot/chat/start - Start chat session
- POST /api/chatbot/chat/message - Send message to chatbot

## 🧪 Testing

The project includes comprehensive test scripts:

bash
# Test all APIs
cd backend
node test-all-apis.js

# Test student-specific views
node test-student-views.js

# Test field mappings
node test-field-mapping.js


## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Helmet security headers

## 🤖 AI Chatbot

The integrated AI chatbot provides:
- Natural language understanding
- Context-aware intent recognition and correct responses
- Campus information retrieval
- Real-time communication via Socket.IO
- Markdown-formatted responses
- Fallback to mock data when APIs are unavailable
- OpenAI for fallback

## 🎨 UI/UX Features

- Responsive design for all screen sizes
- Modern, clean interface with Tailwind CSS
- Smooth animations with Framer Motion
- Intuitive navigation and user experience
- Dark/light theme support
- Accessibility-friendly components

## 📱 Mobile Support

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones
- All modern web browsers

## 📄 License

This project is done by Scorpion X part of the Nexora competition by NSBM and is intended for educational and administrative purposes.

## 📞 Support

For technical support or questions about Campus Copilot, please contact the development team or create an issue in the repository.

## Team
# Scorpion X

T.M.T.A.B.Tennekoon - Team Lead, Chatbot implementation using AI/ML knowledge
W.A.P.V. Kumara - Cyber Security Specialist, Ensured APIs Security and Vulnability analysis
T.M.R.G. Thennakoon - Backend Developer, Organized the backend with proper architecture
K.A.D.H. Keragala - UI/UX Designer, Frontend UI/UX design



https://scorpion-xweb.vercel.app/ 