import { useState, useEffect, useCallback } from 'react';
import { useSettings } from './useSettings';
import { useAuth } from './useAuth';
import { container } from '../di/container';

export const useAppInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { loadSettings } = useSettings();
  const { checkAuthStatus } = useAuth();

  const initializeCountdownResilience = useCallback(async () => {
    try {
      // Get all active sessions
      const activeSessions = await container.timerRepo.getActiveSessions();
      
      for (const session of activeSessions) {
        const task = await container.tasksRepo.getById(session.taskId);
        
        if (task && task.isRunning && task.countdownStartedAt && task.estimatedMinutes) {
          // Recompute remaining time using current time
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - task.countdownStartedAt) / 1000);
          const totalEstimatedSeconds = task.estimatedMinutes * 60;
          const remainingSeconds = Math.max(0, totalEstimatedSeconds - elapsedSeconds);
          
          // Update the task with the correct remaining time
          const updatedTask = {
            ...task,
            countdownRemainingSec: remainingSeconds
          };
          
          await container.tasksRepo.save(updatedTask);
          console.debug('[APP_INIT] Updated countdown resilience for task:', task.id, 'remaining:', remainingSeconds);
        }
      }
    } catch (error) {
      console.error('[APP_INIT] Error initializing countdown resilience:', error);
    }
  }, []);

  const initializeApp = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load settings
      await loadSettings();
      
      // Check authentication status
      await checkAuthStatus();
      
      // Initialize countdown resilience for running tasks
      await initializeCountdownResilience();
      
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize app');
    } finally {
      setIsLoading(false);
    }
  }, [loadSettings, checkAuthStatus, initializeCountdownResilience]);

  const retryInitialization = useCallback(() => {
    setIsInitialized(false);
    initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]); // Run only once on mount

  return {
    isInitialized,
    isLoading,
    error,
    retryInitialization
  };
}; 