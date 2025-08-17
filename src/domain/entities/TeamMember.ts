export interface TeamMember {
  id: string;
  name: string;
  email: string;
  hourlyRate: number;
  totalHours?: number;
  totalEarnings?: number;
  activeTasks?: number;
} 