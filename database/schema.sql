-- Campus Copilot Database Schema for Novacore University
-- Execute these commands in your CleverCloud MySQL database

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS campus_copilot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_copilot;

-- Users table (Students and Admins)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reg_no VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('student', 'admin') NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(15),
    department VARCHAR(50),
    year_of_study INT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reg_no (reg_no),
    INDEX idx_user_type (user_type)
);

-- Class Schedules table
CREATE TABLE class_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    instructor VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    building VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_department (department),
    INDEX idx_day_time (day_of_week, start_time),
    INDEX idx_semester (semester)
);

-- Cafeteria Menus table
CREATE TABLE cafeteria_menus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_date DATE NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snacks') NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(8,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_vegetarian BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_menu_date (menu_date),
    INDEX idx_meal_type (meal_type),
    INDEX idx_category (category)
);

-- Bus Schedules table
CREATE TABLE bus_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    bus_number VARCHAR(20) NOT NULL,
    departure_location VARCHAR(100) NOT NULL,
    arrival_location VARCHAR(100) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    days_of_operation JSON NOT NULL, -- ["Monday", "Tuesday", ...]
    fare DECIMAL(6,2) NOT NULL,
    capacity INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_route (route_name),
    INDEX idx_departure_time (departure_time)
);

-- Events table
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(100),
    organizer VARCHAR(100),
    department VARCHAR(50),
    event_type VARCHAR(50) NOT NULL,
    registration_required BOOLEAN DEFAULT false,
    max_participants INT,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(15),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_event_date (event_date),
    INDEX idx_event_type (event_type),
    INDEX idx_department (department)
);

-- University Updates/News table
CREATE TABLE university_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    summary VARCHAR(500),
    category VARCHAR(50) NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    target_audience ENUM('all', 'students', 'faculty', 'staff') DEFAULT 'all',
    publish_date DATE NOT NULL,
    expiry_date DATE,
    is_published BOOLEAN DEFAULT true,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_publish_date (publish_date),
    INDEX idx_category (category),
    INDEX idx_priority (priority),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- FAQs table
CREATE TABLE faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    keywords JSON, -- ["schedule", "cafeteria", ...]
    popularity_score INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_popularity (popularity_score),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Chat Sessions table (for future AI integration)
CREATE TABLE chat_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_session (user_id, session_token)
);

-- Chat Messages table (for future AI integration)
CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    message_type ENUM('user', 'bot') NOT NULL,
    message_text TEXT NOT NULL,
    intent VARCHAR(50),
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    INDEX idx_session_time (session_id, created_at)
);

-- Insert sample admin user
INSERT INTO users (reg_no, password, user_type, full_name, email, department) VALUES 
('AD/2024/0001', '$2a$10$9XYNuE.OgL8jY4uOC4xLx.D3Q2Y7yKJz1Y5Z2E3R4P6V8W9Q1X2Y3', 'admin', 'Campus Administrator', 'admin@novacore.edu', 'Administration');

-- Insert sample student user
INSERT INTO users (reg_no, password, user_type, full_name, email, department, year_of_study) VALUES 
('SE/2024/0001', '$2a$10$9XYNuE.OgL8jY4uOC4xLx.D3Q2Y7yKJz1Y5Z2E3R4P6V8W9Q1X2Y3', 'student', 'John Doe', 'john.doe@student.novacore.edu', 'Computer Science', 2);

-- Insert sample class schedules
INSERT INTO class_schedules (class_name, subject, instructor, department, semester, day_of_week, start_time, end_time, room_number, building) VALUES
('CS-2A', 'Data Structures', 'Dr. Smith', 'Computer Science', '2024-Fall', 'Monday', '09:00:00', '10:30:00', '201', 'Engineering Block'),
('CS-2A', 'Database Systems', 'Prof. Johnson', 'Computer Science', '2024-Fall', 'Tuesday', '11:00:00', '12:30:00', '305', 'Engineering Block'),
('CS-2A', 'Web Development', 'Dr. Brown', 'Computer Science', '2024-Fall', 'Wednesday', '14:00:00', '15:30:00', '102', 'IT Block');

