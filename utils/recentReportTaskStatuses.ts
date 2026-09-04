import { create } from 'zustand';

export type ReportTaskStatusOverride = {
  status?: string;
  actualValue?: number;
  customReason?: string;
  isAchieved?: boolean;
};

type RecentReportTaskStatusesState = {
  /** reportId → planTaskId → override */
  byReport: Record<string, Record<string, ReportTaskStatusOverride>>;
  remember: (
    reportId: string,
    statusByPlanTaskId: Record<string, ReportTaskStatusOverride>,
  ) => void;
  getOverride: (
    reportId: string | number | null | undefined,
    planTaskId: string | number | null | undefined,
  ) => ReportTaskStatusOverride | null;
  /** Drop overrides that now match the API row (or clear whole report). */
  reconcile: (
    reportId: string,
    apiTasks: Array<{
      planTaskId?: string | number | null;
      status?: string | null;
      isAchieved?: boolean | null;
      actualValue?: number | null;
    }>,
  ) => void;
  clearReport: (reportId: string) => void;
  clear: () => void;
};

function normalizeStatus(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function isDoneStatus(raw: unknown): boolean {
  const s = normalizeStatus(raw);
  return (
    s === 'done' || s === 'completed' || s === 'complete' || s === 'achieved'
  );
}

const SESSION_KEY = 'okr-recent-report-task-statuses';

function readSessionByReport(): Record<
  string,
  Record<string, ReportTaskStatusOverride>
> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeSessionByReport(
  byReport: Record<string, Record<string, ReportTaskStatusOverride>>,
): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(byReport));
  } catch {
    // quota / private mode
  }
}

function actualValuesMatch(
  override: ReportTaskStatusOverride,
  api: { actualValue?: number | null },
): boolean {
  if (override.actualValue === undefined) return true;
  if (api.actualValue == null) return false;
  const apiNum = Number(api.actualValue);
  if (!Number.isFinite(apiNum) || apiNum < 0) return false;
  return apiNum === Number(override.actualValue);
}

function statusesMatch(
  override: ReportTaskStatusOverride,
  api: {
    status?: string | null;
    isAchieved?: boolean | null;
    actualValue?: number | null;
  },
): boolean {
  // Never treat a missing override status as "matched" — that cleared sticky
  // patches and left the progress bar on the old Done value.
  if (override.status == null || String(override.status).trim() === '') {
    return false;
  }
  const wantDone = isDoneStatus(override.status);
  if (wantDone) {
    const doneMatched = isDoneStatus(api.status) || api.isAchieved === true;
    return doneMatched && actualValuesMatch(override, api);
  }
  const apiStatus = normalizeStatus(api.status);
  const statusMatched =
    apiStatus === 'not' ||
    apiStatus === 'failed' ||
    apiStatus === 'not_done' ||
    apiStatus === 'unachieved' ||
    api.isAchieved === false;
  return statusMatched && actualValuesMatch(override, api);
}

export const useRecentReportTaskStatuses =
  create<RecentReportTaskStatusesState>()((set, get) => ({
    byReport: readSessionByReport(),
    remember: (reportId, statusByPlanTaskId) => {
      if (!reportId || !statusByPlanTaskId) return;
      const nextForReport = {
        ...(readSessionByReport()[reportId] ?? {}),
        ...(get().byReport[reportId] ?? {}),
      };
      let changed = false;
      for (const [planTaskId, patch] of Object.entries(statusByPlanTaskId)) {
        if (!planTaskId) continue;
        const status = patch.status;
        if (status == null || String(status).trim() === '') continue;
        const normalized = normalizeStatus(status);
        const isDone = isDoneStatus(status);
        const isNot =
          normalized === 'not' ||
          normalized === 'failed' ||
          normalized === 'not_done' ||
          normalized === 'unachieved';
        nextForReport[planTaskId] = {
          ...nextForReport[planTaskId],
          ...patch,
          status: String(status),
          isAchieved: isDone ? true : isNot ? false : patch.isAchieved,
        };
        changed = true;
      }
      if (!changed) return;
      const byReport = {
        ...get().byReport,
        [reportId]: nextForReport,
      };
      set({ byReport });
      writeSessionByReport(byReport);
    },
    getOverride: (reportId, planTaskId) => {
      if (reportId == null || planTaskId == null) return null;
      const reportKey = String(reportId);
      const taskKey = String(planTaskId);
      return (
        get().byReport[reportKey]?.[taskKey] ??
        readSessionByReport()[reportKey]?.[taskKey] ??
        null
      );
    },
    reconcile: (reportId, apiTasks) => {
      const current = {
        ...(readSessionByReport()[reportId] ?? {}),
        ...(get().byReport[reportId] ?? {}),
      };
      if (Object.keys(current).length === 0) return;
      const next = { ...current };
      let changed = false;
      for (const task of apiTasks) {
        const id = task?.planTaskId != null ? String(task.planTaskId) : '';
        if (!id || !next[id]) continue;
        if (statusesMatch(next[id], task)) {
          delete next[id];
          changed = true;
        }
      }
      if (!changed) return;
      const byReport = { ...get().byReport, ...readSessionByReport() };
      if (Object.keys(next).length === 0) {
        delete byReport[reportId];
      } else {
        byReport[reportId] = next;
      }
      set({ byReport });
      writeSessionByReport(byReport);
    },
    clearReport: (reportId) => {
      const byReport = { ...get().byReport, ...readSessionByReport() };
      if (!byReport[reportId]) return;
      delete byReport[reportId];
      set({ byReport });
      writeSessionByReport(byReport);
    },
    clear: () => {
      set({ byReport: {} });
      writeSessionByReport({});
    },
  }));

