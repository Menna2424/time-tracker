import React, { useState, useEffect } from 'react';
import { useThemeContext } from '../../shared/context/ThemeContext';
import { useSettings } from '../../application/useCases/useSettings';

export const Settings: React.FC = () => {
  const { isDark, toggleTheme } = useThemeContext();
  const { settings, updateSettings, loading } = useSettings();
  const [hourlyRate, setHourlyRate] = useState<number>(50);

  useEffect(() => {
    if (settings) {
      setHourlyRate(settings.hourlyRate);
    }
  }, [settings]);

  const handleHourlyRateChange = async (newRate: number) => {
    if (newRate > 0) {
      await updateSettings({ hourlyRate: newRate });
      setHourlyRate(newRate);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Settings
        </h1>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Appearance
            </h2>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Dark Mode
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Switch between light and dark themes
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDark ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Notifications
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Timer Notifications
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified when timer completes
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Break Reminders
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Remind me to take breaks
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                  <span className="inline-block h-4 w-4 transform translate-x-1 rounded-full bg-white transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Timer Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Timer Settings
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Auto-start Timer
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically start timer when creating new session
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                  <span className="inline-block h-4 w-4 transform translate-x-1 rounded-full bg-white transition-transform" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Sound Alerts
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Play sound when timer starts/stops
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Earnings Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              💰 Earnings Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hourly Rate (USD)
                </label>
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                      onBlur={() => handleHourlyRateChange(hourlyRate)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="50.00"
                      disabled={loading}
                    />
                  </div>
                  <button
                    onClick={() => handleHourlyRateChange(hourlyRate)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Your hourly rate is used to calculate earnings for completed tasks
                </p>
              </div>
            </div>
          </div>

          {/* Data & Export */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Data & Export
            </h2>
            
            <div className="space-y-4">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Export Data
              </button>
              <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Import Data
              </button>
              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 