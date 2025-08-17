import type { ITasksRepository } from '../../../domain/repositories/ITasksRepository';
import type { ITimerRepository } from '../../../domain/repositories/ITimerRepository';
import type { Task } from '../../../domain/entities/Task';

export class StopTaskTimer {
  constructor(
    private tasksRepository: ITasksRepository,
    private timerRepository: ITimerRepository,
    private defaultHourlyRateCents: number = 5000
  ) {}

  async execute(input: { sessionId: string; taskId: string } | string): Promise<Task> {
    // Support both old string interface and new object interface
    const taskId = typeof input === 'string' ? input : input.taskId;
    const sessionId = typeof input === 'string' ? undefined : input.sessionId;
    
    console.debug('[STOP_TIMER] stopping timer for task:', taskId);
    
    // Read active session & task
    const session = sessionId 
      ? await this.timerRepository.getActiveSessions().then(sessions => sessions.find(s => s.id === sessionId))
      : await this.timerRepository.getActiveSession(taskId);
    const task = await this.tasksRepository.getById(taskId);
    
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    if (!session) {
      console.debug('[STOP_TIMER] no active session found for task:', taskId);
      // Return task as-is if no session (idempotent)
      return task;
    }

    if (!task.currentStartAt) {
      console.debug('[STOP_TIMER] task has no start time, ending session only');
      await this.timerRepository.endSession(session.id, Date.now(), 0, 0);
      return task;
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
    const earnedCents = Math.round((elapsedSeconds / 3600) * rateCents);

    console.debug('[STOP_TIMER] calculated values. elapsedSeconds:', elapsedSeconds, 'earnedCents:', earnedCents);

    // End session (idempotent)
    await this.timerRepository.endSession(session.id, now, elapsedSeconds, earnedCents);

    // tasksRepo.applyStop(taskId, elapsedSeconds, earnedCents) 
    // adds deltas to totals AND zeroes current*, clears currentStartAt and countdown state
    const updatedTask = await this.tasksRepository.applyStop(taskId, elapsedSeconds, earnedCents);

    console.debug('[STOP_TIMER] timer stopped successfully. Updated task:', updatedTask);
    return updatedTask;
  }
}