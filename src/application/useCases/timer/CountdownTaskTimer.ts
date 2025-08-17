import type { Task } from '../../../domain/entities/Task';
import type { ITasksRepository } from '../../../domain/repositories/ITasksRepository';

export interface CountdownUpdateResult {
  task: Task;
  shouldStop: boolean;
  isExpired: boolean;
  remainingSeconds: number;
  progressPercentage: number;
}

export class CountdownTaskTimer {
  constructor(
    private taskRepository: ITasksRepository
  ) {}

  /**
   * Calculate countdown state for a task with estimated time
   */
  async calculateCountdownState(taskId: string, sessionStartTime: number): Promise<CountdownUpdateResult | null> {
    const task = await this.taskRepository.getById(taskId);
    if (!task || !task.estimatedMinutes) {
      return null;
    }

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - sessionStartTime) / 1000);
    const estimatedSeconds = task.estimatedMinutes * 60;
    const remainingSeconds = Math.max(0, estimatedSeconds - elapsedSeconds);
    const progressPercentage = Math.min(100, Math.floor((elapsedSeconds / estimatedSeconds) * 100));
    const isExpired = remainingSeconds === 0;

    // Update task with new countdown state
    const updatedTask: Task = {
      ...task,
      countdownRemainingSec: remainingSeconds
    };

    // Persist the updated countdown state
    await this.taskRepository.save(updatedTask);

    return {
      task: updatedTask,
      shouldStop: isExpired,
      isExpired,
      remainingSeconds,
      progressPercentage
    };
  }

  /**
   * Initialize countdown for a task when timer starts
   */
  async initializeCountdown(taskId: string): Promise<Task | null> {
    const task = await this.taskRepository.getById(taskId);
    if (!task || !task.estimatedMinutes) {
      return task;
    }

    const estimatedSeconds = task.estimatedMinutes * 60;
    
    // Initialize countdown state
    const updatedTask: Task = {
      ...task,
      countdownRemainingSec: estimatedSeconds,
      countdownStartedAt: Date.now()
    };

    await this.taskRepository.save(updatedTask);
    return updatedTask;
  }

  /**
   * Reset countdown state when timer stops
   */
  async resetCountdown(taskId: string): Promise<Task | null> {
    const task = await this.taskRepository.getById(taskId);
    if (!task || !task.estimatedMinutes) {
      return task;
    }

    // Reset countdown to initial state
    const updatedTask: Task = {
      ...task,
      countdownRemainingSec: undefined,
      countdownStartedAt: undefined
    };

    await this.taskRepository.save(updatedTask);
    return updatedTask;
  }

  /**
   * Format time for display (mm:ss)
   */
  formatRemainingTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Check if task has countdown enabled
   */
  hasCountdown(task: Task): boolean {
    return Boolean(task.estimatedMinutes && task.estimatedMinutes > 0);
  }
}
