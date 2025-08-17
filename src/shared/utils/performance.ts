import React from 'react';

// Performance monitoring utility for debugging re-renders

export const createPerformanceMonitor = (componentName: string) => {
  let renderCount = 0;
  let lastRenderTime = Date.now();

  return {
    logRender: (props?: Record<string, unknown>) => {
      renderCount++;
      const now = Date.now();
      const timeSinceLastRender = now - lastRenderTime;
      lastRenderTime = now;

      console.log(
        `[${componentName}] Render #${renderCount} (${timeSinceLastRender}ms since last)`,
        props ? 'Props:' : '',
        props || ''
      );

      // Warn if re-renders are happening too frequently
      if (timeSinceLastRender < 100) {
        console.warn(
          `[${componentName}] Frequent re-renders detected! ${timeSinceLastRender}ms since last render.`
        );
      }
    },

    getStats: () => ({
      renderCount,
      timeSinceLastRender: Date.now() - lastRenderTime
    })
  };
};

// Hook for monitoring component re-renders
export const useRenderMonitor = (componentName: string, props?: Record<string, unknown>) => {
  const monitor = React.useMemo(() => createPerformanceMonitor(componentName), [componentName]);
  
  React.useEffect(() => {
    monitor.logRender(props);
  });
};
