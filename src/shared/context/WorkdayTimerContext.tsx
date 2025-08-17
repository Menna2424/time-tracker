/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { WorkdayTimer } from '../../domain/types';
import { LocalStorageWorkdayTimerRepository } from '../../infrastructure/storage/WorkdayTimerRepository';
import { useGlobalTimerTick } from '../../presentation/hooks/useGlobalTimerTick';

interface WorkdayTimerContextType {
  timer: WorkdayTimer | null;
  isInitialized: boolean;
  setActiveTask: (isActive: boolean, taskId?: string) => void;
  stopAllTasks: () => void;
  formatTime: (seconds: number) => string;
  getTimerColor: (remainingSeconds: number) => string;
  resetWorkdayTimer: () => void;
  pauseWorkdayTimer: () => void;
  resumeWorkdayTimer: () => void;
  toggleWorkdayTimer: () => void;
  isPaused: boolean;
  isWorkdayEnded: boolean;
  activeTaskId: string | null;
  // Live ticking state - changes every second to trigger re-renders
  nowTick: number;
}

const WorkdayTimerContext = createContext<WorkdayTimerContextType | undefined>(undefined);

export const useWorkdayTimerContext = () => {
  const context = useContext(WorkdayTimerContext);
  if (!context) {
    throw new Error('useWorkdayTimerContext must be used within a WorkdayTimerProvider');
  }
  return context;
};

interface WorkdayTimerProviderProps {
  children: ReactNode;
}

const timerRepository = new LocalStorageWorkdayTimerRepository();
const SAVE_INTERVAL = 5000; // Save to localStorage every 5 seconds

export const WorkdayTimerProvider: React.FC<WorkdayTimerProviderProps> = ({ children }) => {
  const [timer, setTimer] = useState<WorkdayTimer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const lastSaveRef = useRef<Date>(new Date());
  const onWorkdayEndCallbacks = useRef<Set<() => void>>(new Set());
  
  // Use the global timer tick instead of local state
  const { nowTick } = useGlobalTimerTick();

  // Initialize timer on mount
  useEffect(() => {
    const initTimer = async () => {
      try {
        const savedTimer = await timerRepository.load();
        if (savedTimer) {
          setTimer({
            ...savedTimer,
            hasActiveTask: false // Always start with no active task
          });
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load workday timer:', error);
      }
    };
    initTimer();
  }, []);

  // Workday timer countdown is now handled by the global timer tick (useGlobalTimerTick)
  // This prevents duplicate decrements that caused the 3x speed issue
  // The TickActiveWorkSecond use case handles all working day countdown logic

  // The global ticking mechanism is now handled by useGlobalTimerTick
  // This ensures only one 1Hz interval runs across the entire app

  // Auto-save timer state
  useEffect(() => {
    if (timer && isInitialized) {
      const now = new Date();
      const timeSinceLastSave = now.getTime() - lastSaveRef.current.getTime();
      
      // Save more frequently when task is active, less frequently when idle
      const saveInterval = timer.hasActiveTask ? 1000 : SAVE_INTERVAL;
      
      // Only save if enough time has passed
      if (timeSinceLastSave >= saveInterval) {
        timerRepository.save(timer);
        lastSaveRef.current = now;
      }
    }
  }, [timer, isInitialized]);

  const setActiveTask = useCallback((isActive: boolean, taskId?: string) => {
    if (isActive && timer?.status === 'completed') {
      console.warn('Cannot start task: Workday is complete');
      return;
    }

    setActiveTaskId(isActive ? taskId || null : null);
    setTimer(current => {
      if (!current) return null;
      return {
        ...current,
        hasActiveTask: isActive,
        lastUpdated: new Date()
      };
    });
  }, [timer?.status]);

  const stopAllTasks = useCallback(() => {
    // This function will be called by components that need to stop tasks
    // when workday ends. Components can register callbacks to handle this.
    onWorkdayEndCallbacks.current.forEach(callback => callback());
    setActiveTaskId(null);
    setTimer(current => {
      if (!current) return null;
      return {
        ...current,
        hasActiveTask: false,
        lastUpdated: new Date()
      };
    });
  }, []);

  const pauseWorkdayTimer = useCallback(() => {
    setTimer(current => {
      if (!current || current.status === 'completed') return current;
      return {
        ...current,
        status: 'paused',
        lastUpdated: new Date()
      };
    });
  }, []);

  const resumeWorkdayTimer = useCallback(() => {
    setTimer(current => {
      if (!current || current.status === 'completed') return current;
      return {
        ...current,
        status: 'active',
        lastUpdated: new Date()
      };
    });
  }, []);

  const toggleWorkdayTimer = useCallback(() => {
    setTimer(current => {
      if (!current || current.status === 'completed') return current;
      return {
        ...current,
        status: current.status === 'paused' ? 'active' : 'paused',
        lastUpdated: new Date()
      };
    });
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getTimerColor = useCallback((remainingSeconds: number): string => {
    const hours = remainingSeconds / 3600;
    if (hours > 4) return 'text-green-500';
    if (hours > 1) return 'text-orange-500';
    return 'text-red-500';
  }, []);

  const resetWorkdayTimer = useCallback(() => {
    const newTimer: WorkdayTimer = {
      totalSeconds: 8 * 3600, // 8 hours
      remainingSeconds: 8 * 3600,
      status: 'active',
      lastUpdated: new Date(),
      hasActiveTask: false
    };
    setTimer(newTimer);
    setActiveTaskId(null);
  }, []);

  // Function to register callbacks for workday end
  const registerWorkdayEndCallback = useCallback((callback: () => void) => {
    onWorkdayEndCallbacks.current.add(callback);
    return () => {
      onWorkdayEndCallbacks.current.delete(callback);
    };
  }, []);

  const value: WorkdayTimerContextType = {
    timer,
    isInitialized,
    setActiveTask,
    stopAllTasks,
    formatTime,
    getTimerColor,
    resetWorkdayTimer,
    pauseWorkdayTimer,
    resumeWorkdayTimer,
    toggleWorkdayTimer,
    isPaused: timer?.status === 'paused',
    isWorkdayEnded: timer?.status === 'completed',
    activeTaskId,
    nowTick
  };

  // Add the callback registration to the context (internal use)
  (value as WorkdayTimerContextType & { registerWorkdayEndCallback: typeof registerWorkdayEndCallback }).registerWorkdayEndCallback = registerWorkdayEndCallback;

  return (
    <WorkdayTimerContext.Provider value={value}>
      {children}
    </WorkdayTimerContext.Provider>
  );
};