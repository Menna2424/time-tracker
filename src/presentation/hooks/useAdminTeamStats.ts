import { useCallback, useEffect, useMemo, useState } from 'react';
import { eventBus } from '../../infrastructure/events/EventBus';
import { MockTeamRepository } from '../../infrastructure/repositories/mockTeamRepository';
import { LocalTasksRepository } from '../../infrastructure/storage/LocalTasksRepository';
import { LocalTimerRepository } from '../../infrastructure/repositories/LocalTimerRepository';
import { computeMemberStats, migrateTaskData, migrateSessionData, getCurrentUserId } from '../../application/selectors/adminStats';
import type { TeamMember } from '../../domain/entities/TeamMember';
import type { Task } from '../../domain/entities/Task';
import type { TimerSession } from '../../domain/entities/TimerSession';
import { useAuthContext } from '../../shared/context/AuthContext';

export function useAdminTeamStats() {
  const { user } = useAuthContext();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [now, setNow] = useState(Date.now()); // tick for live updates
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const teamRepository = useMemo(() => new MockTeamRepository(), []);
  const taskRepository = useMemo(() => new LocalTasksRepository(), []);
  const timerRepository = useMemo(() => new LocalTimerRepository(), []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [membersData, tasksData, sessionsData] = await Promise.all([
        teamRepository.getTeamMembers(),
        taskRepository.getAll(),
        timerRepository.getAllSessions(),
      ]);

      // Migrate data to ensure required fields exist
      const migratedTasks = tasksData.map(migrateTaskData);
      const currentUserId = user?.id || getCurrentUserId();
      const migratedSessions = sessionsData.map(session => 
        migrateSessionData(session, currentUserId)
      );

      setMembers(membersData);
      setTasks(migratedTasks);
      setSessions(migratedSessions);
    } catch (err) {
      console.error('Error loading admin team stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load team statistics');
    } finally {
      setLoading(false);
    }
  }, [teamRepository, taskRepository, timerRepository, user?.id]);

  useEffect(() => {
    load();
    
    // Set up event listeners for reactive updates
    const unsubscribeMembers = eventBus.on('members:changed', load);
    const unsubscribeTasks = eventBus.on('tasks:changed', load);
    const unsubscribeSessions = eventBus.on('sessions:changed', load);
    
    // Live ticking so running sessions/earnings reflect every second
    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      unsubscribeMembers();
      unsubscribeTasks();
      unsubscribeSessions();
      clearInterval(intervalId);
    };
  }, [load, user?.id]);

  const stats = useMemo(
    () => computeMemberStats(members, tasks, sessions, now),
    [members, tasks, sessions, now]
  );

  return { 
    stats, 
    loading, 
    error,
    refresh: load 
  };
}
