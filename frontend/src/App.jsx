import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Profile from './pages/Profile';
import SeekerDashboard from './pages/Dashboard/SeekerDashboard';
import RecruiterDashboard from './pages/Dashboard/RecruiterDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';

import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#16162a',
              color: '#f1f5f9',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '10px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#16162a' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#16162a' } },
          }}
        />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route
            path="/profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />
          <Route
            path="/seeker"
            element={<ProtectedRoute roles={['seeker']}><SeekerDashboard /></ProtectedRoute>}
          />
          <Route
            path="/recruiter"
            element={<ProtectedRoute roles={['recruiter']}><RecruiterDashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>}
          />
          <Route path="*" element={<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '1rem' }}><h1 style={{ fontSize: '4rem', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1><p style={{ color: 'var(--text-secondary)' }}>Page not found</p><a href="/" className="btn btn-primary">Go Home</a></div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
