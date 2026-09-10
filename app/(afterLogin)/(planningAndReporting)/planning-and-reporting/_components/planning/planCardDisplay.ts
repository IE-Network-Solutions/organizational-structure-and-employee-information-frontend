import type { ViewMode } from '../types';

export type PlanCardDisplayMode = 'compact' | 'team' | 'full';

export function resolvePlanCardDisplayMode(
  selectedAssigneeCount: number,
  viewMode: ViewMode = 'planning',
): PlanCardDisplayMode {
  void viewMode;
  if (selectedAssigneeCount <= 1) return 'compact';
  return 'team';
}

/** Display name for team-mode card headers (keep full name; strip trailing “'s Plan”). */
export function planCardAssigneeLabel(ownerName?: string): string {
  const n = String(ownerName || '').trim();
  if (!n) return 'Unknown';
  if (/^my plan$/i.test(n)) return 'You';
  const possessive = n.match(/^(.+?)'s Plan$/i);
  if (possessive?.[1]) return possessive[1].trim();
  return n;
}

export function planCardAssigneeRole(role?: string): string | null {
  const r = String(role || '').trim();
  if (!r || /^n\/a$/i.test(r) || /^plan$/i.test(r)) return null;
  return r;
}
