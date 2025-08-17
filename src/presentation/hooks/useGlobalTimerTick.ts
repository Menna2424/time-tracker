import { useEffect, useRef, useCallback, useState } from 'react';
import { container } from '../../application/di/container';

// Global state to ensure only one timer instance across the entire app
let globalTimerId: number | null = null;
let globalLastTick: number = 0;
let globalIsInitialized = false;
let globalNowTick: number = 0;
const globalTickListeners: Set<(tick: number) => void> = new Set();

export function useGlobalTimerTick() {
  const isInitializedRef = useRef(false);
  const [nowTick, setNowTick] = useState(globalNowTick);

  const initializeWorkingDay = useCallback(async () => {
    try {
      const ensureWorkingDay = container.ensureWorkingDayForToday;
      await ensureWorkingDay.execute({ 
        dailyBudgetSeconds: 8 * 3600 // 8 hours
      });
      console.debug('[GLOBAL_TICK] Working day initialized');
    } catch (error) {
      console.error('[GLOBAL_TICK] Error initializing working day:', error);
    }
  }, []);

  const tick = useCallback(async () => {
    const now = Date.now();
    
    // Calculate delta since last tick
    const deltaMs = now - globalLastTick;
    globalLastTick = now;
    
    // Increment global tick counter for UI updates
    globalNowTick++;
    
    // Notify all listeners about the new tick
    globalTickListeners.forEach(listener => {
      try {
        listener(globalNowTick);
      } catch (e) {
        console.error('[GLOBAL_TICK] Error in tick listener:', e);
      }
    });
    
    // Only process business logic if at least 1 second has passed
    if (deltaMs >= 1000) {
      try {
        const tickActiveWorkSecond = container.tickActiveWorkSecond;
        await tickActiveWorkSecond.execute();
      } catch (e) {
        console.debug('[GLOBAL_TICK] tick error', e);
      }
    }
  }, []);

  useEffect(() => {
    // Subscribe to tick updates
    const handleTickUpdate = (tick: number) => {
      setNowTick(tick);
    };
    
    globalTickListeners.add(handleTickUpdate);
    
    // Prevent multiple initializations
    if (isInitializedRef.current || globalIsInitialized) {
      return () => {
        globalTickListeners.delete(handleTickUpdate);
      };
    }

    isInitializedRef.current = true;
    globalIsInitialized = true;

    // Initialize working day
    initializeWorkingDay();

    // Load last tick time from localStorage to prevent drift
    const savedLastTick = localStorage.getItem('tt.globalLastTick');
    if (savedLastTick) {
      globalLastTick = parseInt(savedLastTick, 10);
    } else {
      globalLastTick = Date.now();
    }

    // Only create interval if one doesn't already exist
    if (!globalTimerId) {
      globalTimerId = window.setInterval(() => {
        tick();
        // Persist last tick time to localStorage
        localStorage.setItem('tt.globalLastTick', globalLastTick.toString());
      }, 1000); // Run exactly every 1 second

      console.debug('[GLOBAL_TICK] Global timer tick started');
    }

    // Cleanup on unmount
    return () => {
      globalTickListeners.delete(handleTickUpdate);
      // Note: We don't clear the global timer here because other components might be using it
      // The timer will be cleaned up when the app is closed or when explicitly stopped
      console.debug('[GLOBAL_TICK] Component unmounted, but keeping global timer active');
    };
  }, [initializeWorkingDay, tick]);

  // Return repositories and methods for backward compatibility + nowTick for UI updates
  return {
    nowTick, // Global tick counter that changes every second
    workingDayRepository: container.workingDayRepo,
    timerRepository: container.timerRepo,
    workdayTimerService: container.workdayTimerService,
    addActiveTask: (taskId: string) => {
      console.debug('[GLOBAL_TICK] Legacy addActiveTask called:', taskId);
      // No-op since global tick handles this automatically
    },
    removeActiveTask: (taskId: string) => {
      console.debug('[GLOBAL_TICK] Legacy removeActiveTask called:', taskId);
      // No-op since global tick handles this automatically
    },
    isTaskActive: (taskId: string) => {
      console.debug('[GLOBAL_TICK] Legacy isTaskActive called:', taskId);
      // Since this is a legacy sync method but timer repo is async,
      // and global timer handles all active state, return false
      // Components should check task.currentStartAt or active sessions directly
      return false;
    },
  };
}

// Export functions for global timer management
export const getGlobalNowTick = () => globalNowTick;

export const stopGlobalTimer = () => {
  if (globalTimerId) {
    clearInterval(globalTimerId);
    globalTimerId = null;
    globalIsInitialized = false;
    globalTickListeners.clear();
    console.debug('[GLOBAL_TICK] Global timer manually stopped');
  }
};