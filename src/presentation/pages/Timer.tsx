import React from 'react';
import { useStartTimer } from '../../application/useCases/useStartTimer';
import { UnifiedTimerDemo } from '../components/Common/UnifiedTimerDemo';

export const Timer: React.FC = () => {
  const { remaining, penalty, isRunning, start, stop } = useStartTimer();

  const format = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-6">Timer</h1>
      
      {/* Legacy Timer (for comparison) */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Legacy Timer</h2>
        <div className="text-6xl font-mono mb-4">{format(remaining)}</div>
        {penalty > 0 && (
          <div className="text-red-500 font-bold mb-2">
            Penalty: {penalty} sec
          </div>
        )}
        <div className="space-x-4">
          {!isRunning ? (
            <button onClick={start} className="px-6 py-2 bg-green-600 text-white rounded-lg">Start</button>
          ) : (
            <button onClick={stop} className="px-6 py-2 bg-red-600 text-white rounded-lg">Stop</button>
          )}
        </div>
      </div>

      {/* New Unified Timer Demo */}
      <UnifiedTimerDemo />
    </div>
  );
}; 