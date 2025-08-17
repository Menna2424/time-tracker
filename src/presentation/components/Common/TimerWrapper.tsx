import React from 'react';
import { useLocation } from 'react-router-dom';
import { WorkdayTimer } from '../WorkdayTimer/WorkdayTimer';

interface TimerWrapperProps {
  position?: 'bottom-right' | 'bottom-center';
}

export const TimerWrapper: React.FC<TimerWrapperProps> = ({ position = 'bottom-right' }) => {
  const location = useLocation();
  
  // Hide timer on auth-related paths
  const hideOnPaths = ['/auth'];
  
  if (hideOnPaths.includes(location.pathname)) {
    return null;
  }

  return <WorkdayTimer position={position} />;
}; 