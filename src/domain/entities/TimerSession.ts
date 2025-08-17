export type TimerMode = 'countup' | 'countdown';

export interface TimerSession {
  id: string;
  taskId: string;
  projectId: string;
  memberId: string;     // who worked this session (active user)
  mode: TimerMode;
  targetSeconds?: number;
  startedAt: number;    // epoch ms - renamed from startedAt
  endedAt?: number;     // epoch ms (if running, undefined) - renamed from endedAt
  elapsedSeconds?: number; // persisted when stopped (derived = (endedAt - startedAt)/1000)
  earnedCents?: number;
}