export type DeadlineKind = 'daily' | 'week' | 'month';

export interface DeadlineTask {
  id: string;
  title: string;
  start: string;
  deadline: string;
  spanDays: number;
  kind: DeadlineKind;
  parentId: string | null;
  done: boolean;
  keyResultTitle?: string;
  planningPeriodId?: string;
  sourceStatus?: string;
}

export const DATE_FORMAT = 'YYYY-MM-DD';
