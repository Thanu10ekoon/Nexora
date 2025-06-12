import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Components
import LoadingSpinner from './components/common/LoadingSpinner';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Admin Management Pages
import SchedulesManagement from './pages/admin/SchedulesManagement';
import MenusManagement from './pages/admin/MenusManagement';
import BusesManagement from './pages/admin/BusesManagement';
import EventsManagement from './pages/admin/EventsManagement';
import UpdatesManagement from './pages/admin/UpdatesManagement';
import FAQsManagement from './pages/admin/FAQsManagement';

// Student View Pages
import SchedulesView from './pages/student/SchedulesView';
import MenusView from './pages/student/MenusViewTest';
import BusesView from './pages/student/BusesView';
import EventsView from './pages/student/EventsView';
import UpdatesView from './pages/student/UpdatesView';
import FAQsView from './pages/student/FAQsView';

function App() {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout>
                {user?.userType === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin/schedules" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <SchedulesManagement />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/menus" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <MenusManagement />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/buses" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <BusesManagement />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/events" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <EventsManagement />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/updates" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <UpdatesManagement />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/faqs" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <FAQsManagement />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Student Routes */}
        <Route 
          path="/student/schedules" 
          element={
            <ProtectedRoute requiredRole="student">
              <Layout>
                <SchedulesView />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/menus" 
          element={
            <ProtectedRoute requiredRole="student">
              <Layout>
                <MenusView />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/buses" 
          element={
            <ProtectedRoute requiredRole="student">
              <Layout>
                <BusesView />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/events" 
          element={
            <ProtectedRoute requiredRole="student">
              <Layout>
                <EventsView />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/updates" 
          element={
            <ProtectedRoute requiredRole="student">
              <Layout>
                <UpdatesView />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/faqs" 
          element={
            <ProtectedRoute requiredRole="student">
              <Layout>
                <FAQsView />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Default redirects */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Navigate to="/login" />
          } 
        />
        
        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
