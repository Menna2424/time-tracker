import type { Project, Timer, Settings } from '../../domain/types';

export class LocalStorageService {
  private static instance: LocalStorageService;

  private constructor() {}

  static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  // Projects
  getProjects(): Project[] {
    try {
      const data = localStorage.getItem('projects');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem('projects', JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  }

  // Timers
  getTimers(): Timer[] {
    try {
      const data = localStorage.getItem('timers');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading timers:', error);
      return [];
    }
  }

  saveTimers(timers: Timer[]): void {
    try {
      localStorage.setItem('timers', JSON.stringify(timers));
    } catch (error) {
      console.error('Error saving timers:', error);
    }
  }

  // Settings
  getSettings(): Settings {
    try {
      const data = localStorage.getItem('settings');
      return data ? JSON.parse(data) : {
        theme: { mode: 'light' },
        notifications: true,
        autoStart: false,
        hourlyRate: 50,
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      return {
        theme: { mode: 'light' },
        notifications: true,
        autoStart: false,
        hourlyRate: 50,
      };
    }
  }

  saveSettings(settings: Settings): void {
    try {
      localStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  // Clear all data
  clearAllData(): void {
    try {
      localStorage.removeItem('projects');
      localStorage.removeItem('timers');
      localStorage.removeItem('settings');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
} 