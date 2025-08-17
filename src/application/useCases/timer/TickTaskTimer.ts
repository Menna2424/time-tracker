import type { ITasksRepository } from '../../../domain/repositories/ITasksRepository';
import type { ITimerRepository } from '../../../domain/repositories/ITimerRepository';

export class TickTaskTimer {
  constructor(
    private tasksRepository: ITasksRepository,
    private timerRepository: ITimerRepository,
    private defaultHourlyRateCents: number = 5000
  ) {}

  async execute(taskId: string): Promise<void> {
    console.debug('[TICK_TIMER] ticking timer for task:', taskId);
    
    // Read active session
    const session = await this.timerRepository.getActiveSession(taskId);
    if (!session) {
      console.debug('[TICK_TIMER] no active session found for task:', taskId);
      return;
    }

    // Get task
    const task = await this.tasksRepository.getById(taskId);
    if (!task || !task.currentStartAt) {
      console.debug('[TICK_TIMER] task not found or no start time:', taskId);
      return;
    }

    const now = Date.now();
    const elapsedMs = now - task.currentStartAt;
    let elapsedSeconds = Math.floor(elapsedMs / 1000);

    // Cap to targetSeconds if countdown mode
    if (session.mode === 'countdown' && session.targetSeconds) {
      elapsedSeconds = Math.min(elapsedSeconds, session.targetSeconds);
    }

    // Calculate earnings
    const rateCents = task.hourlyRateCents || this.defaultHourlyRateCents;
    const currentCents = Math.round((elapsedSeconds / 3600) * rateCents);

    // Update task.currentTimeSeconds & task.currentCents only
    // Do NOT modify totalTimeSeconds/earningsCents here
    const updatedTask = {
      ...task,
      currentTimeSeconds: elapsedSeconds,
      currentCents: currentCents,
    };

    await this.tasksRepository.save(updatedTask);
    console.debug('[TICK_TIMER] updated current values. elapsedSeconds:', elapsedSeconds, 'currentCents:', currentCents);
    console.debug('[TICK_TIMER] updated task:', updatedTask);
  }
}