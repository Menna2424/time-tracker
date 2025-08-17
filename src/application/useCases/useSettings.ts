import { useState, useEffect, useCallback } from 'react';
import { LocalStorageSettingsRepository } from '../../infrastructure/storage/SettingsRepository';
import type { Settings } from '../../domain/types';

// Move repository outside component to prevent recreation on every render
const settingsRepository = new LocalStorageSettingsRepository();

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    theme: { mode: 'light' },
    notifications: true,
    autoStart: false,
    hourlyRate: 50,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await settingsRepository.get();
        setSettings(savedSettings);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []); // Remove settingsRepository from dependency array

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    try {
      const updatedSettings = await settingsRepository.update(newSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const savedSettings = await settingsRepository.get();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  return {
    settings,
    loading,
    updateSettings,
    loadSettings
  };
}; 