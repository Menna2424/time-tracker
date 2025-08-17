import React, { useEffect, useState, useCallback } from 'react';
import { useStatisticsContext } from '../../shared/context/StatisticsContext';
import { useProjects } from '../../application/useCases/useProjects';
import { useStatistics } from '../../application/useCases/useStatistics';
import type { ProjectEnhanced } from '../../domain/types';
import { formatCurrency } from '../../shared/utils/formatters';

const Statistics: React.FC = () => {
  const { statistics, isLoading, error, refreshStatistics } = useStatisticsContext();
  const { projects: projectsData } = useProjects();
  const { getEarningsByProject } = useStatistics();
  const [projects, setProjects] = useState<ProjectEnhanced[]>([]);
  const [projectEarnings, setProjectEarnings] = useState<{projectId: string; earnings: number; tasksCount: number}[]>([]);

  // Memoize the earnings calculation to prevent infinite loops
  const calculateProjectEarnings = useCallback(() => {
    if (!projectsData.length) return [];
    
    return projectsData.map(project => ({
      projectId: project.id,
      earnings: getEarningsByProject(project.id),
      tasksCount: 0 // Mock data for now
    }));
  }, [projectsData, getEarningsByProject]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const earningsData = calculateProjectEarnings();
        setProjects(projectsData);
        setProjectEarnings(earningsData);
      } catch (err) {
        console.error('Failed to load statistics data:', err);
      }
    };

    loadData();
  }, [projectsData, calculateProjectEarnings]);





  const getProjectName = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    subtitle?: string;
    icon: string;
    color: string;
  }> = ({ title, value, subtitle, icon, color }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Error Loading Statistics</h3>
            <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
            <button
              onClick={refreshStatistics}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                📊 Earnings Statistics
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Track your earnings and productivity metrics
              </p>
            </div>
            <button
              onClick={refreshStatistics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Main Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Earnings"
            value={formatCurrency(statistics.totalEarnings)}
            subtitle="All time"
            icon="💰"
            color="border-green-500"
          />
          <StatCard
            title="Today's Earnings"
            value={formatCurrency(statistics.dailyEarnings)}
            subtitle={`${statistics.tasksCompletedToday} tasks completed`}
            icon="📅"
            color="border-blue-500"
          />
          <StatCard
            title="Weekly Earnings"
            value={formatCurrency(statistics.weeklyEarnings)}
            subtitle={`${statistics.tasksCompletedThisWeek} tasks completed`}
            icon="📊"
            color="border-purple-500"
          />
          <StatCard
            title="Monthly Earnings"
            value={formatCurrency(statistics.monthlyEarnings)}
            subtitle={`${statistics.tasksCompletedThisMonth} tasks completed`}
            icon="📈"
            color="border-orange-500"
          />
        </div>

        {/* Project Earnings Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            💼 Earnings by Project
          </h2>
          {projectEarnings.length > 0 ? (
            <div className="space-y-4">
              {projectEarnings
                .sort((a, b) => b.earnings - a.earnings)
                .map((item) => (
                  <div
                    key={item.projectId}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {getProjectName(item.projectId)}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.tasksCount} tasks completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(item.earnings)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No earnings data available yet. Complete some tasks to see project earnings!
              </p>
            </div>
          )}
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              ⚡ Performance Insights
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Average Earnings per Task</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {statistics.tasksCompletedToday + statistics.tasksCompletedThisWeek + statistics.tasksCompletedThisMonth > 0
                    ? formatCurrency(statistics.totalEarnings / (statistics.tasksCompletedToday + statistics.tasksCompletedThisWeek + statistics.tasksCompletedThisMonth))
                    : formatCurrency(0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Tasks Completed Today</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {statistics.tasksCompletedToday}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">This Week's Progress</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {statistics.tasksCompletedThisWeek} tasks
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">This Month's Progress</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">
                  {statistics.tasksCompletedThisMonth} tasks
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              🚀 Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <span>⚙️</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Update Hourly Rate</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Adjust your billing rate</p>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <span>📊</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Export Data</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Download earnings report</p>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <span>📈</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">View Detailed Reports</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Advanced analytics</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;