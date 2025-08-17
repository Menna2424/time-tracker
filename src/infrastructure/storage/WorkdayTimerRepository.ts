import type { WorkdayTimer, WorkdayTimerRepository } from '../../domain/types';

const STORAGE_KEY = 'workday_timer';
const WORKDAY_HOURS = 8;
const SECONDS_IN_HOUR = 3600;
const TOTAL_WORKDAY_SECONDS = WORKDAY_HOURS * SECONDS_IN_HOUR;

export class LocalStorageWorkdayTimerRepository implements WorkdayTimerRepository {
  async save(timer: WorkdayTimer): Promise<void> {
    const timerToSave = {
      ...timer,
      lastUpdated: timer.lastUpdated.toISOString() // Convert Date to string for storage
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timerToSave));
  }

  async load(): Promise<WorkdayTimer | null> {
    const stored = localStorage.getItem(STORAGE_KEY);
    const now = new Date();
    
    // Check if it's a new day
    const isNewDay = stored ? this.shouldResetForNewDay(stored) : true;
    
    if (!stored || isNewDay) {
      return {
        totalSeconds: TOTAL_WORKDAY_SECONDS,
        remainingSeconds: TOTAL_WORKDAY_SECONDS,
        status: 'active',
        lastUpdated: now,
        hasActiveTask: false
      };
    }

    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      lastUpdated: new Date(parsed.lastUpdated), // Convert string back to Date
      hasActiveTask: false // Always start with no active task
    };
  }

  private shouldResetForNewDay(storedTimer: string): boolean {
    try {
      const parsed = JSON.parse(storedTimer);
      const lastUpdated = new Date(parsed.lastUpdated);
      const now = new Date();
      
      // Reset if it's a different day
      return lastUpdated.getDate() !== now.getDate() ||
             lastUpdated.getMonth() !== now.getMonth() ||
             lastUpdated.getFullYear() !== now.getFullYear();
    } catch {
      return true;
    }
  }
} 