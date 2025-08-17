import type { Task } from '../../domain/entities/Task';
import type { TeamMember } from '../../domain/entities/TeamMember';
import type { TimerSession } from '../../domain/entities/TimerSession';

export type MemberStats = {
  member: TeamMember;
  totalSeconds: number;
  totalHours: number;
  activeTasks: number;
  totalEarnings: number;
};

export function computeMemberStats(
  members: TeamMember[],
  tasks: Task[],
  sessions: TimerSession[],
  now: number = Date.now()
): MemberStats[] {
  // Group running seconds per member from live sessions
  const runningSecByMember = new Map<string, number>();
  for (const s of sessions) {
    if (!s.memberId) continue;
    let sec = s.elapsedSeconds || 0;
    if (!s.endedAt) { // still running
      sec += Math.max(0, Math.floor((now - s.startedAt) / 1000));
    }
    runningSecByMember.set(s.memberId, (runningSecByMember.get(s.memberId) || 0) + sec);
  }

  // Persisted task totals per member (from assigned tasks)
  const timePersistedByMember = new Map<string, number>();
  const activeCountByMember = new Map<string, number>();
  for (const t of tasks) {
    const assignees = t.assignedMemberIds ?? [];
    for (const mId of assignees) {
      timePersistedByMember.set(mId, (timePersistedByMember.get(mId) || 0) + (t.timeSpentSec || t.totalTimeSeconds || 0));
      if (t.status === 'active') {
        activeCountByMember.set(mId, (activeCountByMember.get(mId) || 0) + 1);
      }
    }
  }

  return members.map(member => {
    const persisted = timePersistedByMember.get(member.id) || 0;
    const running   = runningSecByMember.get(member.id) || 0;
    const totalSec  = persisted + running;
    const totalHours = totalSec / 3600;
    const earnings = totalHours * member.hourlyRate;
    return {
      member,
      totalSeconds: totalSec,
      totalHours,
      activeTasks: activeCountByMember.get(member.id) || 0,
      totalEarnings: earnings,
    };
  });
}

// Helper function to migrate old data
export function migrateTaskData(task: Task): Task {
  return {
    ...task,
    assignedMemberIds: task.assignedMemberIds ?? [],
    timeSpentSec: task.timeSpentSec ?? task.totalTimeSeconds ?? 0,
    status: task.status ?? 'pending'
  };
}

// Helper function to migrate session data to add memberId
export function migrateSessionData(session: Partial<TimerSession> & { start?: number; end?: number; seconds?: number }, currentUserId: string): TimerSession {
  return {
    id: session.id ?? `migrated-${Date.now()}`,
    taskId: session.taskId ?? 'unknown-task',
    projectId: session.projectId ?? 'unknown-project',
    memberId: session.memberId ?? currentUserId, // Default to current user if missing
    mode: session.mode ?? 'countup',
    startedAt: session.startedAt ?? session.start ?? Date.now(),
    endedAt: session.endedAt ?? session.end,
    elapsedSeconds: session.elapsedSeconds ?? session.seconds ?? 0,
    targetSeconds: session.targetSeconds,
    earnedCents: session.earnedCents
  };
}

// Helper function to get current user ID from auth context or fallback
export function getCurrentUserId(): string {
  try {
    // Try to get from auth context or stored user
    const authData = localStorage.getItem('authUser');
    if (authData) {
      const user = JSON.parse(authData);
      return user.id || 'current-user';
    }
  } catch (error) {
    console.warn('Could not get current user ID:', error);
  }
  return 'current-user'; // Fallback ID
}