-- Insert sample cafeteria menu
INSERT INTO cafeteria_menus (menu_date, meal_type, item_name, description, price, category, is_vegetarian) VALUES
(CURDATE(), 'lunch', 'Chicken Biryani', 'Aromatic basmati rice with tender chicken pieces', 8.50, 'Main Course', false),
(CURDATE(), 'lunch', 'Vegetable Biryani', 'Aromatic basmati rice with mixed vegetables', 7.00, 'Main Course', true),
(CURDATE(), 'lunch', 'Caesar Salad', 'Fresh lettuce with caesar dressing and croutons', 5.50, 'Salads', true),
(CURDATE(), 'dinner', 'Grilled Fish', 'Fresh fish grilled with herbs and spices', 12.00, 'Main Course', false);

-- Insert sample bus schedules
INSERT INTO bus_schedules (route_name, bus_number, departure_location, arrival_location, departure_time, arrival_time, days_of_operation, fare, capacity) VALUES
('City Center Route', 'BUS-001', 'University Main Gate', 'City Center Mall', '08:00:00', '08:45:00', '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]', 2.50, 45),
('Airport Route', 'BUS-002', 'University Main Gate', 'International Airport', '06:00:00', '07:30:00', '["Friday", "Sunday"]', 15.00, 35),
('Railway Station Route', 'BUS-003', 'University Main Gate', 'Central Railway Station', '07:30:00', '08:15:00', '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]', 3.00, 40);

-- Insert sample events
INSERT INTO events (title, description, event_date, start_time, end_time, location, organizer, department, event_type, registration_required, max_participants, contact_email) VALUES
('Annual Tech Fest 2024', 'A grand celebration of technology and innovation', '2024-12-15', '09:00:00', '18:00:00', 'Main Auditorium', 'Student Council', 'Computer Science', 'Festival', true, 500, 'techfest@novacore.edu'),
('Career Fair', 'Meet with top employers and explore career opportunities', '2024-11-20', '10:00:00', '16:00:00', 'Sports Complex', 'Career Services', 'All Departments', 'Career', true, 1000, 'career@novacore.edu'),
('Guest Lecture: AI in Healthcare', 'Expert talk on artificial intelligence applications in healthcare', '2024-10-25', '14:00:00', '15:30:00', 'Lecture Hall A', 'Dr. Wilson', 'Computer Science', 'Academic', false, 200, 'events@novacore.edu');

-- Insert sample university updates
INSERT INTO university_updates (title, content, summary, category, priority, target_audience, publish_date, created_by) VALUES
('New Library Hours', 'The university library will now be open 24/7 during exam periods. Students can access study rooms and computer labs round the clock.', 'Library now open 24/7 during exams', 'Facilities', 'medium', 'students', CURDATE(), 1),
('Semester Registration Open', 'Online registration for Spring 2025 semester is now open. Students must complete registration before the deadline.', 'Spring 2025 registration is open', 'Academic', 'high', 'students', CURDATE(), 1),
('Campus WiFi Upgrade', 'Campus-wide WiFi infrastructure has been upgraded for better speed and connectivity.', 'WiFi upgrade completed', 'Technology', 'medium', 'all', CURDATE(), 1);

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category, keywords, created_by) VALUES
('What are the library opening hours?', 'The library is open Monday to Friday from 8:00 AM to 10:00 PM, weekends from 9:00 AM to 6:00 PM. During exam periods, it operates 24/7.', 'Facilities', '["library", "hours", "timings"]', 1),
('How do I access the university WiFi?', 'Connect to "NovaCore-Student" network and use your student registration number as username and your date of birth (DDMMYYYY) as password.', 'Technology', '["wifi", "internet", "network", "password"]', 1),
('Where can I find the class schedules?', 'Class schedules are available on the student portal, mobile app, or you can ask Campus Copilot for your personalized schedule.', 'Academic', '["schedule", "timetable", "classes"]', 1),
('What food options are available in the cafeteria?', 'Our cafeteria offers variety of meals including vegetarian and non-vegetarian options. Daily menus are updated and available through Campus Copilot.', 'Cafeteria', '["food", "cafeteria", "menu", "meals"]', 1);

-- Show tables created
SHOW TABLES;
