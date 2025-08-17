import type { IWorkingDayRepository } from '../../../domain/repositories/IWorkingDayRepository';
import type { ITimerRepository } from '../../../domain/repositories/ITimerRepository';
import type { ITasksRepository } from '../../../domain/repositories/ITasksRepository';
import { StopTaskTimer } from './StopTaskTimer';
import { NotificationService } from '../../../infrastructure/notifications/NotificationService';

export class TickActiveWorkSecond {
  private notificationService: NotificationService;

  constructor(
    private workingDayRepository: IWorkingDayRepository,
    private timerRepository: ITimerRepository,
    private tasksRepository: ITasksRepository,
    private stopTaskTimer: StopTaskTimer
  ) {
    this.notificationService = NotificationService.getInstance();
  }

  async execute() {
    // Get all active sessions
    const activeSessions = await this.timerRepository.getActiveSessions();
    
    // If no active sessions, don't decrement working day
    if (activeSessions.length === 0) {
      console.debug('[TICK] No active sessions, skipping workday decrement');
      return;
    }

    // Get current working day
    const workingDay = await this.workingDayRepository.getForToday();
    
    // Check if working day is already at 0
    if (workingDay.remainingSeconds <= 0) {
      console.debug('[TICK] Workday already at 0, auto-stopping all sessions');
      // Auto-stop all active sessions once
      for (const session of activeSessions) {
        await this.stopTaskTimer.execute({ sessionId: session.id, taskId: session.taskId });
      }
      return;
    }

    // Decrement working day by exactly 1 second (but not below 0)
    const updatedWorkingDay = await this.workingDayRepository.decrement(1);
    console.debug('[TICK] Decremented workday by 1s, remaining:', updatedWorkingDay.remainingSeconds);

    // Update each active task session
    const now = Date.now();
    
    for (const session of activeSessions) {
      const task = await this.tasksRepository.getById(session.taskId);
      if (!task) {
        console.warn('[TICK] Task not found for session:', session.taskId);
        continue;
      }

      // Calculate elapsed time since session started
      const elapsedMs = now - session.startedAt;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      
      // For countdown mode, cap elapsed time at target
      let effectiveElapsed = elapsedSeconds;
      if (session.mode === 'countdown' && session.targetSeconds) {
        effectiveElapsed = Math.min(elapsedSeconds, session.targetSeconds);
        
        // If countdown reached target, stop this session
        if (elapsedSeconds >= session.targetSeconds) {
          console.debug('[TICK] Countdown target reached, stopping session:', session.taskId);
          await this.stopTaskTimer.execute({ sessionId: session.id, taskId: session.taskId });
          continue;
        }
      }

      // Update countdown state if task has estimated time
      let countdownRemainingSec = task.countdownRemainingSec;
      if (task.estimatedMinutes && task.countdownStartedAt) {
        const elapsedSinceCountdownStart = Math.floor((now - task.countdownStartedAt) / 1000);
        const totalEstimatedSeconds = task.estimatedMinutes * 60;
        countdownRemainingSec = Math.max(0, totalEstimatedSeconds - elapsedSinceCountdownStart);
        
        // If countdown reached 0, auto-stop the task
        if (countdownRemainingSec === 0) {
          console.debug('[TICK] Estimated time countdown expired, auto-stopping task:', session.taskId);
          
          // Show notification before stopping
          this.notificationService.showNotification(
            `Estimated time reached for ${task.title}`,
            {
              body: 'Your task timer has been automatically stopped.',
              tag: 'countdown-expired',
              requireInteraction: false
            }
          );
          
          await this.stopTaskTimer.execute({ sessionId: session.id, taskId: session.taskId });
          continue;
        }
      }

      // Update task current values (do NOT touch persisted totals here)
      const hourlyRateCents = task.hourlyRateCents || 5000; // Default $50/hour in cents
      const updatedTask = {
        ...task,
        currentTimeSeconds: effectiveElapsed,
        currentCents: Math.round((effectiveElapsed / 3600) * hourlyRateCents),
        countdownRemainingSec,
      };

      await this.tasksRepository.save(updatedTask);
    }

    // If working day just reached 0, auto-stop all remaining active sessions
    if (updatedWorkingDay.remainingSeconds === 0 && activeSessions.length > 0) {
      console.debug('[TICK] Workday reached 0, auto-stopping all remaining sessions');
      for (const session of activeSessions) {
        await this.stopTaskTimer.execute({ sessionId: session.id, taskId: session.taskId });
      }
    }
  }
}
