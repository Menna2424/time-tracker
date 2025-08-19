import { LocalTasksRepository } from '../../infrastructure/storage/LocalTasksRepository';
import { LocalTaskAssignmentRepository } from '../../infrastructure/repositories/LocalTaskAssignmentRepository';
import { ListMemberActiveTasks } from '../useCases/ListMemberActiveTasks';
import { CountMemberActiveTasks } from '../useCases/CountMemberActiveTasks';
import { LocalTimerRepository } from '../../infrastructure/repositories/LocalTimerRepository';
import { LocalWorkingDayRepository } from '../../infrastructure/repositories/LocalWorkingDayRepository';
import { LocalStorageSettingsRepository } from '../../infrastructure/storage/SettingsRepository';
import { LocalAuthRepository } from '../../infrastructure/repositories/LocalAuthRepository';
import { LocalUserRepository } from '../../infrastructure/repositories/LocalUserRepository';
import { LocalOrganizationRepository } from '../../infrastructure/repositories/LocalOrganizationRepository';
import { StopTaskTimer } from '../useCases/timer/StopTaskTimer';
import { StartTaskTimer } from '../useCases/timer/StartTaskTimer';
import { TickTaskTimer } from '../useCases/timer/TickTaskTimer';
import { TickActiveWorkSecond } from '../useCases/timer/TickActiveWorkSecond';
import { WorkdayTimerService } from '../../domain/services/WorkdayTimerService';
import { EnsureWorkingDayForToday } from '../useCases/workingDay/EnsureWorkingDayForToday';
import { SignUp } from '../useCases/auth/SignUp';
import { getCurrentUserId } from '../selectors/adminStats';
import type { TimerMode } from '../../domain/entities/TimerSession';

// Get default rate from settings (convert dollars to cents)
const settingsRepo = new LocalStorageSettingsRepository();
const getDefaultHourlyRateCents = async (): Promise<number> => {
  try {
    const settings = await settingsRepo.get();
    return Math.round(settings.hourlyRate * 100); // Convert dollars to cents
  } catch (error) {
    console.warn('Failed to load settings, using default rate:', error);
    return 5000; // Default to $50.00/hr in cents
  }
};

const tasksRepo = new LocalTasksRepository();
const timerRepo = new LocalTimerRepository();
const assignmentRepo = new LocalTaskAssignmentRepository();
const workingDayRepo = new LocalWorkingDayRepository();

// Auth repositories
const authRepo = new LocalAuthRepository();
const userRepo = new LocalUserRepository();
const orgRepo = new LocalOrganizationRepository();

// Auth use cases
export const signUpUseCase = new SignUp(authRepo, userRepo, orgRepo);

// Create use cases with dynamic rate loading
export const createStopTaskTimer = async () => {
  const rate = await getDefaultHourlyRateCents();
  return new StopTaskTimer(tasksRepo, timerRepo, rate);
};

export const createTickTaskTimer = async () => {
  const rate = await getDefaultHourlyRateCents();
  return new TickTaskTimer(tasksRepo, timerRepo, rate);
};

// For backward compatibility, create instances with default rate
export const stopTaskTimer = new StopTaskTimer(tasksRepo, timerRepo, 5000);
export const startTaskTimer = new StartTaskTimer(tasksRepo, timerRepo);
export const tickTaskTimer = new TickTaskTimer(tasksRepo, timerRepo, 5000);

// Working day and global timer use cases
export const ensureWorkingDayForToday = new EnsureWorkingDayForToday(workingDayRepo);
export const tickActiveWorkSecond = new TickActiveWorkSecond(workingDayRepo, timerRepo, tasksRepo, stopTaskTimer);
export const workdayTimerService = new WorkdayTimerService(workingDayRepo, timerRepo);

// Helper function to start timer with memberId
export const startTimerWithMemberId = async (taskId: string, memberId?: string, mode: TimerMode = 'countup', targetSeconds?: number) => {
  const actualMemberId = memberId || getCurrentUserId();
  return startTaskTimer.execute({ taskId, memberId: actualMemberId, mode, targetSeconds });
};

// Container object for easy access
export const container = {
  tasksRepo,
  timerRepo,
  assignmentRepo,
  workingDayRepo,
  authRepo,
  userRepo,
  orgRepo,
  stopTaskTimer,
  startTaskTimer,
  tickTaskTimer,
  ensureWorkingDayForToday,
  tickActiveWorkSecond,
  workdayTimerService,
  startTimerWithMemberId,
  signUpUseCase,
  listMemberActiveTasks: new ListMemberActiveTasks(tasksRepo, assignmentRepo),
  countMemberActiveTasks: new CountMemberActiveTasks(tasksRepo, assignmentRepo),
};
