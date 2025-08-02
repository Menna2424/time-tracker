import React from 'react';

export const Projects: React.FC = () => {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Projects
          </h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            + New Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Project Cards */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                ⋯
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Frontend Development
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Building the main application interface
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                12h 30m today
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Active
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                ⋯
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Backend API
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Server-side logic and database design
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                8h 45m today
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Active
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                ⋯
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Documentation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Writing technical documentation
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                3h 20m today
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Paused
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 