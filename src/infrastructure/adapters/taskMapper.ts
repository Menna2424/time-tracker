import type { Task } from '../../domain/entities/Task';

// Legacy task structure that might exist in localStorage
interface LegacyTask {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status?: 'pending' | 'active' | 'completed';
  
  // Legacy fields that need to be migrated
  timeSpent?: number;
  timeSpentSeconds?: number;
  earnings?: number; // in dollars
  currentEarnings?: number; // in dollars
  current?: number;
  currentSeconds?: number;
  hourlyRate?: number; // in dollars
  hourlyRateCents?: number;
  
  // Unified fields
  totalTimeSeconds?: number;
  earningsCents?: number;
  currentTimeSeconds?: number;
  currentCents?: number;
  currentStartAt?: number;
  
  // Countdown timer fields (legacy and new)
  estimatedTimeMinutes?: number; // legacy field name
  estimatedMinutes?: number;     // new field name
  countdownRemainingSec?: number;
  countdownStartedAt?: number | null;
  isRunning?: boolean;
  
  // Other legacy fields
  countdown?: {
    initialDuration: number;
    remaining: number;
    isActive: boolean;
    startedAt?: Date;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
  completedAt?: string | Date;
  assignedMemberIds?: string[];
}

export class TaskMapper {
  /**
   * Normalizes legacy task data to the unified schema
   */
  static fromStorage(raw: unknown): Task {
    console.debug('[TASK_MAPPER] normalizing legacy task:', raw);
    
    const legacy = raw as LegacyTask;
    
    // Migrate time fields to totalTimeSeconds
    let totalTimeSeconds = legacy.totalTimeSeconds || 0;
    if (legacy.timeSpentSeconds && !totalTimeSeconds) {
      totalTimeSeconds = legacy.timeSpentSeconds;
    }
    if (legacy.timeSpent && !totalTimeSeconds) {
      // timeSpent might be in various formats, assume seconds if number
      totalTimeSeconds = typeof legacy.timeSpent === 'number' ? legacy.timeSpent : 0;
    }
    
    // Migrate earnings fields to earningsCents
    let earningsCents = legacy.earningsCents || 0;
    if (legacy.earnings && !earningsCents) {
      earningsCents = Math.round(legacy.earnings * 100); // convert dollars to cents
    }
    
    // Migrate current time fields
    let currentTimeSeconds = legacy.currentTimeSeconds || 0;
    if (legacy.currentSeconds && !currentTimeSeconds) {
      currentTimeSeconds = legacy.currentSeconds;
    }
    if (legacy.current && !currentTimeSeconds) {
      currentTimeSeconds = typeof legacy.current === 'number' ? legacy.current : 0;
    }
    
    // Migrate current earnings fields
    let currentCents = legacy.currentCents || 0;
    if (legacy.currentEarnings && !currentCents) {
      currentCents = Math.round(legacy.currentEarnings * 100); // convert dollars to cents
    }
    
    // Migrate hourly rate
    let hourlyRateCents = legacy.hourlyRateCents;
    if (legacy.hourlyRate && !hourlyRateCents) {
      hourlyRateCents = Math.round(legacy.hourlyRate * 100); // convert dollars to cents
    }
    
    // Migrate countdown fields
    let estimatedMinutes = legacy.estimatedMinutes;
    if (legacy.estimatedTimeMinutes && !estimatedMinutes) {
      estimatedMinutes = legacy.estimatedTimeMinutes; // migrate from legacy field name
    }
    
    // Initialize countdown state if task has estimated time but no countdown fields
    let countdownRemainingSec = legacy.countdownRemainingSec;
    let countdownStartedAt = legacy.countdownStartedAt;
    
    if (estimatedMinutes && countdownRemainingSec === undefined) {
      // Migration: if task has estimatedMinutes but no countdown fields, initialize them
      countdownRemainingSec = estimatedMinutes * 60;
      countdownStartedAt = null;
    }
    
    const normalized: Task = {
      id: legacy.id,
      projectId: legacy.projectId,
      title: legacy.title,
      description: legacy.description,
      totalTimeSeconds,
      earningsCents,
      currentTimeSeconds,
      currentCents,
      hourlyRateCents,
      currentStartAt: legacy.currentStartAt,
      status: legacy.status || 'pending',
      timeSpentSec: legacy.timeSpent ?? totalTimeSeconds, // Migration: use totalTimeSeconds if missing
      assignedMemberIds: legacy.assignedMemberIds || [], // Migration: default to empty array
      countdown: legacy.countdown,
      // Countdown fields
      estimatedMinutes,
      countdownRemainingSec,
      countdownStartedAt,
      isRunning: legacy.isRunning,
      createdAt: legacy.createdAt ? new Date(legacy.createdAt) : new Date(),
      updatedAt: legacy.updatedAt ? new Date(legacy.updatedAt) : new Date(),
    };
    
    console.debug('[TASK_MAPPER] normalized task:', normalized);
    return normalized;
  }
  
  /**
   * Prepares task data for storage
   */
  static toStorage(task: Task): Record<string, unknown> {
    // For the unified schema, we can store as-is
    // but ensure we don't store undefined values
    return {
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      totalTimeSeconds: task.totalTimeSeconds || 0,
      earningsCents: task.earningsCents || 0,
      currentTimeSeconds: task.currentTimeSeconds || 0,
      currentCents: task.currentCents || 0,
      status: task.status || 'pending',
      countdown: task.countdown,
      createdAt: task.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: task.updatedAt?.toISOString() || new Date().toISOString(),
      ...(task.hourlyRateCents && { hourlyRateCents: task.hourlyRateCents }),
      ...(task.currentStartAt && { currentStartAt: task.currentStartAt }),
      // Countdown fields - store even if undefined to maintain complete schema
      ...(task.estimatedMinutes !== undefined && { estimatedMinutes: task.estimatedMinutes }),
      ...(task.countdownRemainingSec !== undefined && { countdownRemainingSec: task.countdownRemainingSec }),
      ...(task.countdownStartedAt !== undefined && { countdownStartedAt: task.countdownStartedAt }),
      ...(task.isRunning !== undefined && { isRunning: task.isRunning }),
      assignedMemberIds: task.assignedMemberIds || [], // Always store assignedMemberIds
    };
  }
}