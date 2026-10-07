import { create } from 'zustand';

export type ReportTaskStatusOverride = {
  status?: string;
  actualValue?: number;
  customReason?: string;
  isAchieved?: boolean;
  /** Used to update OKR progress when planTask nesting is thin in list cache. */
  keyResultId?: string;
};

type RecentReportTaskStatusesState = {
  /** reportId → planTaskId → override */
  byReport: Record<string, Record<string, ReportTaskStatusOverride>>;
  /**
   * planTaskId → last actualValue already applied into OKR currentValue caches.
   * Prevents double-subtracting on restamp / duplicate patch calls.
   */
  okrAppliedActual: Record<string, number>;
  remember: (
    reportId: string,
    statusByPlanTaskId: Record<string, ReportTaskStatusOverride>,
  ) => void;
  getOverride: (
    reportId: string | number | null | undefined,
    planTaskId: string | number | null | undefined,
  ) => ReportTaskStatusOverride | null;
  getOkrAppliedActual: (planTaskId: string) => number | undefined;
  markOkrActualApplied: (planTaskId: string, actualValue: number) => void;
  /** Drop overrides that now match the API row (or clear whole report). */
  reconcile: (
    reportId: string,
    apiTasks: Array<{
      planTaskId?: string | number | null;
      status?: string | null;
      isAchieved?: boolean | null;
      actualValue?: number | string | null;
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

function statusesMatch(
  override: ReportTaskStatusOverride,
  api: { status?: string | null; isAchieved?: boolean | null },
): boolean {
  // Never treat a missing override status as "matched" — that cleared sticky
  // patches and left the progress bar on the old Done value.
  if (override.status == null || String(override.status).trim() === '') {
    return false;
  }
  const wantDone = isDoneStatus(override.status);
  if (wantDone) {
    return isDoneStatus(api.status) || api.isAchieved === true;
  }
  const apiStatus = normalizeStatus(api.status);
  return (
    apiStatus === 'not' ||
    apiStatus === 'failed' ||
    apiStatus === 'not_done' ||
    apiStatus === 'unachieved' ||
    api.isAchieved === false
  );
}

function actualValuesMatch(
  override: ReportTaskStatusOverride,
  api: { actualValue?: number | string | null },
): boolean {
  // No sticky actual — status-only overrides can clear when status catches up.
  if (override.actualValue === undefined) return true;
  const want = Number(override.actualValue);
  const got = Number(api.actualValue ?? 0);
  if (!Number.isFinite(want)) return true;
  if (!Number.isFinite(got)) return false;
  return Math.abs(want - got) < 1e-9;
}

/** Clear sticky patch only when status AND actualValue have caught up. */
function overrideMatchesApi(
  override: ReportTaskStatusOverride,
  api: {
    status?: string | null;
    isAchieved?: boolean | null;
    actualValue?: number | string | null;
  },
): boolean {
  return statusesMatch(override, api) && actualValuesMatch(override, api);
}

export const useRecentReportTaskStatuses =
  create<RecentReportTaskStatusesState>()((set, get) => ({
    byReport: {},
    okrAppliedActual: {},
    remember: (reportId, statusByPlanTaskId) => {
      if (!reportId || !statusByPlanTaskId) return;
      const nextForReport = {
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
      set({
        byReport: {
          ...get().byReport,
          [reportId]: nextForReport,
        },
      });
    },
    getOverride: (reportId, planTaskId) => {
      if (reportId == null || planTaskId == null) return null;
      return get().byReport[String(reportId)]?.[String(planTaskId)] ?? null;
    },
    getOkrAppliedActual: (planTaskId) => {
      return get().okrAppliedActual[String(planTaskId)];
    },
    markOkrActualApplied: (planTaskId, actualValue) => {
      if (!planTaskId || !Number.isFinite(actualValue)) return;
      set({
        okrAppliedActual: {
          ...get().okrAppliedActual,
          [String(planTaskId)]: actualValue,
        },
      });
    },
    reconcile: (reportId, apiTasks) => {
      const current = get().byReport[reportId];
      if (!current) return;
      const next = { ...current };
      const nextOkrApplied = { ...get().okrAppliedActual };
      let changed = false;
      for (const task of apiTasks) {
        const id = task?.planTaskId != null ? String(task.planTaskId) : '';
        if (!id || !next[id]) continue;
        if (overrideMatchesApi(next[id], task)) {
          delete next[id];
          delete nextOkrApplied[id];
          changed = true;
        }
      }
      if (!changed) return;
      const byReport = { ...get().byReport };
      if (Object.keys(next).length === 0) {
        delete byReport[reportId];
      } else {
        byReport[reportId] = next;
      }
      set({ byReport, okrAppliedActual: nextOkrApplied });
    },
    clearReport: (reportId) => {
      const current = get().byReport[reportId];
      if (!current) return;
      const byReport = { ...get().byReport };
      delete byReport[reportId];
      const nextOkrApplied = { ...get().okrAppliedActual };
      for (const planTaskId of Object.keys(current)) {
        delete nextOkrApplied[planTaskId];
      }
      set({ byReport, okrAppliedActual: nextOkrApplied });
    },
    clear: () => set({ byReport: {}, okrAppliedActual: {} }),
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

/**
 * Attach keyResultId onto status patches by walking report/plan formatted tasks.
 * Ensures OKR progress sticky can resolve even when list-cache planTask is thin.
 */
export function attachKeyResultIdsToReportPatches(
  patches: Record<string, ReportTaskStatusOverride>,
  formattedData: any[] | null | undefined | false,
): Record<string, ReportTaskStatusOverride> {
  if (!patches || !formattedData || !Array.isArray(formattedData)) {
    return patches;
  }

  const krByTaskId: Record<string, string> = {};
  const visitTask = (task: any, keyResultId: unknown) => {
    if (!task || keyResultId == null || String(keyResultId) === '') return;
    const kr = String(keyResultId);
    for (const id of [
      task.taskId,
      task.id,
      task.planTaskId,
      task.planTask?.id,
    ]) {
      if (id != null && String(id) !== '') {
        krByTaskId[String(id)] = kr;
      }
    }
  };

  formattedData.forEach((objective: any) => {
    objective?.keyResults?.forEach((keyresult: any) => {
      const krId = keyresult?.id ?? keyresult?.keyResultId;
      keyresult?.milestones?.forEach((milestone: any) => {
        milestone?.tasks?.forEach((task: any) => visitTask(task, krId));
      });
      keyresult?.tasks?.forEach((task: any) => visitTask(task, krId));
    });
  });

  const next: Record<string, ReportTaskStatusOverride> = {};
  for (const [taskId, patch] of Object.entries(patches)) {
    next[taskId] = {
      ...patch,
      keyResultId: patch.keyResultId ?? krByTaskId[taskId],
    };
  }
  return next;
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
    actualValue?: number | string | null;
  }>,
): void {
  useRecentReportTaskStatuses.getState().reconcile(reportId, apiTasks);
}
