import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './presentation/components/Auth/ProtectedRoute';
import { AdminRoute } from './presentation/components/Auth/AdminRoute';
import { Sidebar } from './presentation/components/Sidebar';
import { Header } from './presentation/components/Header';
import { Dashboard } from './presentation/pages/Dashboard';
import { Projects } from './presentation/pages/Projects';
import { Timer } from './presentation/pages/Timer';
import { Settings } from './presentation/pages/Settings';
import Statistics from './presentation/pages/Statistics';
import { AdminDashboardPage } from './presentation/pages/AdminDashboardPage';
import Unauthorized from './presentation/pages/Unauthorized';
import { Auth } from './presentation/pages/Auth';
import { TimerWrapper } from './presentation/components/Common/TimerWrapper';
import { useAppInitialization } from './application/useCases/useAppInitialization';
import { useGlobalTimerTick } from './presentation/hooks/useGlobalTimerTick';
import { NotificationService } from './infrastructure/notifications/NotificationService';

const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/timer" element={<Timer />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route index element={<AdminDashboardPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const ProtectedAppLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
};

const ProtectedAdminLayout: React.FC = () => {
  return (
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  );
};

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Initializing Time Tracker
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Loading your data and checking for updates...
      </p>
    </div>
  </div>
);

const ErrorScreen: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center max-w-md">
      <div className="text-red-500 mb-4">
        <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Initialization Failed
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {error}
      </p>
      <button
        onClick={onRetry}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Retry Initialization
      </button>
    </div>
  </div>
);

export const App: React.FC = () => {
  const { isInitialized, isLoading, error, retryInitialization } = useAppInitialization();
  
  // Initialize global timer tick
  useGlobalTimerTick();

  // Request notification permissions on app start
  React.useEffect(() => {
    if (isInitialized) {
      const notificationService = NotificationService.getInstance();
      notificationService.requestPermission().catch(console.error);
    }
  }, [isInitialized]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={retryInitialization} />;
  }

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Admin routes */}
        <Route path="/admin/*" element={<ProtectedAdminLayout />} />
        
        {/* Protected routes */}
        <Route path="/*" element={<ProtectedAppLayout />} />
      </Routes>
      
      {/* TimerWrapper now positioned at bottom-right by default. 
          To center it at the bottom, use: <TimerWrapper position="bottom-center" /> */}
      <TimerWrapper />
    </div>
  );
};

export default App;
