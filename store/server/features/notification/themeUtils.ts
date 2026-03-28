import type { NotificationType } from './interface';

/** Parse theme from route query string (e.g. ?theme=green) */
function parseThemeFromRoute(routeStr: string): string | null {
  const s = (routeStr ?? '').trim();
  if (!s) return null;
  const [, searchPart] = s.includes('?') ? s.split('?') : ['', ''];
  const params = new URLSearchParams(searchPart || '');
  return params.get('theme') || null;
}

/** Theme-based border/background/icon classes for notification items */
export const NOTIFICATION_THEME_CLASSES: Record<
  string,
  { border: string; hover: string; bg: string; icon: string }
> = {
  green: {
    border: 'border-green-500',
    hover: 'hover:bg-green-50/50',
    bg: 'bg-green-100',
    icon: 'text-green-600',
  },
  blue: {
    border: 'border-blue-500',
    hover: 'hover:bg-blue-50/50',
    bg: 'bg-blue-100',
    icon: 'text-blue-600',
  },
  purple: {
    border: 'border-purple-500',
    hover: 'hover:bg-purple-50/50',
    bg: 'bg-purple-100',
    icon: 'text-purple-600',
  },
  orange: {
    border: 'border-orange-500',
    hover: 'hover:bg-orange-50/50',
    bg: 'bg-orange-100',
    icon: 'text-orange-600',
  },
  red: {
    border: 'border-red-500',
    hover: 'hover:bg-red-50/50',
    bg: 'bg-red-100',
    icon: 'text-red-600',
  },
  teal: {
    border: 'border-teal-500',
    hover: 'hover:bg-teal-50/50',
    bg: 'bg-teal-100',
    icon: 'text-teal-600',
  },
  indigo: {
    border: 'border-indigo-500',
    hover: 'hover:bg-indigo-50/50',
    bg: 'bg-indigo-100',
    icon: 'text-indigo-600',
  },
};

const DEFAULT_THEME = {
  border: 'border-transparent',
  hover: 'hover:bg-gray-50',
  bg: 'bg-gray-100',
  icon: 'text-gray-500',
};

/** Get theme-based classes for a notification (uses item.theme or theme from route) */
export function getNotificationThemeClasses(item: NotificationType): {
  border: string;
  hover: string;
  bg: string;
  icon: string;
} {
  const theme = item.theme ?? parseThemeFromRoute(item.route ?? '');
  const key = (theme ?? '').toLowerCase();
  if (key && NOTIFICATION_THEME_CLASSES[key]) {
    return NOTIFICATION_THEME_CLASSES[key];
  }
  const text = `${item.title ?? ''} ${item.body ?? ''}`.toLowerCase();
  if (text.includes('incentive')) return NOTIFICATION_THEME_CLASSES.green;
  return DEFAULT_THEME;
}
