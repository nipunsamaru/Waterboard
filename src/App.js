import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

import SignUpPage from './pages/SignUpPage';
import UserDashboard from './pages/UserDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EngineerDashboard from './pages/EngineerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RequestForm from './components/RequestForm';
import UsersByRolePage from './pages/UsersByRolePage'; // Import the new component
import AllRequests from './pages/AllRequests';
import { AuthProvider, useAuth } from './AuthContext';
import VendorManagement from './pages/VendorManagement';
import Reports from './pages/Reports';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to a forbidden page or home page if role is not allowed
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/" element={<PrivateRoute allowedRoles={['user', 'technician', 'manager', 'engineer', 'admin']}><HomePage /></PrivateRoute>} />

          <Route path="/user-dashboard" element={<PrivateRoute allowedRoles={['user']}><UserDashboard /></PrivateRoute>} />
          <Route path="/technician-dashboard" element={<PrivateRoute allowedRoles={['technician']}><TechnicianDashboard /></PrivateRoute>} />
          <Route path="/manager-dashboard" element={<PrivateRoute allowedRoles={['manager']}><ManagerDashboard /></PrivateRoute>} />
          <Route path="/engineer-dashboard" element={<PrivateRoute allowedRoles={['engineer']}><EngineerDashboard /></PrivateRoute>} />
          <Route path="/admin-dashboard" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/request-form" element={<PrivateRoute allowedRoles={['user']}><RequestForm /></PrivateRoute>} />
          <Route path="/admin/request-form" element={<PrivateRoute allowedRoles={['admin']}><RequestForm /></PrivateRoute>} />
          <Route path="/admin/users-by-role" element={<PrivateRoute allowedRoles={['admin']}><UsersByRolePage /></PrivateRoute>} /> {/* New route */}
          <Route path="/admin/all-requests" element={<PrivateRoute allowedRoles={['admin']}><AllRequests /></PrivateRoute>} />
          <Route path="/admin/vendor-management" element={<PrivateRoute allowedRoles={['admin']}><VendorManagement /></PrivateRoute>} />
          <Route path="/admin/reports" element={<PrivateRoute allowedRoles={['admin']}><Reports /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;