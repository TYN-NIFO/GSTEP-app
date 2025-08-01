import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import AuthCallback from "./components/AuthCallback.jsx";
import CompleteProfile from "./components/CompleteProfile";
import EditProfile from "./components/EditProfile";
import VerifyEmail from "./components/VerifyEmail";
import StudentDashboard from "./components/StudentDashboard";
import PODashboard from "./components/PODashboard";
import PRProfileSetup from "./components/PRProfileSetup";
import PRDashboard from "./components/PRDashboard";
import PRCreateJob from "./components/PRCreateJob";
import ProtectedRoute from "./components/ProtectedRoute";
import NavigationGuard from "./components/NavigationGuard";
import JobDrives from "./components/JobDrives.js";
import PlacementConsent from './components/PlacementConsent';
import OTPVerification from './components/OTPVerification';
import EditJobDrive from './components/EditJobDrive';
import { useAuth } from "./contexts/AuthContext";
import AllJobDrives from './components/AllJobDrives';
import CreateJobDrive from './components/CreateJobDrive';
import ManageDrives from './components/ManageDrives';
import StudentDetails from './components/StudentDetails';

// Dashboard redirect component
function DashboardRedirect() {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  switch (user.role) {
    case 'student':
      return <Navigate to="/student-dashboard" replace />;
    case 'placement_representative':
      return <Navigate to="/pr-dashboard" replace />;
    case 'po':
    case 'placement_officer':
      return <Navigate to="/po-dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <NavigationGuard />
          <Navbar />
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            
            {/* Role-based Dashboard Route */}
            <Route
              path="/dashboard"
              element={<DashboardRedirect />}
            />
            
            {/* Student Routes */}
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* PO Routes */}
            <Route
              path="/po-dashboard"
              element={
                <ProtectedRoute allowedRoles={["po", "placement_officer"]}>
                  <PODashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-details"
              element={
                <ProtectedRoute allowedRoles={["po", "placement_officer"]}>
                  <StudentDetails />
                </ProtectedRoute>
              }
            />
            
            {/* PR Routes */}
            <Route 
              path="/pr-profile-setup" 
              element={
                <ProtectedRoute allowedRoles={['placement_representative']}>
                  <PRProfileSetup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pr-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['placement_representative']}>
                  <PRDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pr-create-job" 
              element={
                <ProtectedRoute allowedRoles={['placement_representative']}>
                  <PRCreateJob />
                </ProtectedRoute>
              } 
            />

            <Route path="/job-drives" element={<ProtectedRoute allowedRoles={['student', 'placement_representative']}>
                  <JobDrives />
                </ProtectedRoute>} />

            <Route path="/placement-consent" element={<ProtectedRoute allowedRoles={['student', 'placement_representative']}>
                  <PlacementConsent />
                </ProtectedRoute>} />

            <Route path="/otp-verification" element={<ProtectedRoute allowedRoles={['student', 'placement_representative']}>
                  <OTPVerification />
                </ProtectedRoute>} />

            <Route
              path="/pr/edit-job/:id"
              element={
                <ProtectedRoute allowedRoles={["placement_representative"]}>
                  <EditJobDrive />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/edit-job-drive/:id"
              element={
                <ProtectedRoute allowedRoles={["po", "placement_officer"]}>
                  <EditJobDrive />
                </ProtectedRoute>
              }
            />

            <Route path="/all-job-drives" element={<AllJobDrives />} />

            <Route path="/create-job-drive" element={<CreateJobDrive />} />

            <Route
              path="/manage-drives"
              element={
                <ProtectedRoute allowedRoles={["po", "placement_officer"]}>
                  <ManageDrives />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;























