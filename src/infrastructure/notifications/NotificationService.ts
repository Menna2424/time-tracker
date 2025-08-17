export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Request permission for browser notifications
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * Show a browser notification
   */
  showNotification(title: string, options?: NotificationOptions): boolean {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notifications not permitted');
      return false;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return true;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return false;
    }
  }

  /**
   * Show countdown expiry notification
   */
  showCountdownExpiredNotification(taskTitle: string): void {
    const success = this.showNotification('Time\'s Up! ⏰', {
      body: `Estimated time for "${taskTitle}" has been reached.`,
      tag: 'countdown-expired',
      requireInteraction: true
    });

    // Fallback to alert if notification failed
    if (!success) {
      alert(`⏰ Time's Up!\n\nEstimated time for "${taskTitle}" has been reached.`);
    }
  }

  /**
   * Check if notifications are supported and permitted
   */
  isAvailable(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  /**
   * Get current notification permission status
   */
  getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }
}
