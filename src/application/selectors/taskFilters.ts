import type { Task } from '../../domain/entities/Task';

export function isTaskRunning(task: Task): boolean {
  // Normalize status to cover legacy strings
  const status = (task.status || 'pending').toLowerCase();
  const isActiveStatus = status === 'active' || status === 'running';

  const timerFlags = Boolean(
    (task as unknown as { timer?: { isRunning?: boolean } }).timer?.isRunning ||
    (task as unknown as { activeTimer?: { isRunning?: boolean } }).activeTimer?.isRunning ||
    (task as unknown as { currentTimer?: { isRunning?: boolean } }).currentTimer?.isRunning ||
    task.isRunning === true
  );

  if (!task || (!isActiveStatus && !timerFlags)) return false;

  // If any timer flag suggests running, trust it
  if (timerFlags) return true;

  // Fallback: treat status active as running when no timer structure
  return isActiveStatus;
}

export function isTaskAssignedToMember(task: Task, memberId: string, assignedTaskIds?: Set<string>): boolean {
  if (assignedTaskIds && assignedTaskIds.size > 0) {
    return assignedTaskIds.has(task.id);
  }
  return (task.assignedMemberIds || []).includes(memberId);
}


