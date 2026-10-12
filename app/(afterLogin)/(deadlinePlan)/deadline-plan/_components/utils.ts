import dayjs, { Dayjs } from 'dayjs';
import {
  DeadlineKeyResult,
  DeadlineTask,
  DeadlineTaskPage,
} from '@/store/server/features/deadlinePlan/interface';
import { DeadlineDuration } from '@/store/uistate/features/deadlinePlan/useStore';

export const DATE_FORMAT = 'YYYY-MM-DD';
const HISTORY_DEFAULT_DAYS = 30;

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

/* ------------------------------- duration ------------------------------- */

export interface DurationRange {
  from?: string;
  to?: string;
  /** Carry unreported tasks whose deadline already passed into the view. */
  includeOverdue: boolean;
}

/** Date window sent to the API for a duration filter. Weeks run Mon–Sun. */
export function resolveDurationRange(
  duration: DeadlineDuration,
  today: Dayjs,
  historyRange?: [string, string] | null,
): DurationRange {
  // The date-grouped task list shows the full active schedule by default.
  // The existing API accepts an omitted window; overdue tasks still carry over.
  if (duration === 'upcoming') {
    return { includeOverdue: true };
  }

  if (duration === 'history') {
    if (historyRange) {
      return {
        from: historyRange[0],
        to: historyRange[1],
        includeOverdue: false,
      };
    }
    return {
      from: today.subtract(HISTORY_DEFAULT_DAYS, 'day').format(DATE_FORMAT),
      to: today.format(DATE_FORMAT),
      includeOverdue: false,
    };
  }

  if (duration === 'week') {
    const monday = today.subtract((today.day() + 6) % 7, 'day');
    return {
      from: monday.format(DATE_FORMAT),
      to: monday.add(6, 'day').format(DATE_FORMAT),
      includeOverdue: true,
    };
  }

  if (duration === 'month') {
    return {
      from: today.startOf('month').format(DATE_FORMAT),
      to: today.endOf('month').format(DATE_FORMAT),
      includeOverdue: true,
    };
  }

  return {
    from: today.format(DATE_FORMAT),
    to: today.format(DATE_FORMAT),
    includeOverdue: true,
  };
}

/* ------------------------------ task status ----------------------------- */

export function isTaskClosed(task: DeadlineTask): boolean {
  return task.approvalStatus === 'closed';
}

export function isTaskReported(task: DeadlineTask): boolean {
  return task.status === 'reported';
}

/** Finished tasks no longer count down to (or past) their deadline. */
export function isTaskFinished(task: DeadlineTask): boolean {
  return isTaskReported(task) || isTaskClosed(task);
}

export function resolveTaskStatus(task: DeadlineTask): {
  label: string;
  tone: Tone;
} {
  if (isTaskReported(task)) return { label: 'Reported', tone: 'success' };
  if (isTaskClosed(task)) return { label: 'Closed', tone: 'neutral' };
  if (task.isLocked) return { label: 'Locked', tone: 'neutral' };
  return { label: 'In progress', tone: 'info' };
}

export function resolveApproval(task: DeadlineTask): {
  label: string;
  tone: Tone;
} | null {
  if (task.approvalStatus === 'closed') {
    return { label: 'Closed', tone: 'success' };
  }
  if (task.approvalStatus === 'pending') {
    return { label: 'Pending', tone: 'warning' };
  }
  return null;
}

export function deadlineLabel(
  task: DeadlineTask,
  today: Dayjs,
): { text: string; tone: Tone } {
  const deadline = dayjs(task.deadline);
  if (isTaskFinished(task)) {
    return { text: deadline.format('MMM D, YYYY'), tone: 'neutral' };
  }

  const days = deadline.startOf('day').diff(today.startOf('day'), 'day');
  if (days === 0) return { text: 'Due today', tone: 'warning' };
  if (days === 1) return { text: 'Due tomorrow', tone: 'neutral' };
  if (days > 1) return { text: `Due in ${days} days`, tone: 'neutral' };
  const overdue = Math.abs(days);
  return {
    text: `Overdue by ${overdue} day${overdue === 1 ? '' : 's'}`,
    tone: 'danger',
  };
}

/* ------------------------------ permissions ----------------------------- */

export interface TaskViewer {
  userId: string;
  /** Ids the viewer manages directly. */
  subordinateIds: string[];
  /** Holds the approve/reject plan permission (manages anyone's tasks). */
  canManageAll: boolean;
}

