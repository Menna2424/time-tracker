import { useState, useCallback, useEffect } from 'react';
import { LocalTasksRepository } from '../../infrastructure/storage/LocalTasksRepository';
import { LocalTimerRepository } from '../../infrastructure/repositories/LocalTimerRepository';
import { StartTaskTimer } from './timer/StartTaskTimer';
import { StopTaskTimer } from './timer/StopTaskTimer';
import { useGlobalTimerTick } from '../../presentation/hooks/useGlobalTimerTick';
import { useAuthContext } from '../../shared/context/AuthContext';
import { getCurrentUserId } from '../selectors/adminStats';
import type { Task } from '../../domain/entities/Task';
import type { TimerMode } from '../../domain/entities/TimerSession';

const tasksRepository = new LocalTasksRepository();
const timerRepository = new LocalTimerRepository();
const startTaskTimer = new StartTaskTimer(tasksRepository, timerRepository);
const stopTaskTimer = new StopTaskTimer(tasksRepository, timerRepository);

// const DEFAULT_HOURLY_RATE_CENTS = 5000; // $50/hour

export const useUnifiedTimer = () => {
  const [tasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthContext();
  const { addActiveTask, removeActiveTask, isTaskActive, nowTick, workingDayRepository } = useGlobalTimerTick();

  // Load tasks function
  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      // Since we don't have a getAll method, we'll need to implement it
      // For now, we'll focus on the core timer functionality
      console.debug('[UNIFIED_TIMER] Loading tasks (placeholder)');
    } catch (error) {
      console.error('[UNIFIED_TIMER] Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start timer for a task
  const startTimer = useCallback(async (taskId: string, mode: TimerMode = 'countup', targetSeconds?: number) => {
    try {
      console.debug('[UNIFIED_TIMER] Starting timer for task:', taskId);
      const memberId = user?.id || getCurrentUserId();
      const session = await startTaskTimer.execute({ taskId, memberId, mode, targetSeconds });
      
      // Register with global tick
      addActiveTask(taskId);
      
      await loadTasks(); // Refresh tasks
      return session;
    } catch (error) {
      console.error('[UNIFIED_TIMER] Error starting timer:', error);
      throw error;
    }
  }, [addActiveTask, loadTasks, user?.id]);

  // Stop timer for a task
  const stopTimer = useCallback(async (taskId: string) => {
    try {
      console.debug('[UNIFIED_TIMER] Stopping timer for task:', taskId);
      const updatedTask = await stopTaskTimer.execute(taskId);
      
      // Unregister from global tick
      removeActiveTask(taskId);
      
      await loadTasks(); // Refresh tasks
      return updatedTask;
    } catch (error) {
      console.error('[UNIFIED_TIMER] Error stopping timer:', error);
      throw error;
    }
  }, [removeActiveTask, loadTasks]);

  // Get a specific task
  const getTask = useCallback(async (taskId: string): Promise<Task | null> => {
    try {
      return await tasksRepository.getById(taskId);
    } catch (error) {
      console.error('[UNIFIED_TIMER] Error getting task:', error);
      return null;
    }
  }, []);

  // Check if a task is currently active
  const isTimerActive = useCallback((taskId: string) => {
    return isTaskActive(taskId);
  }, [isTaskActive]);

  // Format time helper
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Format currency helper
  const formatCurrency = useCallback((cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
  }, []);

  // Get live task data that combines persisted totals + current deltas
  const getLiveTaskData = useCallback(async (taskId: string) => {
    try {
      const task = await tasksRepository.getById(taskId);
      if (!task) {
        return { totalSeconds: 0, totalCents: 0, currentSeconds: 0, currentCents: 0 };
      }

      const activeSessions = await timerRepository.getActiveSessions();
      const activeSession = activeSessions.find(session => session.taskId === taskId);
      
      if (!activeSession) {
        // No active session, return only persisted totals
        return {
          totalSeconds: task.totalTimeSeconds || 0,
          totalCents: task.earningsCents || 0,
          currentSeconds: 0,
          currentCents: 0
        };
      }

      // Calculate current session time and earnings
      const now = Date.now();
      const startTime = new Date(activeSession.startedAt).getTime();
      const currentSeconds = Math.floor((now - startTime) / 1000);
      
      const hourlyRateCents = task.hourlyRateCents || 5000; // Default $50/hour
      const currentCents = Math.floor((currentSeconds / 3600) * hourlyRateCents);
      
      return {
        totalSeconds: (task.totalTimeSeconds || 0) + currentSeconds,
        totalCents: (task.earningsCents || 0) + currentCents,
        currentSeconds,
        currentCents
      };
    } catch (error) {
      console.error('[UNIFIED_TIMER] Error getting live task data:', error);
      return { totalSeconds: 0, totalCents: 0, currentSeconds: 0, currentCents: 0 };
    }
  }, []); // No dependencies - this function is pure and called when components re-render due to nowTick changes

  // Get live workday data
  const getLiveWorkdayData = useCallback(async () => {
    try {
      const workingDay = await workingDayRepository.getForToday();
      
      if (!workingDay) {
        return { totalSeconds: 0, remainingSeconds: 0, totalCents: 0 };
      }

      // Calculate worked seconds from budget - remaining
      const totalSeconds = workingDay.dailyBudgetSeconds - workingDay.remainingSeconds;
      
      // For earnings, we'll need to get this from tasks or use a default rate
      // For now, use a simple calculation with default rate
      const totalCents = Math.floor((totalSeconds / 3600) * 5000); // $50/hour default
      
      return {
        totalSeconds,
        remainingSeconds: workingDay.remainingSeconds,
        totalCents
      };
    } catch (error) {
      console.error('[UNIFIED_TIMER] Error getting live workday data:', error);
      return { totalSeconds: 0, remainingSeconds: 0, totalCents: 0 };
    }
  }, [workingDayRepository]); // workingDayRepository dependency - nowTick changes trigger component re-renders

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    isLoading,
    startTimer,
    stopTimer,
    getTask,
    isTimerActive,
    formatTime,
    formatCurrency,
    loadTasks,
    getLiveTaskData,
    getLiveWorkdayData,
    nowTick, // Expose nowTick for components that need it
  };
};