// Domain types for the application

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
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
  projectId?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  isRunning: boolean;
}

export interface TimerSession {
  id: string;
  duration: number; // in seconds
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'penalty';
  penaltySeconds?: number;
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
} 