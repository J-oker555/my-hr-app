import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles.css';
import AppLayout from './components/layout/AppLayout';
import { RequireRole } from './components/routing/RequireRole';
import Login from './pages/auth/Login';
import { useAuthStore } from './stores/authStore';

// Lazy loading des pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Users = React.lazy(() => import('./pages/Users'));
const Jobs = React.lazy(() => import('./pages/Jobs'));
const Applications = React.lazy(() => import('./pages/Applications'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const RecruiterDashboard = React.lazy(() => import('./pages/RecruiterDashboard'));

const AppRouter: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <Login />;
  }

  return (
    <AppLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      }>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<RequireRole roles={['admin']}><Users /></RequireRole>} />
          <Route path="/jobs" element={<RequireRole roles={['admin', 'recruiter']}><Jobs /></RequireRole>} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/analytics" element={<RequireRole roles={['admin']}><Analytics /></RequireRole>} />
          <Route path="/recruiter-dashboard" element={<RequireRole roles={['recruiter']}><RecruiterDashboard /></RequireRole>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>
);


