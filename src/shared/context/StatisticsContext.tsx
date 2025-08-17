/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useStatistics } from '../../application/useCases/useStatistics';
import type { Statistics } from '../../application/useCases/useStatistics';

interface StatisticsContextType {
  statistics: Statistics;
  loading: boolean;
  loadStatistics: () => Promise<void>;
  calculateEarnings: (hourlyRate: number) => number;
  formatTime: (milliseconds: number) => string;
  getEarningsByProject: (projectId: string) => number;
  refreshStatistics: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const StatisticsContext = createContext<StatisticsContextType | null>(null);

export const useStatisticsContext = () => {
  const context = useContext(StatisticsContext);
  if (!context) {
    throw new Error('useStatisticsContext must be used within a StatisticsProvider');
  }
  return context;
};

interface StatisticsProviderProps {
  children: React.ReactNode;
  refreshInterval?: number; // Optional refresh interval in milliseconds
}

export const StatisticsProvider: React.FC<StatisticsProviderProps> = ({ 
  children, 
  refreshInterval = 5000 // Default to 5 seconds
}) => {
  const { 
    statistics: rawStatistics, 
    loading,
    loadStatistics,
    calculateEarnings,
    formatTime,
    getEarningsByProject
  } = useStatistics();

  const [statistics, setStatistics] = useState<Statistics>(rawStatistics);

  // Wrap the refresh function to update local state
  const refreshStatistics = useCallback(async () => {
    await loadStatistics();
  }, [loadStatistics]);

  // Set up automatic refresh interval
  useEffect(() => {
    const intervalId = setInterval(refreshStatistics, refreshInterval);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [refreshInterval, refreshStatistics]);

  // Update local state when raw statistics change
  useEffect(() => {
    setStatistics(rawStatistics);
  }, [rawStatistics]);

  const value = {
    statistics,
    loading,
    loadStatistics,
    calculateEarnings,
    formatTime,
    getEarningsByProject,
    refreshStatistics,
    isLoading: loading,
    error: null
  };

  return (
    <StatisticsContext.Provider value={value}>
      {children}
    </StatisticsContext.Provider>
  );
};