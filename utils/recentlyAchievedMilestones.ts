import { create } from 'zustand';

/**
 * Session memory of milestones the user just achieved (report / OKR update).
 * Used so the Plan & Report + pick menu can disable them immediately even when
 * API refetch still returns stale status.
 */
type RecentlyAchievedMilestonesState = {
  ids: ReadonlySet<string>;
  remember: (milestoneIds: Array<string | number | null | undefined>) => void;
  has: (milestoneId: string | number | null | undefined) => boolean;
  clear: () => void;
};

export const useRecentlyAchievedMilestones =
  create<RecentlyAchievedMilestonesState>((set, get) => ({
    ids: new Set(),
    remember: (milestoneIds) => {
      const next = new Set(get().ids);
      let changed = false;
      for (const id of milestoneIds) {
        if (id == null || id === '') continue;
        const key = String(id);
        if (!next.has(key)) {
          next.add(key);
          changed = true;
        }
      }
      if (changed) set({ ids: next });
    },
    has: (milestoneId) => {
      if (milestoneId == null || milestoneId === '') return false;
      return get().ids.has(String(milestoneId));
    },
    clear: () => set({ ids: new Set() }),
  }));

export function rememberAchievedMilestones(
  milestoneIds: Array<string | number | null | undefined>,
): void {
  useRecentlyAchievedMilestones.getState().remember(milestoneIds);
}

export function isRecentlyAchievedMilestone(
  milestoneId: string | number | null | undefined,
): boolean {
  return useRecentlyAchievedMilestones.getState().has(milestoneId);
}

function resolveTaskReportStatus(
  taskId: string | number | null | undefined,
  selectedStatuses?: Record<string, string | undefined> | null,
  formValues?: Record<string, any> | null,
): string {
  if (taskId == null || taskId === '') return '';
  const key = String(taskId);
  const fromStore = selectedStatuses?.[key];
  if (fromStore) return String(fromStore);
  const raw = formValues?.[key];
  if (raw == null) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object' && raw.status != null) return String(raw.status);
  return '';
}

function isAchieveMkTask(task: any): boolean {
  return !!(
    task?.achieveMK ||
    task?.planTask?.achieveMK ||
    task?.mkAsATask ||
    task?.planTask?.mkAsATask
  );
}

function taskMilestoneId(task: any): string | null {
  const mid =
    task?.milestone?.id ??
    task?.milestoneId ??
    task?.planTask?.milestone?.id ??
    task?.planTask?.milestoneId ??
    null;
  if (mid == null || mid === '') return null;
  return String(mid);
}

function eachKeyResult(formattedData: any[], visit: (kr: any) => void): void {
  formattedData.forEach((objective: any) => {
    if (Array.isArray(objective?.keyResults)) {
      objective.keyResults.forEach(visit);
      return;
    }
    // Flat KR-shaped node (some edit-report groupings)
    if (
      Array.isArray(objective?.milestones) ||
      Array.isArray(objective?.tasks)
    ) {
      visit(objective);
    }
  });
}

/**
 * Milestone IDs completed via Done report rows (achieveMK / milestone-outcome).
 * Accepts Zustand selectedStatuses and/or Ant form values keyed by planTaskId.
 */
export function collectAchievedMilestoneIdsFromReport(
  formattedData: any[] | null | undefined,
  selectedStatuses?: Record<string, string | undefined> | null,
  formValues?: Record<string, any> | null,
): string[] {
  if (!Array.isArray(formattedData)) return [];
  const ids = new Set<string>();

  const isDone = (task: any) => {
    const taskId = task?.taskId ?? task?.id ?? task?.planTaskId;
    return (
      resolveTaskReportStatus(taskId, selectedStatuses, formValues) === 'Done'
    );
  };

  eachKeyResult(formattedData, (keyresult) => {
    // KR-level tasks that target a milestone outcome
    (keyresult?.tasks ?? []).forEach((task: any) => {
      if (!isDone(task) || !isAchieveMkTask(task)) return;
      const mid = taskMilestoneId(task);
      if (mid) ids.add(mid);
    });

    (keyresult?.milestones ?? []).forEach((milestone: any) => {
      const mid = milestone?.id != null ? String(milestone.id) : null;
      if (!mid) return;
      const tasks = milestone?.tasks ?? [];
      const achieved = tasks.some(
        (task: any) =>
          isDone(task) &&
          (isAchieveMkTask(task) ||
            String(taskMilestoneId(task) ?? '') === mid),
      );
      if (achieved) ids.add(mid);
    });
  });

  return Array.from(ids);
}

/** planTaskId → milestoneId for achieveMK / linked milestone outcome tasks. */
export function buildPlanTaskMilestoneMap(
  formattedData: any[] | null | undefined,
): Record<string, string> {
  const map: Record<string, string> = {};
  if (!Array.isArray(formattedData)) return map;

  eachKeyResult(formattedData, (keyresult) => {
    (keyresult?.tasks ?? []).forEach((task: any) => {
      if (!isAchieveMkTask(task)) return;
      const taskId = task?.taskId ?? task?.id ?? task?.planTaskId;
      const mid = taskMilestoneId(task);
      if (taskId != null && mid) map[String(taskId)] = mid;
    });
    (keyresult?.milestones ?? []).forEach((milestone: any) => {
      const mid = milestone?.id != null ? String(milestone.id) : null;
      if (!mid) return;
      (milestone?.tasks ?? []).forEach((task: any) => {
        if (!isAchieveMkTask(task) && taskMilestoneId(task) == null) return;
        const taskId = task?.taskId ?? task?.id ?? task?.planTaskId;
        if (taskId != null) map[String(taskId)] = mid;
      });
    });
  });

  return map;
}