export function rememberReportTaskStatuses(
  reportId: string,
  statusByPlanTaskId: Record<string, ReportTaskStatusOverride>,
): void {
  useRecentReportTaskStatuses.getState().remember(reportId, statusByPlanTaskId);
}

/** Candidate ids that may key a report/plan task row. */
export function reportTaskLookupIds(task: any): string[] {
  if (!task) return [];
  return [task.planTaskId, task.planTask?.id, task.taskId, task.id]
    .filter((id) => id != null && String(id).length > 0)
    .map((id) => String(id));
}

/**
 * Build status patches from Ant form values + Zustand selectedStatuses.
 * Prefer selectedStatuses for Done/Not — form values often omit status.
 */
export function buildReportTaskStatusPatches(
  values: Record<string, any> | null | undefined,
  selectedStatuses?: Record<string, string | undefined> | null,
): Record<string, ReportTaskStatusOverride> {
  const out: Record<string, ReportTaskStatusOverride> = {};

  if (selectedStatuses) {
    for (const [taskId, status] of Object.entries(selectedStatuses)) {
      if (!taskId || status == null || String(status).trim() === '') continue;
      out[String(taskId)] = { status: String(status) };
    }
  }

  if (values) {
    for (const [taskId, raw] of Object.entries(values)) {
      if (!taskId || raw == null) continue;
      const key = String(taskId);
      if (typeof raw === 'string') {
        if (raw.trim()) out[key] = { ...out[key], status: raw };
        continue;
      }
      if (typeof raw === 'object') {
        const status =
          raw.status != null && String(raw.status).trim() !== ''
            ? String(raw.status)
            : out[key]?.status;
        out[key] = {
          ...out[key],
          ...(status ? { status } : {}),
          actualValue:
            raw.actualValue != null
              ? Number(raw.actualValue)
              : out[key]?.actualValue,
          customReason:
            raw.customReason != null
              ? raw.customReason
              : out[key]?.customReason,
        };
      }
    }
  }

  // Drop entries with no usable status — they would no-op the cache patch.
  for (const key of Object.keys(out)) {
    if (out[key].status == null || String(out[key].status).trim() === '') {
      delete out[key];
    }
  }

  return out;
}

export function applyReportTaskStatusOverride(
  reportId: string | number | null | undefined,
  task: any,
): any {
  if (!task) return task;
  const store = useRecentReportTaskStatuses.getState();
  let override: ReportTaskStatusOverride | null = null;
  for (const id of reportTaskLookupIds(task)) {
    override = store.getOverride(reportId, id);
    if (override?.status) break;
  }
  if (!override?.status) return task;
  return {
    ...task,
    status: override.status,
    isAchieved:
      override.isAchieved !== undefined
        ? override.isAchieved
        : isDoneStatus(override.status),
    actualValue:
      override.actualValue !== undefined
        ? override.actualValue
        : task.actualValue,
    customReason:
      override.customReason !== undefined
        ? override.customReason
        : task.customReason,
  };
}

export function reconcileReportTaskStatusOverrides(
  reportId: string,
  apiTasks: Array<{
    planTaskId?: string | number | null;
    status?: string | null;
    isAchieved?: boolean | null;
    actualValue?: number | null;
  }>,
): void {
  useRecentReportTaskStatuses.getState().reconcile(reportId, apiTasks);
}
