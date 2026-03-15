import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/globals.css';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Toast from './components/Toast';

function AppRoutes() {
  const { user } = useAuth();
  if (user?.role === 'admin') return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
  if (user) return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toast />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
