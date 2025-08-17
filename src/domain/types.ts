// Domain types for the application

import type { UserRole } from './entities/User';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  requiredRole?: UserRole;
}

export interface Theme {
  mode: 'light' | 'dark';
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Timer {
  id: string;
  taskId: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  isRunning: boolean;
}

// Updated TimerSession to match the goal requirements
export interface TimerSession {
  id: string;
  taskId: string;
  projectId: string;
  memberId: string;     // who worked this session (active user)
  start: number;        // epoch ms
  end?: number;         // epoch ms (if running, undefined)
  seconds: number;      // persisted when stopped (derived = (end - start)/1000)
  mode?: 'countup' | 'countdown';
  targetSeconds?: number;
  earnedCents?: number;
}

export interface TimerNotification {
  title: string;
  message: string;
  timestamp: Date;
}

export interface Settings {
  theme: Theme;
  notifications: boolean;
  autoStart: boolean;
  hourlyRate: number; // User's hourly rate in currency units
} 

// Enhanced Project interface with hourlyGoal
export interface ProjectEnhanced {
  id: string;
  name: string;
  description?: string;
  color?: string;
  hourlyGoal: number; // target hours for the project
  createdAt: Date;
  updatedAt: Date;
}

// Countdown timer configuration
export interface TaskCountdown {
  initialDuration: number; // in seconds
  remaining: number; // in seconds
  isActive: boolean;
  startedAt?: Date;
}

// Task Session entity
export interface TaskSession {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  earnedAmount: number;
  targetProgress?: {
    completed: number;
    total: number;
    percentage: number;
  };
  status: 'running' | 'completed' | 'paused';
}

// Enhanced Task entity with goal requirements
export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: 'pending' | 'active' | 'completed';
  timeSpentSec: number;         // accumulated persisted time
  assignedMemberIds: string[];  // assignment list
  description?: string;
  totalTimeSeconds: number; // accumulated total (same as timeSpentSec)
  earningsCents: number;    // accumulated total
  currentTimeSeconds: number; // live session time
  currentCents: number;       // live session money
  hourlyRateCents?: number;   // if undefined, fallback to settings default
  
  // Countdown timer fields for estimated time feature
  estimatedMinutes?: number;          // optional user input
  countdownRemainingSec?: number;     // remaining seconds
  countdownStartedAt?: number | null; // epoch ms, null if paused/ended
  isRunning?: boolean;
  
  countdown?: TaskCountdown; // optional countdown timer (legacy)
  createdAt: Date;
  updatedAt: Date;
  // Additional properties that were missing
  timeSpent?: number; // total time spent in seconds (legacy)
  earnings?: number; // total earnings (legacy)
  currentEarnings?: number; // current session earnings
  completedAt?: Date; // when the task was completed
}

// Project progress calculation helper
export interface ProjectProgress {
  projectId: string;
  totalTimeSpent: number; // in seconds
  hourlyGoal: number; // in hours
  progressPercentage: number;
  completedTasks: number;
  totalTasks: number;
}

export interface WorkdayTimer {
  totalSeconds: number;
  remainingSeconds: number;
  status: 'active' | 'paused' | 'completed';
  lastUpdated: Date;
  hasActiveTask: boolean; // Add this field
}

export interface WorkdayTimerRepository {
  save(timer: WorkdayTimer): Promise<void>;
  load(): Promise<WorkdayTimer | null>;
}

// Add other repository interfaces for reference
export interface IProjectRepository {
  getAll(): Promise<ProjectEnhanced[]>;
  getById(id: string): Promise<ProjectEnhanced | null>;
  create(project: Omit<ProjectEnhanced, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectEnhanced>;
  update(id: string, project: Partial<ProjectEnhanced>): Promise<ProjectEnhanced>;
  delete(id: string): Promise<void>;
  getProgress(projectId: string): Promise<ProjectProgress>;
}

export interface ITaskRepository {
  getAll(): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  getByProjectId(projectId: string): Promise<Task[]>;
  create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  update(id: string, task: Partial<Task>): Promise<Task>;
  delete(id: string): Promise<void>;
  updateTimeSpent(id: string, additionalTime: number): Promise<Task>;
  updateEarnings(id: string, earnings: number): Promise<Task>;
  updateCurrentEarnings(id: string, currentEarnings: number): Promise<Task>;
  updateTimeAndEarnings(id: string, additionalTime: number, earnings: number): Promise<Task>;
  // atomic update to avoid partial writes
  applyStop(taskId: string, deltaSeconds: number, deltaCents: number): Promise<Task>;
}

export interface ITimerRepository {
  getAll(): Promise<Timer[]>;
  getById(id: string): Promise<Timer | null>;
  getByTaskId(taskId: string): Promise<Timer[]>;
  save(timer: Timer): Promise<Timer>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  getCompletedTimers(): Promise<Timer[]>;
  getTotalTimeForTask(taskId: string): Promise<number>;
}

// TimerSession repository interface
export interface ITimerSessionRepository {
  getActiveSession(taskId: string): Promise<TimerSession | null>;
  createSession(taskId: string, projectId: string, mode: 'countup' | 'countdown', targetSeconds?: number): Promise<TimerSession>;
  endSession(sessionId: string, endedAt: number, elapsedSeconds: number, earnedCents: number): Promise<void>;
}

// Earnings calculation types
export interface EarningsCalculation {
  taskId: string;
  timeSpentHours: number;
  hourlyRate: number;
  earnings: number;
}

export interface EarningsStatistics {
  totalEarnings: number;
  dailyEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  tasksCompletedThisMonth: number;
}

export interface DateFilter {
  startDate: Date;
  endDate: Date;
  period: 'day' | 'week' | 'month';
}

export interface ISettingsRepository {
  get(): Promise<Settings>;
  update(settings: Partial<Settings>): Promise<Settings>;
  reset(): Promise<Settings>;
}

