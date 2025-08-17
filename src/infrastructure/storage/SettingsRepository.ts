import type { Settings } from '../../domain/types';

const SETTINGS_STORAGE_KEY = 'app_settings';

const DEFAULT_SETTINGS: Settings = {
  theme: { mode: 'light' },
  notifications: true,
  autoStart: false,
  hourlyRate: 50, // Default hourly rate
};

export interface ISettingsRepository {
  get(): Promise<Settings>;
  update(settings: Partial<Settings>): Promise<Settings>;
  reset(): Promise<Settings>;
}

export class LocalStorageSettingsRepository implements ISettingsRepository {
  private loadSettings(): Settings {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!stored) {
        // Initialize with default settings on first load
        this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all fields are present
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      };
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
      // Return defaults if localStorage is corrupted
      return DEFAULT_SETTINGS;
    }
  }

  private saveSettings(settings: Settings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
      throw new Error('Failed to persist settings data');
    }
  }

  async get(): Promise<Settings> {
    return this.loadSettings();
  }

  async update(partialSettings: Partial<Settings>): Promise<Settings> {
    const currentSettings = this.loadSettings();
    const updatedSettings: Settings = {
      ...currentSettings,
      ...partialSettings,
    };
    
    this.saveSettings(updatedSettings);
    return updatedSettings;
  }

  async reset(): Promise<Settings> {
    this.saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
}

// In-memory implementation for testing/fallback
export class InMemorySettingsRepository implements ISettingsRepository {
  private settings: Settings = { ...DEFAULT_SETTINGS };

  async get(): Promise<Settings> {
    return { ...this.settings };
  }

  async update(partialSettings: Partial<Settings>): Promise<Settings> {
    this.settings = {
      ...this.settings,
      ...partialSettings,
    };
    return { ...this.settings };
  }

  async reset(): Promise<Settings> {
    this.settings = { ...DEFAULT_SETTINGS };
    return { ...this.settings };
  }
}