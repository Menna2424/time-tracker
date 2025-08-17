import type { IWorkingDayRepository } from '../../domain/repositories/IWorkingDayRepository';
import type { WorkingDay } from '../../domain/entities/WorkingDay';

export class LocalWorkingDayRepository implements IWorkingDayRepository {
  private readonly storageKey = 'tt.workingDay';

  async getForToday(): Promise<WorkingDay> {
    const data = localStorage.getItem(this.storageKey);
    if (!data) {
      throw new Error('No working day found');
    }
    
    const workingDay: WorkingDay = JSON.parse(data);
    const today = new Date().toISOString().split('T')[0];
    
    // If stored day is not today, throw to trigger reset
    if (workingDay.day !== today) {
      throw new Error('Working day is not for today');
    }
    
    return workingDay;
  }

  async save(day: WorkingDay): Promise<void> {
    localStorage.setItem(this.storageKey, JSON.stringify(day));
  }

  async decrement(seconds: number): Promise<WorkingDay> {
    try {
      const workingDay = await this.getForToday();
      workingDay.remainingSeconds = Math.max(0, workingDay.remainingSeconds - seconds);
      await this.save(workingDay);
      return workingDay;
    } catch {
      // If no working day exists, create one with default 8-hour budget
      return await this.resetFor(new Date().toISOString().split('T')[0], 8 * 3600);
    }
  }

  async resetFor(dateISO: string, dailyBudgetSeconds: number): Promise<WorkingDay> {
    const workingDay: WorkingDay = {
      day: dateISO,
      dailyBudgetSeconds,
      remainingSeconds: dailyBudgetSeconds
    };
    await this.save(workingDay);
    return workingDay;
  }
}
