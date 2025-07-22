import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostOpportunity from './pages/PostOpportunity';
import JobPostings from './pages/JobPostings';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import Profile from './pages/Profile';
import Students from './pages/Students';
import Analytics from './pages/Analytics';
import About from './pages/About';
import Chat from './pages/Chat';
import JobDetails from './pages/JobDetails';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-neutral-50">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/post" element={<ProtectedRoute><PostOpportunity /></ProtectedRoute>} />
                <Route path="/opportunities" element={<ProtectedRoute><JobPostings /></ProtectedRoute>} />
                <Route path="/edit-job/:id" element={<ProtectedRoute><EditJob /></ProtectedRoute>} />
                <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
                <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/job/:id" element={<JobDetails />} />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <Toast />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;










