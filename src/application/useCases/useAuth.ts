import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthRepository } from '../../infrastructure/auth/AuthRepository';
import type { SignUpData } from '../../domain/auth';
import type { User } from '../../domain/entities/User';


// Move repository outside component to prevent recreation on every render
const authRepository = new AuthRepository();

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authRepository.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []); // Remove authRepository from dependency array

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const response = await authRepository.signIn({ email, password });
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Redirect based on role
      if (response.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      
      return response;
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error;
    }
  }, [navigate]);

  const signUp = useCallback(async (data: SignUpData) => {
    const response = await authRepository.signUp(data);
    setUser(response.user);
    setIsAuthenticated(true);
    
    // Redirect based on role after signup
    if (response.user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
    
    return response;
  }, [navigate]);

  const signOut = useCallback(async () => {
    await authRepository.signOut();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/auth');
  }, [navigate]);

  const checkAuthStatus = useCallback(async () => {
    try {
      const currentUser = await authRepository.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  // Compute isAdmin based on user role
  const isAdmin = user?.role === 'admin';

  return {
    isAuthenticated,
    user,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    checkAuthStatus
  };
}; 