export interface TaskPermissions {
  canEdit: boolean;
  canReport: boolean;
  canUndoReport: boolean;
  canLock: boolean;
  canUnlock: boolean;
  canApprove: boolean;
}

export function resolveTaskPermissions(
  task: DeadlineTask,
  viewer: TaskViewer,
): TaskPermissions {
  const isOwn = task.assigneeId === viewer.userId;
  const manages =
    !isOwn &&
    (viewer.canManageAll ||
      task.assignedById === viewer.userId ||
      viewer.subordinateIds.includes(task.assigneeId));
  const involved = isOwn || manages;
  const reported = isTaskReported(task);
  const closed = isTaskClosed(task);
  const open = !reported && !closed;

  return {
    canEdit: involved && open && !task.isLocked,
    canReport: involved && open,
    // Only a manager can reopen a task that has been closed.
    canUndoReport: (reported || closed) && (closed ? manages : involved),
    canLock: involved && open && !task.isLocked,
    // The assignee cannot lift a lock someone else placed.
    canUnlock:
      open &&
      task.isLocked &&
      (manages ||
        (isOwn && (!task.lockedById || task.lockedById === viewer.userId))),
    canApprove: manages && !closed,
  };
}

/* ------------------------------ key results ----------------------------- */

export type MetricKind = 'milestone' | 'achieve' | 'numeric';

export function resolveMetricKind(
  keyResult?: DeadlineKeyResult | null,
): MetricKind | null {
  const name = keyResult?.metricType?.name?.toLowerCase();
  if (!name) return null;
  if (name === 'milestone') return 'milestone';
  if (name === 'achieve') return 'achieve';
  return 'numeric';
}

export function progressPercent(value: unknown): number {
  const progress = Number(value);
  if (!Number.isFinite(progress)) return 0;
  return Math.max(0, Math.round(progress));
}

export function averageProgress(keyResults: DeadlineKeyResult[]): number {
  if (!keyResults.length) return 0;
  const total = keyResults.reduce(
    (sum, keyResult) => sum + progressPercent(keyResult.progress),
    0,
  );
  return Math.round(total / keyResults.length);
}

/* ------------------------------- employees ------------------------------ */

export function getEmployeeItems(employeeData: any): any[] {
  if (!employeeData) return [];
  if (Array.isArray(employeeData)) return employeeData;
  if (Array.isArray(employeeData.items)) return employeeData.items;
  if (Array.isArray(employeeData.data)) return employeeData.data;
  if (Array.isArray(employeeData.users)) return employeeData.users;
  return [];
}

export function getEmployeeName(employee: any): string {
  return [employee?.firstName, employee?.middleName, employee?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
}

export function getInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}

export function getEmployeeDepartment(employee: any): {
  id?: string;
  name?: string;
} {
  const department =
    employee?.employeeJobInformation?.[0]?.department ?? employee?.department;
  return {
    id:
      department?.id ??
      employee?.employeeJobInformation?.[0]?.departmentId ??
      employee?.departmentId,
    name: department?.name,
  };
}

export function getSubordinateIds(employees: any[], managerId: string) {
  if (!managerId) return [];
  return employees
    .filter(
      (employee) =>
        String(employee?.delegatedTo?.id || employee?.reportingTo?.id || '') ===
        String(managerId),
    )
    .map((employee) => String(employee.id))
    .filter(Boolean);
}

export function getDepartmentUserIds(
  departmentId: string,
  employees: any[],
  departments: any[] | undefined,
): string[] {
  const department = departments?.find((item) => item.id === departmentId);
  const fromDepartment = (department?.users ?? []).map((user: any) =>
    String(user.id),
  );
  const fromEmployees = employees
    .filter((employee) => getEmployeeDepartment(employee).id === departmentId)
    .map((employee) => String(employee.id));
  return Array.from(new Set([...fromDepartment, ...fromEmployees])).filter(
    Boolean,
  );
}

/* --------------------------------- misc --------------------------------- */

export function flattenTaskPages(
  pages: DeadlineTaskPage[] | undefined,
): DeadlineTask[] {
  return (pages ?? []).flatMap((page) => page?.items ?? []);
}

/** The signed-in user first, then everyone else in the order given. */
export function pinFirst(ids: string[], pinnedId: string): string[] {
  return ids.includes(pinnedId)
    ? [pinnedId, ...ids.filter((id) => id !== pinnedId)]
    : ids;
}
