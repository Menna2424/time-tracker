import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, TrendingUp, Target, Moon, Sun, Menu } from 'lucide-react';
import { AdvancedMetricCard } from '../components/Dashboard/AdvancedMetricCard';
import { ProjectForm } from '../components/Projects/ProjectForm';
import { useThemeContext } from '../../shared/context/ThemeContext';
import { useProjects } from '../../application/useCases/useProjects';
import { useNotification } from '../../infrastructure/notifications/useNotification';
import type { ProjectEnhanced } from '../../domain/types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useThemeContext();
  const { createProject } = useProjects();
  const showNotification = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);

  const handleStartTimer = () => {
    navigate('/timer');
  };

  const handleNewProject = () => {
    setShowProjectForm(true);
  };

  const handleCreateProject = async (projectData: Omit<ProjectEnhanced, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProject = await createProject(projectData);
      setShowProjectForm(false);
      showNotification('Project Created', `Project "${newProject.name}" has been created successfully!`);
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      showNotification('Error', 'Failed to create project. Please try again.');
    }
  };

  const handleMetricClick = (metric: string) => {
    switch (metric) {
      case 'today':
        navigate('/statistics?range=today');
        break;
      case 'active':
        navigate('/projects?filter=active');
        break;
      case 'week':
        navigate('/statistics?range=week');
        break;
      case 'goals':
        navigate('/projects?tab=goals');
        break;
    }
  };

  const metrics = [
    {
      title: "Today's Time",
      value: "4h 32m",
      icon: Clock,
      change: 12,
      gradient: "from-blue-500 to-cyan-400",
      onClick: () => handleMetricClick('today'),
    },
    {
      title: "Active Projects", 
      value: "3",
      icon: Users,
      change: 0,
      gradient: "from-emerald-500 to-teal-400",
      onClick: () => handleMetricClick('active'),
    },
    {
      title: "This Week",
      value: "28h 15m", 
      icon: TrendingUp,
      change: 8,
      gradient: "from-purple-500 to-pink-400",
      onClick: () => handleMetricClick('week'),
    },
    {
      title: "Goal Progress",
      value: "85%",
      icon: Target,
      change: 5,
      gradient: "from-orange-500 to-red-400",
      onClick: () => handleMetricClick('goals'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-all duration-700">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-orange-600/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 border-b border-white/20 dark:border-gray-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-200"
              >
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
            
            <button
              onClick={toggleTheme}
              className="group p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 transition-all duration-300 hover:scale-105"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-500 group-hover:rotate-180 transition-transform duration-500" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600 group-hover:rotate-180 transition-transform duration-500" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
          <div className="backdrop-blur-xl bg-white/20 dark:bg-gray-900/20 rounded-3xl p-8 border border-white/30 dark:border-gray-700/30 shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Here's what's happening with your time tracking today.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <AdvancedMetricCard
              key={metric.title}
              {...metric}
              delay={index * 100}
            />
          ))}
        </div>

        {/* Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Activity */}
          <div className="opacity-0 animate-[slideIn_0.5s_ease-out_0.2s_forwards] backdrop-blur-xl bg-white/20 dark:bg-gray-900/20 rounded-3xl p-6 border border-white/30 dark:border-gray-700/30 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full mr-3 animate-pulse" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm hover:bg-white/40 dark:hover:bg-gray-700/30 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Project Alpha
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      2 hours ago
                    </p>
                  </div>
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="opacity-0 animate-[slideIn_0.5s_ease-out_0.4s_forwards] backdrop-blur-xl bg-white/20 dark:bg-gray-900/20 rounded-3xl p-6 border border-white/30 dark:border-gray-700/30 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mr-3 animate-pulse" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleStartTimer}
                className="group p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border border-blue-200/30 dark:border-blue-700/30 transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Timer</p>
              </button>
              <button 
                onClick={handleNewProject}
                className="group p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-200/30 dark:border-emerald-700/30 transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">New Project</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Project Form Modal */}
      <ProjectForm
        isOpen={showProjectForm}
        onClose={() => setShowProjectForm(false)}
        onSubmit={handleCreateProject}
        project={null}
      />
    </div>
  );
}; 