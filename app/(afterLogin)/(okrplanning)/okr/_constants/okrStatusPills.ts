/** Matches backend `KeyResultDeadlineFilter` — only sent when a pill is selected. */
export type KeyResultDeadlineFilter =
  | 'due_soon'
  | 'not_started'
  | 'on_progress'
  | 'completed'
  | 'overdue';

const PILL_ID_TO_API: Record<string, KeyResultDeadlineFilter> = {
  'due-soon': 'due_soon',
  'not-started': 'not_started',
  'on-progress': 'on_progress',
  completed: 'completed',
  overdue: 'overdue',
};

export function toKeyResultDeadlineFilter(
  pillId: string | null,
): KeyResultDeadlineFilter | undefined {
  if (!pillId) return undefined;
  return PILL_ID_TO_API[pillId];
}

export const OKR_STATUS_PILLS = [
  { id: 'due-soon', label: 'Due Soon' },
  { id: 'not-started', label: 'Not Started' },
  { id: 'on-progress', label: 'On progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'overdue', label: 'Overdue' },
] as const;
