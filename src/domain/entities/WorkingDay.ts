export interface WorkingDay {
  // ISO date for the "work day" bucket (e.g. '2025-08-13')
  day: string;
  // Daily budget in seconds (e.g., 8h = 28800)
  dailyBudgetSeconds: number;
  // Remaining daily seconds (countdown)
  remainingSeconds: number;
  // Optional bookkeeping
  startedAt?: number; // epoch ms when last started running; pause clears it
}
