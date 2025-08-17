/**
 * Safe formatting utilities that handle undefined/null values gracefully
 */

/**
 * Safely formats a number as currency, returning $0.00 for invalid values
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount == null || isNaN(amount) || !isFinite(amount)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

/**
 * Safely formats hours, supporting both decimal and hours:minutes format
 * @param hours - The hours to format
 * @param format - Format type: 'decimal' for 12.3h or 'hm' for 12h 18m
 * @returns Formatted hours string
 */
export const formatHours = (hours: number | undefined | null, format: 'decimal' | 'hm' = 'decimal'): string => {
  if (hours == null || isNaN(hours) || !isFinite(hours) || hours < 0) {
    return format === 'hm' ? '0h 0m' : '0.0h';
  }
  
  if (format === 'hm') {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (wholeHours === 0 && minutes === 0) {
      return '0h 0m';
    } else if (wholeHours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${wholeHours}h`;
    } else {
      return `${wholeHours}h ${minutes}m`;
    }
  }
  
  return `${hours.toFixed(1)}h`;
};

/**
 * Safely formats a number with a specific number of decimal places
 * @param value - The value to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted number string
 */
export const formatNumber = (value: number | undefined | null, decimals: number = 1): string => {
  if (value == null || isNaN(value) || !isFinite(value)) {
    return `0.${'0'.repeat(decimals)}`;
  }
  
  return value.toFixed(decimals);
};

/**
 * Formats time in seconds to MM:SS format
 * @param seconds - The seconds to format
 * @returns Formatted time string in MM:SS format
 */
export const formatTime = (seconds: number): string => {
  if (seconds == null || isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
    return '00:00';
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

/**
 * Formats money from cents to dollar format
 * @param cents - The cents to format
 * @returns Formatted money string
 */
export const formatMoney = (cents: number): string => {
  if (cents == null || isNaN(cents) || !isFinite(cents)) {
    return '$0.00';
  }
  
  return `$${(cents / 100).toFixed(2)}`;
};