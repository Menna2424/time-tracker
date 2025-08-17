export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: 'pending' | 'active' | 'completed';
  timeSpentSec: number;         // accumulated persisted time
  assignedMemberIds: string[];  // assignment list

  totalTimeSeconds: number;   // persisted total (same as timeSpentSec)
  earningsCents: number;      // persisted total

  currentTimeSeconds: number; // live while running
  currentCents: number;       // live while running
  currentStartAt?: number;    // epoch ms when Start was pressed
  hourlyRateCents?: number;   // if missing, use settings default

  // Countdown properties for estimated time feature
  estimatedMinutes?: number;          // optional user input
  countdownRemainingSec?: number;     // remaining seconds
  countdownStartedAt?: number | null; // epoch ms, null if paused/ended
  isRunning?: boolean;
  
  // Optional properties for UI compatibility
  description?: string;
  countdown?: {
    initialDuration: number;
    remaining: number;
    isActive: boolean;
    startedAt?: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
