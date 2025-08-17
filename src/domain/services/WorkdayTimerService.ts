import type { IWorkingDayRepository } from '../repositories/IWorkingDayRepository';
import type { ITimerRepository } from '../repositories/ITimerRepository';
import type { WorkingDay } from '../entities/WorkingDay';

export interface WorkdayTimerState {
  workingDay: WorkingDay | null;
  hasActiveTasks: boolean;
  lastUpdate: number;
}

export class WorkdayTimerService {
  constructor(
    private workingDayRepository: IWorkingDayRepository,
    private timerRepository: ITimerRepository
  ) {}

  async getCurrentState(): Promise<WorkdayTimerState> {
    try {
      const workingDay = await this.workingDayRepository.getForToday();
      const activeSessions = await this.timerRepository.getActiveSessions();
      
      return {
        workingDay,
        hasActiveTasks: activeSessions.length > 0,
        lastUpdate: Date.now()
      };
    } catch (error) {
      console.debug('[WORKDAY_SERVICE] Error getting current state:', error);
      return {
        workingDay: null,
        hasActiveTasks: false,
        lastUpdate: Date.now()
      };
    }
  }

  async ensureWorkingDayExists(dailyBudgetSeconds: number = 8 * 3600): Promise<WorkingDay> {
    try {
      return await this.workingDayRepository.getForToday();
    } catch {
      // Create new working day if it doesn't exist
      const today = new Date().toISOString().split('T')[0];
      return await this.workingDayRepository.resetFor(today, dailyBudgetSeconds);
    }
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getTimerColor(remainingSeconds: number, totalSeconds: number): string {
    const percentage = (remainingSeconds / totalSeconds) * 100;
    if (percentage > 50) return 'text-green-600 dark:text-green-400';
    if (percentage > 25) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage > 10) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  }

  isWorkdayComplete(workingDay: WorkingDay): boolean {
    return workingDay.remainingSeconds <= 0;
  }

  isWorkdayActive(workingDay: WorkingDay): boolean {
    return workingDay.remainingSeconds > 0;
  }
}
