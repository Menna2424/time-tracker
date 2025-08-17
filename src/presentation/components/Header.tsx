import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthContext } from '../../shared/context/AuthContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, authState } = useAuthContext();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, redirect to auth page
      navigate('/auth');
    }
  };

  // Only show logout button when user is authenticated
  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Left side - can be used for breadcrumbs or page title */}
        <div className="flex-1">
          {/* Empty for now, can be used for breadcrumbs */}
        </div>
        
        {/* Right side - Logout button */}
        <div className="flex items-center">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}; 