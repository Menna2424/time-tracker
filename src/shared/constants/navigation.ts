import type { NavigationItem } from '../../domain/types';

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: '📊'
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    icon: '📁'
  },
  {
    id: 'timer',
    label: 'Timer',
    path: '/timer',
    icon: '⏱️'
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: '⚙️'
  }
]; 