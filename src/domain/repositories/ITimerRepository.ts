import type { TimerSession, TimerMode } from '../entities/TimerSession';

export interface ITimerRepository {
  getActiveSession(taskId: string): Promise<TimerSession | null>;
  getActiveSessions(): Promise<TimerSession[]>;
  getAllSessions(): Promise<TimerSession[]>;
  startSession(taskId: string, projectId: string, memberId: string, mode: TimerMode, targetSeconds?: number): Promise<TimerSession>;
  endSession(sessionId: string, endedAt: number, elapsedSeconds: number, earnedCents: number): Promise<void>;
}