import type { TaskSession } from '../../domain/types';

const TASK_SESSIONS_KEY = 'task_sessions';

export interface ITaskSessionRepository {
  // Session management
  createSession(taskId: string): Promise<TaskSession>;
  updateSession(sessionId: string, data: Partial<TaskSession>): Promise<TaskSession>;
  completeSession(sessionId: string): Promise<TaskSession>;
  getSessionById(sessionId: string): Promise<TaskSession | null>;
  getSessionsByTaskId(taskId: string): Promise<TaskSession[]>;
}

export class LocalStorageTaskSessionRepository implements ITaskSessionRepository {
  private loadSessions(): TaskSession[] {
    try {
      const stored = localStorage.getItem(TASK_SESSIONS_KEY);
      if (!stored) return [];
      
      return JSON.parse(stored).map((session: Record<string, unknown>) => ({
        ...session,
        startTime: new Date(session.startTime as string),
        endTime: session.endTime ? new Date(session.endTime as string) : undefined,
      }));
    } catch (error) {
      console.error('Failed to load task sessions:', error);
      return [];
    }
  }

  private saveSessions(sessions: TaskSession[]): void {
    try {
      localStorage.setItem(TASK_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save task sessions:', error);
    }
  }

  async createSession(taskId: string): Promise<TaskSession> {
    const sessions = this.loadSessions();
    const newSession: TaskSession = {
      id: Date.now().toString(),
      taskId,
      startTime: new Date(),
      duration: 0,
      earnedAmount: 0,
      status: 'running',
    };
    
    sessions.push(newSession);
    this.saveSessions(sessions);
    return newSession;
  }

  async updateSession(sessionId: string, data: Partial<TaskSession>): Promise<TaskSession> {
    const sessions = this.loadSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index === -1) throw new Error(`Session ${sessionId} not found`);

    const updatedSession = {
      ...sessions[index],
      ...data,
    };
    sessions[index] = updatedSession;
    this.saveSessions(sessions);
    return updatedSession;
  }

  async completeSession(sessionId: string): Promise<TaskSession> {
    const sessions = this.loadSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

    const completedSession = await this.updateSession(sessionId, {
      endTime,
      duration,
      status: 'completed',
    });

    return completedSession;
  }

  async getSessionById(sessionId: string): Promise<TaskSession | null> {
    const sessions = this.loadSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  async getSessionsByTaskId(taskId: string): Promise<TaskSession[]> {
    const sessions = this.loadSessions();
    return sessions.filter(s => s.taskId === taskId);
  }
}