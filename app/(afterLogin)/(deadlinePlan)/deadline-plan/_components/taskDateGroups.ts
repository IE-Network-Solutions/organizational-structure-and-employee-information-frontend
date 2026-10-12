import dayjs, { Dayjs } from 'dayjs';
import { DeadlineTask } from '@/store/server/features/deadlinePlan/interface';
import { DATE_FORMAT, isTaskFinished, resolveMetricKind } from './utils';

export interface TaskDateGroup {
  id: string;
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  tasks: DeadlineTask[];
}

/** Group parent tasks for display only; subtasks stay with their parent. */
export function groupTasksByDate(
  tasks: DeadlineTask[],
  today: Dayjs,
  includeToday = true,
): TaskDateGroup[] {
  const groups = new Map<string, TaskDateGroup>();
  const todayKey = today.format(DATE_FORMAT);
  const addDateGroup = (id: string): TaskDateGroup => {
    const date = dayjs(id);
    const isToday = id === todayKey;
    const isTomorrow = date.isSame(today.add(1, 'day'), 'day');
    const relative = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : null;
    const label = date.isValid()
      ? [
          date.format(date.year() === today.year() ? 'MMM D' : 'MMM D, YYYY'),
          relative,
          date.format('dddd'),
        ]
          .filter(Boolean)
          .join(' · ')
      : 'No date';
    const group = { id, label, isOverdue: false, isToday, tasks: [] };
    groups.set(id, group);
    return group;
  };

  if (includeToday) addDateGroup(todayKey);

  for (const task of tasks) {
    const date = dayjs(task.deadline);
    const overdue = !isTaskFinished(task) && date.isBefore(today, 'day');
    const id = overdue
      ? 'overdue'
      : date.isValid()
        ? date.format(DATE_FORMAT)
        : 'undated';
    let group = groups.get(id);
    if (!group) {
      group = overdue
        ? { id, label: 'Overdue', isOverdue: true, isToday: false, tasks: [] }
        : addDateGroup(id);
      groups.set(id, group);
    }
    group.tasks.push(task);
  }

  return Array.from(groups.values()).sort((a, b) => {
    if (a.isOverdue) return -1;
    if (b.isOverdue) return 1;
    if (a.id === 'undated') return 1;
    if (b.id === 'undated') return -1;
    return a.id.localeCompare(b.id);
  });
}

export function taskCardMetric(task: DeadlineTask): string {
  if (!task.keyResult) return 'General task';
  const target =
    resolveMetricKind(task.keyResult) === 'numeric' && task.targetValue != null
      ? `${task.targetValue.toLocaleString()} ${task.keyResult.metricType?.name ?? ''}`.trim()
      : null;
  return [task.keyResult.title, target].filter(Boolean).join(' · ');
}
