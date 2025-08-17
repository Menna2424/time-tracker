import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../shared/context/AuthContext';

import { LoginForm } from '../components/Auth/LoginForm';
import { SignUpForm } from '../components/Auth/SignUpForm';
import { ForgotPasswordForm } from '../components/Auth/ForgotPasswordForm';
import { Loader2 } from 'lucide-react';

type AuthView = 'login' | 'signup' | 'forgot-password';

export const Auth: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const { isAuthenticated, user, loading } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to appropriate page if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, navigating to appropriate page');
      try {
        // Get the intended destination from location state, or determine based on user role
        const from = location.state?.from?.pathname;
        let target = from;
        
                 if (!target) {
                     // If no specific destination, route based on user role
          target = user?.role === 'admin' ? '/admin' : '/dashboard';
         }
        
        navigate(target, { replace: true });
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }
  }, [isAuthenticated, navigate, location.state, user?.role]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const renderAuthForm = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginForm
            onSwitchToSignUp={() => setCurrentView('signup')}
            onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
          />
        );
      case 'signup':
        return (
          <SignUpForm
            onSwitchToLogin={() => setCurrentView('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onBackToLogin={() => setCurrentView('login')}
          />
        );
      default:
        return (
          <LoginForm
            onSwitchToSignUp={() => setCurrentView('signup')}
            onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Time Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your time, boost your productivity
          </p>
        </div>

        {/* Auth Form */}
        <div className="transition-all duration-300 ease-in-out">
          {renderAuthForm()}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 Time Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}; 