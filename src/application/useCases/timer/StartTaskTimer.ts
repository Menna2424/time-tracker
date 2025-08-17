import type { ITasksRepository } from '../../../domain/repositories/ITasksRepository';
import type { ITimerRepository } from '../../../domain/repositories/ITimerRepository';
import type { TimerSession, TimerMode } from '../../../domain/entities/TimerSession';

export class StartTaskTimer {
  constructor(
    private tasksRepository: ITasksRepository,
    private timerRepository: ITimerRepository
  ) {}

  async execute({ taskId, memberId, mode, targetSeconds }: { taskId: string; memberId: string; mode: TimerMode; targetSeconds?: number }): Promise<TimerSession> {
    console.debug('[START_TIMER] starting timer for task:', taskId, 'mode:', mode, 'targetSeconds:', targetSeconds);
    
    // Check if there's already an active session (idempotent)
    const existingSession = await this.timerRepository.getActiveSession(taskId);
    if (existingSession) {
      console.debug('[START_TIMER] active session already exists:', existingSession);
      return existingSession;
    }

    // Get task and prepare for timer start
    const task = await this.tasksRepository.getById(taskId);
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    // Get projectId from task
    const projectId = task.projectId;

    // Set task.currentStartAt = now; currentTimeSeconds = 0; currentCents = 0
    // Initialize countdown if task has estimated time
    const now = Date.now();
    const updatedTask = {
      ...task,
      currentStartAt: now,
      currentTimeSeconds: 0,
      currentCents: 0,
      isRunning: true,
      // Initialize countdown state if estimated time exists
      ...(task.estimatedMinutes ? {
        // If countdownRemainingSec is undefined, initialize to full estimated time
        countdownRemainingSec: task.countdownRemainingSec !== undefined ? task.countdownRemainingSec : task.estimatedMinutes * 60,
        countdownStartedAt: now,
      } : {
        // Clear countdown state if no estimated time
        countdownRemainingSec: undefined,
        countdownStartedAt: undefined,
      }),
    };

    // Start session via ITimerRepository
    const session = await this.timerRepository.startSession(taskId, projectId, memberId, mode, targetSeconds);
    console.debug('[START_TIMER] session created:', session);
    
    // Save task (do NOT touch totals)
    await this.tasksRepository.save(updatedTask);
    console.debug('[START_TIMER] task saved:', updatedTask);

    console.debug('[START_TIMER] timer started successfully. Session:', session);
    
    // Debug localStorage state
    console.debug('[START_TIMER] tt.sessions', localStorage.getItem('tt.sessions'));
    console.debug('[START_TIMER] tt.tasks', localStorage.getItem('tt.tasks'));
    
    return session;
  }
}