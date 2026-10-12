import {
  EvaluationCycle,
  KpiLibraryItem,
  RolePerspectiveAllocation,
} from '@/types/bsc';

export function roleSlug(title: string): string {
  return title.trim().toLowerCase();
}

export function decodeRoleSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export interface BscRoleListItem {
  key: string;
  positionId: string | null;
  positionTitle: string;
  departmentNames: string[];
  kpiCount: number;
  evaluationConfigId: string;
}

/** Aggregate roles from BSC configs, KPIs, and perspective assignments */
export function buildRoleList(
  configs: EvaluationCycle[],
  kpis: KpiLibraryItem[],
  allocations: RolePerspectiveAllocation[] = [],
): BscRoleListItem[] {
  const map = new Map<string, BscRoleListItem>();

  const upsert = (
    title: string,
    positionId: string | null | undefined,
    departmentName: string | null | undefined,
    evaluationConfigId: string,
  ) => {
    const trimmed = (title || '').trim();
    if (!trimmed) return;
    const key = positionId || roleSlug(trimmed);
    const existing = map.get(key);
    if (existing) {
      if (
        departmentName &&
        !existing.departmentNames.includes(departmentName)
      ) {
        existing.departmentNames.push(departmentName);
      }
      if (!existing.evaluationConfigId && evaluationConfigId) {
        existing.evaluationConfigId = evaluationConfigId;
      }
      return;
    }
    map.set(key, {
      key,
      positionId: positionId || null,
      positionTitle: trimmed,
      departmentNames: departmentName ? [departmentName] : [],
      kpiCount: 0,
      evaluationConfigId,
    });
  };

  for (const config of configs) {
    const titles = config.positionTitles || [];
    const ids = config.positionIds || [];
    if (titles.length) {
      titles.forEach((title, i) => {
        upsert(title, ids[i] || null, null, config.id);
      });
    } else if (ids.length) {
      ids.forEach((id) => upsert(id, id, null, config.id));
    }
    // Department-only (or dept + individual) templates show as department scope rows
    if (!titles.length && !ids.length) {
      (config.departmentNames || []).forEach((name) => {
        upsert(name, null, name, config.id);
      });
    }
  }

  for (const kpi of kpis) {
    const title = kpi.positionTitle;
    if (!title) continue;
    upsert(title, kpi.positionId, kpi.departmentName, kpi.evaluationConfigId);
  }

  for (const alloc of allocations) {
    upsert(
      alloc.positionTitle,
      alloc.positionId,
      alloc.departmentName,
      alloc.evaluationConfigId,
    );
  }

  for (const row of map.values()) {
    row.kpiCount = kpis.filter(
      (k) =>
        (k.positionId && row.positionId && k.positionId === row.positionId) ||
        (k.positionTitle || '').toLowerCase() ===
          row.positionTitle.toLowerCase(),
    ).length;
  }

  return Array.from(map.values()).sort((a, b) =>
    a.positionTitle.localeCompare(b.positionTitle),
  );
}

export function filterKpisForRole(
  kpis: KpiLibraryItem[],
  roleKey: string,
  positionTitleHint?: string,
): KpiLibraryItem[] {
  const decoded = decodeRoleSlug(roleKey).toLowerCase();
  const titleHint = (positionTitleHint || decoded).toLowerCase();
  return kpis.filter((k) => {
    if (k.positionId && k.positionId === roleKey) return true;
    if (k.positionId && k.positionId === decoded) return true;
    return (k.positionTitle || '').toLowerCase() === titleHint;
  });
}
