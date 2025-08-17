import type { ITimerRepository } from '../../domain/repositories/ITimerRepository';
import type { TimerSession, TimerMode } from '../../domain/entities/TimerSession';
import { eventBus } from '../events/EventBus';

const SESSIONS_KEY = 'tt.sessions';

function readSessions(): TimerSession[] {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); }
  catch { return []; }
}

function writeSessions(sessions: TimerSession[]) {
  console.debug('[SESSION SAVE] writing sessions:', sessions);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  eventBus.emit('sessions:changed');
}

export class LocalTimerRepository implements ITimerRepository {
  async getActiveSession(taskId: string): Promise<TimerSession | null> {
    const sessions = readSessions();
    return sessions.find(s => s.taskId === taskId && !s.endedAt) ?? null;
  }

  async getActiveSessions(): Promise<TimerSession[]> {
    const sessions = readSessions();
    return sessions.filter(s => !s.endedAt);
  }

  async getAllSessions(): Promise<TimerSession[]> {
    return readSessions();
  }
  
  async startSession(taskId: string, projectId: string, memberId: string, mode: TimerMode, targetSeconds?: number): Promise<TimerSession> {
    console.debug('[START_SESSION] creating session for task:', taskId, 'member:', memberId, 'mode:', mode, 'targetSeconds:', targetSeconds);
    
    const sessions = readSessions();
    const newSession: TimerSession = {
      id: Date.now().toString(),
      taskId,
      projectId,
      memberId,
      mode,
      targetSeconds,
      startedAt: Date.now(),
    };
    sessions.push(newSession);
    writeSessions(sessions);
    
    console.debug('[START_SESSION] created session:', newSession);
    return newSession;
  }
  
  async endSession(sessionId: string, endedAt: number, elapsedSeconds: number, earnedCents: number): Promise<void> {
    console.debug('[END_SESSION] ending session:', sessionId, 'endedAt:', endedAt, 'elapsedSeconds:', elapsedSeconds, 'earnedCents:', earnedCents);
    
    const sessions = readSessions();
    const i = sessions.findIndex(s => s.id === sessionId);
    if (i < 0) {
      console.debug('[END_SESSION] session not found:', sessionId);
      return;
    }
    
    const session = sessions[i];
    if (session.endedAt) {
      console.debug('[END_SESSION] session already ended:', sessionId);
      return; // idempotent
    }
    
    session.endedAt = endedAt;
    session.elapsedSeconds = elapsedSeconds;
    session.earnedCents = earnedCents;
    sessions[i] = session;
    writeSessions(sessions);
    
    console.debug('[END_SESSION] session ended:', session);
  }
}
