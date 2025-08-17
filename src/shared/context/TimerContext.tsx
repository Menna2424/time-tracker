/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { container } from '../../application/di/container';
import { useGlobalTimerTick } from '../../presentation/hooks/useGlobalTimerTick';
import { CountdownTaskTimer } from '../../application/useCases/timer/CountdownTaskTimer';
import { NotificationService } from '../../infrastructure/notifications/NotificationService';
import { useAuthContext } from './AuthContext';
import { getCurrentUserId } from '../../application/selectors/adminStats';
import type { Task } from '../../domain/entities/Task';

interface TimerContextType {
  // Active timer state
  isRunning: boolean;
  activeTaskId: string | null;
  activeTask: Task | null;
  
  // Live ticking state - changes every second to trigger re-renders
  nowTick: number;
  
  // Timer controls
  startTimer: (taskId: string) => Promise<boolean>;
  stopTimer: (taskId: string) => Promise<void>;
  
  // Force updates for real-time display
  forceUpdate: () => void;
  
  // Get active task info
  getActiveTask: () => Task | null;
  isTaskActive: (taskId: string) => boolean;
  
  // Live computation helpers
  getCurrentTaskData: (taskId: string) => Promise<{ currentSeconds: number; currentCents: number } | null>;
  
  // Countdown-specific methods
  getCountdownData: (taskId: string) => Promise<{ remainingSeconds: number; progressPercentage: number; isExpired: boolean } | null>;
  onCountdownExpired?: (taskId: string, taskTitle: string) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

interface TimerProviderProps {
  children: React.ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [, setUpdateTrigger] = useState(0);
  const [countdownTimer] = useState(() => new CountdownTaskTimer(container.tasksRepo));
  const [notificationService] = useState(() => NotificationService.getInstance());
  const stopTimerRef = useRef<((taskId: string) => Promise<void>) | null>(null);
  const { user } = useAuthContext();
  
  // Use the global timer tick instead of local state
  const { nowTick } = useGlobalTimerTick();
  
  // Check for active sessions on mount and when tasks change
  const checkActiveSessions = useCallback(async () => {
    try {
      const activeSessions = await container.timerRepo.getActiveSessions();
      if (activeSessions.length > 0) {
        const session = activeSessions[0]; // Take the first active session
        const task = await container.tasksRepo.getById(session.taskId);
        if (task) {
          setActiveTaskId(session.taskId);
          setActiveTask(task);
        }
      } else {
        setActiveTaskId(null);
        setActiveTask(null);
      }
    } catch (error) {
      console.error('Error checking active sessions:', error);
    }
  }, []);

  // Check for active sessions on mount
  useEffect(() => {
    checkActiveSessions();
  }, [checkActiveSessions]);

  // Listen for storage changes to detect when timers start/stop
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('sessions') || e.key?.includes('tasks')) {
        checkActiveSessions();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkActiveSessions]);

  // The global ticking mechanism is now handled by useGlobalTimerTick
  // This ensures only one 1Hz interval runs across the entire app

  const startTimer = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      // Stop any existing timer first
      if (activeTaskId && activeTaskId !== taskId && stopTimerRef.current) {
        await stopTimerRef.current(activeTaskId);
      }
      
      // Initialize countdown if task has estimated time
      await countdownTimer.initializeCountdown(taskId);
      
      // Start the new timer
      const memberId = user?.id || getCurrentUserId();
      const session = await container.startTaskTimer.execute({ 
        taskId, 
        memberId,
        mode: 'countup'
      });
      
      if (session) {
        const task = await container.tasksRepo.getById(taskId);
        if (task) {
          setActiveTaskId(taskId);
          setActiveTask(task);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('[TIMER_CONTEXT] Failed to start timer:', error);
      return false;
    }
  }, [activeTaskId, countdownTimer, user?.id]);

  const stopTimer = useCallback(async (taskId: string): Promise<void> => {
    try {
      await container.stopTaskTimer.execute(taskId);
      
      // Reset countdown when timer stops
      await countdownTimer.resetCountdown(taskId);
      
      if (activeTaskId === taskId) {
        setActiveTaskId(null);
        setActiveTask(null);
      }
      
    } catch (error) {
      console.error('[TIMER_CONTEXT] Failed to stop timer:', error);
    }
  }, [activeTaskId, countdownTimer]);

  // Update the ref whenever stopTimer changes
  stopTimerRef.current = stopTimer;

  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  const getActiveTask = useCallback((): Task | null => {
    return activeTask;
  }, [activeTask]);

  const isTaskActive = useCallback((taskId: string): boolean => {
    return activeTaskId === taskId;
  }, [activeTaskId]);

  const getCurrentTaskData = useCallback(async (taskId: string): Promise<{ currentSeconds: number; currentCents: number } | null> => {
    try {
      const activeSessions = await container.timerRepo.getActiveSessions();
      const activeSession = activeSessions.find(session => session.taskId === taskId);
      
      if (!activeSession) {
        return { currentSeconds: 0, currentCents: 0 };
      }

      const now = Date.now();
      const startTime = new Date(activeSession.startedAt).getTime();
      const currentSeconds = Math.floor((now - startTime) / 1000);
      
      const task = await container.tasksRepo.getById(taskId);
      const hourlyRateCents = task?.hourlyRateCents || 5000; // Default $50/hour
      const currentCents = Math.floor((currentSeconds / 3600) * hourlyRateCents);
      
      return { currentSeconds, currentCents };
    } catch (error) {
      console.error('[TIMER_CONTEXT] Error getting current task data:', error);
      return null;
    }
  }, []);

  const getCountdownData = useCallback(async (taskId: string): Promise<{ remainingSeconds: number; progressPercentage: number; isExpired: boolean } | null> => {
    try {
      const activeSessions = await container.timerRepo.getActiveSessions();
      const activeSession = activeSessions.find(session => session.taskId === taskId);
      
      if (!activeSession) {
        return null;
      }

      const startTime = new Date(activeSession.startedAt).getTime();
      const countdownResult = await countdownTimer.calculateCountdownState(taskId, startTime);
      
      if (!countdownResult) {
        return null;
      }

      // Auto-stop if countdown expired
      if (countdownResult.shouldStop && activeTaskId === taskId) {
        console.log('[TIMER_CONTEXT] Countdown expired, auto-stopping timer');
        await stopTimer(taskId);
        
        // Show notification using the notification service
        notificationService.showCountdownExpiredNotification(countdownResult.task.title);
      }

      return {
        remainingSeconds: countdownResult.remainingSeconds,
        progressPercentage: countdownResult.progressPercentage,
        isExpired: countdownResult.isExpired
      };
    } catch (error) {
      console.error('[TIMER_CONTEXT] Error getting countdown data:', error);
      return null;
    }
  }, [countdownTimer, activeTaskId, stopTimer, notificationService]);

  const value: TimerContextType = {
    isRunning: activeTaskId !== null,
    activeTaskId,
    activeTask,
    nowTick,
    startTimer,
    stopTimer,
    forceUpdate,
    getActiveTask,
    isTaskActive,
    getCurrentTaskData,
    getCountdownData
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimerContext = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
};