import type { ViewMode } from '../types';

export type PlanCardDisplayMode = 'compact' | 'team' | 'full';

export function resolvePlanCardDisplayMode(
  selectedAssigneeCount: number,
  viewMode: ViewMode = 'planning',
): PlanCardDisplayMode {
  if (viewMode === 'reporting') return 'full';
  if (selectedAssigneeCount <= 1) return 'compact';
  return 'team';
}

/** One-line assignee label for team-mode cards and dividers. */
export function planCardAssigneeLabel(ownerName?: string): string {
  const n = String(ownerName || '').trim();
  if (!n) return 'Unknown';
  if (/^my plan$/i.test(n)) return 'You';
  const possessive = n.match(/^(.+?)'s Plan$/i);
  if (possessive?.[1]) return possessive[1].trim();
  return n;
}
