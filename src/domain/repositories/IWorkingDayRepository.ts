import type { WorkingDay } from '../entities/WorkingDay';

export interface IWorkingDayRepository {
  getForToday(): Promise<WorkingDay>;
  save(day: WorkingDay): Promise<void>;
  // atomic decrement
  decrement(seconds: number): Promise<WorkingDay>;
  // reset to a new day or on first run of the day
  resetFor(dateISO: string, dailyBudgetSeconds: number): Promise<WorkingDay>;
}
