import type { IWorkingDayRepository } from '../../../domain/repositories/IWorkingDayRepository';

export class EnsureWorkingDayForToday {
  constructor(private workingDayRepository: IWorkingDayRepository) {}

  async execute(input: { dailyBudgetSeconds: number }) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    try {
      const existingDay = await this.workingDayRepository.getForToday();
      
      // If day exists and matches today, return it
      if (existingDay && existingDay.day === today) {
        return existingDay;
      }
      
      // Otherwise, create/reset for today
      return await this.workingDayRepository.resetFor(today, input.dailyBudgetSeconds);
    } catch {
      // If getForToday fails, create a new day
      return await this.workingDayRepository.resetFor(today, input.dailyBudgetSeconds);
    }
  }
}
