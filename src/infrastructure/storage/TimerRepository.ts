import type { Timer } from '../../domain/types';

const TIMERS_STORAGE_KEY = 'timers';

export interface ITimerRepository {
  getAll(): Promise<Timer[]>;
  getById(id: string): Promise<Timer | null>;
  getByTaskId(taskId: string): Promise<Timer[]>;
  save(timer: Timer): Promise<Timer>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  getCompletedTimers(): Promise<Timer[]>;
  getTotalTimeForTask(taskId: string): Promise<number>;
  getActiveSession(taskId: string): Promise<Timer | null>;
  endSession(sessionId: string, endTime: Date, duration: number, earnings: number): Promise<void>;
  appendSessionHistory(taskId: string, session: { startTime: Date; endTime: Date; duration: number; earned: number }): Promise<void>;
}

export class LocalStorageTimerRepository implements ITimerRepository {
  private loadTimers(): Timer[] {
    try {
      const stored = localStorage.getItem(TIMERS_STORAGE_KEY);
      if (!stored) {
        return [];
      }
      
      const parsed = JSON.parse(stored);
      return parsed.map((timer: Record<string, unknown>) => ({
        ...timer,
        startTime: new Date(timer.startTime as string),
        endTime: timer.endTime ? new Date(timer.endTime as string) : undefined,
      }));
    } catch (error) {
      console.error('Failed to load timers from localStorage:', error);
      return [];
    }
  }

  private saveTimers(timers: Timer[]): void {
    try {
      const serialized = timers.map(timer => ({
        ...timer,
        startTime: timer.startTime.toISOString(),
        endTime: timer.endTime?.toISOString(),
      }));
      localStorage.setItem(TIMERS_STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to save timers to localStorage:', error);
      throw new Error('Failed to persist timer data');
    }
  }

  async getAll(): Promise<Timer[]> {
    return this.loadTimers();
  }

  async getById(id: string): Promise<Timer | null> {
    const timers = this.loadTimers();
    return timers.find(t => t.id === id) || null;
  }

  async getByTaskId(taskId: string): Promise<Timer[]> {
    const timers = this.loadTimers();
    return timers.filter(t => t.taskId === taskId);
  }

  async save(timer: Timer): Promise<Timer> {
    const timers = this.loadTimers();
    const existingIndex = timers.findIndex(t => t.id === timer.id);
    
    if (existingIndex >= 0) {
      timers[existingIndex] = timer;
    } else {
      timers.push(timer);
    }
    
    this.saveTimers(timers);
    return timer;
  }

  async delete(id: string): Promise<void> {
    const timers = this.loadTimers();
    const filteredTimers = timers.filter(t => t.id !== id);
    this.saveTimers(filteredTimers);
  }

  async clear(): Promise<void> {
    localStorage.removeItem(TIMERS_STORAGE_KEY);
  }

  async getCompletedTimers(): Promise<Timer[]> {
    const timers = this.loadTimers();
    return timers.filter(t => !t.isRunning && t.endTime);
  }

  async getTotalTimeForTask(taskId: string): Promise<number> {
    const taskTimers = await this.getByTaskId(taskId);
    return taskTimers
      .filter(timer => timer.duration !== undefined)
      .reduce((total, timer) => total + (timer.duration || 0), 0);
  }

  async getActiveSession(taskId: string): Promise<Timer | null> {
    const taskTimers = await this.getByTaskId(taskId);
    return taskTimers.find(timer => timer.isRunning) || null;
  }

  async endSession(sessionId: string, endTime: Date, duration: number, earnings: number): Promise<void> {
    const timers = this.loadTimers();
    const sessionIndex = timers.findIndex(t => t.id === sessionId);
    
    if (sessionIndex >= 0) {
      const session = timers[sessionIndex];
      timers[sessionIndex] = {
        ...session,
        endTime,
        duration,
        isRunning: false
      };
      this.saveTimers(timers);
      
      // Append to session history
      await this.appendSessionHistory(session.taskId, {
        startTime: session.startTime,
        endTime,
        duration,
        earned: earnings
      });
    }
  }

  async appendSessionHistory(taskId: string, session: { startTime: Date; endTime: Date; duration: number; earned: number }): Promise<void> {
    try {
      const historyKey = `task_session_history_${taskId}`;
      const existingHistory = localStorage.getItem(historyKey);
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      const sessionRecord = {
        id: Date.now().toString(),
        taskId,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime.toISOString(),
        duration: session.duration,
        earned: session.earned
      };
      
      history.push(sessionRecord);
      localStorage.setItem(historyKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error appending session history:', error);
    }
  }
}

// In-memory implementation for testing/fallback
export class InMemoryTimerRepository implements ITimerRepository {
  private timers: Timer[] = [];

  async getAll(): Promise<Timer[]> {
    return [...this.timers];
  }

  async getById(id: string): Promise<Timer | null> {
    return this.timers.find(t => t.id === id) || null;
  }

  async getByTaskId(taskId: string): Promise<Timer[]> {
    return this.timers.filter(t => t.taskId === taskId);
  }

  async save(timer: Timer): Promise<Timer> {
    const existingIndex = this.timers.findIndex(t => t.id === timer.id);
    
    if (existingIndex >= 0) {
      this.timers[existingIndex] = timer;
    } else {
      this.timers.push(timer);
    }
    
    return timer;
  }

  async delete(id: string): Promise<void> {
    this.timers = this.timers.filter(t => t.id !== id);
  }

  async clear(): Promise<void> {
    this.timers = [];
  }

  async getCompletedTimers(): Promise<Timer[]> {
    return this.timers.filter(t => !t.isRunning && t.endTime);
  }

  async getTotalTimeForTask(taskId: string): Promise<number> {
    const taskTimers = await this.getByTaskId(taskId);
    return taskTimers
      .filter(timer => timer.duration !== undefined)
      .reduce((total, timer) => total + (timer.duration || 0), 0);
  }

  async getActiveSession(taskId: string): Promise<Timer | null> {
    const taskTimers = await this.getByTaskId(taskId);
    return taskTimers.find(timer => timer.isRunning) || null;
  }

  async endSession(sessionId: string, endTime: Date, duration: number, earnings: number): Promise<void> {
    const sessionIndex = this.timers.findIndex(t => t.id === sessionId);
    
    if (sessionIndex >= 0) {
      const session = this.timers[sessionIndex];
      this.timers[sessionIndex] = {
        ...session,
        endTime,
        duration,
        isRunning: false
      };
      
      // Append to session history
      await this.appendSessionHistory(session.taskId, {
        startTime: session.startTime,
        endTime,
        duration,
        earned: earnings
      });
    }
  }

  async appendSessionHistory(taskId: string, session: { startTime: Date; endTime: Date; duration: number; earned: number }): Promise<void> {
    // In-memory implementation - just log for now
    console.log('Session history appended:', { taskId, session });
  }
}