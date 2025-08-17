import React, { useState } from 'react';
import { useAuthContext } from '../../../shared/context/AuthContext';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { authState, signOut } = useAuthContext();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!authState.user) {
    return null;
  }

  return (
    <div className="relative">
      {/* User Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {authState.user.name}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            {/* User Info */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {authState.user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {authState.user.email}
              </p>
            </div>

            {/* Menu Items */}
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                // Navigate to settings or profile page
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>

            <button
              onClick={() => {
                setIsDropdownOpen(false);
                handleSignOut();
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}; 