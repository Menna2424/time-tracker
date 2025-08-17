/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../application/useCases/useAuth';
import type { AuthState, SignUpData, AuthCredentials, AuthResponse } from '../../domain/auth';
import type { User } from '../../domain/entities/User';

interface AuthContextType {
  signUp: (data: SignUpData) => Promise<AuthResponse>;
  signIn: (credentials: AuthCredentials) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<unknown>;
  resetPassword: (data: unknown) => Promise<void>;
  confirmPasswordReset: (data: unknown) => Promise<void>;
  verifyEmail: (data: unknown) => Promise<void>;
  getCurrentUser: () => Promise<unknown>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  loading: boolean;
  authState: AuthState;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  const authContextValue: AuthContextType = {
    ...auth,
    signUp: auth.signUp,
    signIn: async (credentials: AuthCredentials) => {
      try {
        return await auth.signIn(credentials.email, credentials.password);
      } catch (error) {
        console.error('Error in AuthContext signIn:', error);
        throw error;
      }
    },
    signOut: async () => {
      try {
        await auth.signOut();
      } catch (error) {
        console.error('Error in AuthContext signOut:', error);
        throw error;
      }
    },
    refreshAuth: async () => null,
    resetPassword: async () => {},
    confirmPasswordReset: async () => {},
    verifyEmail: async () => {},
    getCurrentUser: async () => auth.user,
    isAdmin: auth.isAdmin,
    authState: {
      user: auth.user,
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.loading,
      error: null,
    },
    clearError: () => {},
  };

  // Show loading screen while auth is initializing
  if (auth.loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Initializing Authentication
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Loading your session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}; 