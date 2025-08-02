import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './shared/context/ThemeContext';
import { Sidebar } from './presentation/components/Sidebar';
import { Dashboard } from './presentation/pages/Dashboard';
import { Projects } from './presentation/pages/Projects';
import { Timer } from './presentation/pages/Timer';
import { Settings } from './presentation/pages/Settings';
// import Home from './Home';

const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* <Route path="/" element={<Home/> } /> */}
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <AppLayout />
      </Router>
    </ThemeProvider>
  );
};

export default App;
