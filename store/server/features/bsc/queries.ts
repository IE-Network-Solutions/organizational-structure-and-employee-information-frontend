import { useQuery } from 'react-query';
import { ScorecardStatus } from '@/types/bsc';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  getMyBscScorecardDetail,
  getMyBscScorecardResults,
  listBscKpis,
  listBscPepAuditRows,
  listBscPerspectives,
  listBscReviewCheckInQueue,
  listBscScorecards,
  listBscScorecardAssignments,
  listBscResultsScorecards,
  getBscScorecardTemplate,
  listMyBscCheckInQueue,
  listMyBscScorecards,
} from './api';
import { USE_BSC_API } from './config';
import { bscMockRepo } from './mock/repository';
import type { ResultsScope } from '@/utils/bsc/scorecardTab';

export const BSC_QUERY_KEYS = {
  kpis: 'bsc-kpis',
  cycles: 'bsc-cycles',
  scorecards: 'bsc-scorecards',
  resultsScorecards: 'bsc-results-scorecards',
  scorecardAssignments: 'bsc-scorecard-assignments',
  scorecard: 'bsc-scorecard',
  scorecardResults: 'bsc-scorecard-results',
  checkInMyQueue: 'bsc-checkin-my-queue',
  checkInReviewQueue: 'bsc-checkin-review-queue',
  hris: 'bsc-hris-outbox',
  audit: 'bsc-audit',
  pepAudit: 'bsc-pep-audit',
  catalog: 'bsc-perspective-catalog',
  perspectives: 'bsc-role-perspectives',
};

async function fetchKpiLibrary(filters?: {
  evaluationConfigId?: string;
  departmentName?: string;
  positionTitle?: string;
  search?: string;
}) {
  if (!USE_BSC_API) {
    return bscMockRepo.listKpis(filters);
  }

  // BE library is tenant-wide (no role/dept scope). Keep client filters for UI compat.
  const items = await listBscKpis({ search: filters?.search });
  let next = items;

  // Scorecard templates own their KPI set via scorecardKpis — do not treat the
  // whole catalog (`evaluationConfigId: 'library'`) as belonging to a template.
  if (filters?.evaluationConfigId && filters.evaluationConfigId !== 'library') {
    next = next.filter(
      (k) => k.evaluationConfigId === filters.evaluationConfigId,
    );
  }
  if (filters?.departmentName) {
    const q = filters.departmentName.toLowerCase();
    next = next.filter(
      (k) =>
        !k.departmentName || k.departmentName.toLowerCase().includes(q),
    );
  }
  if (filters?.positionTitle) {
    const q = filters.positionTitle.toLowerCase();
    next = next.filter(
      (k) => !k.positionTitle || k.positionTitle.toLowerCase().includes(q),
    );
  }

  return next;
}

export const useGetBscKpiLibrary = (filters?: {
  evaluationConfigId?: string;
  departmentName?: string;
  positionTitle?: string;
  search?: string;
}) =>
  useQuery(
    [BSC_QUERY_KEYS.kpis, filters],
    () => fetchKpiLibrary(filters),
    { keepPreviousData: true },
  );

export const useGetBscCycles = () =>
  useQuery(BSC_QUERY_KEYS.cycles, () =>
    USE_BSC_API ? listBscScorecards() : bscMockRepo.listCycles(),
  );

export const useGetBscCycle = (id: string) =>
  useQuery(
    [BSC_QUERY_KEYS.cycles, id],
    async () => {
      if (!USE_BSC_API) return bscMockRepo.getCycle(id);
      return getBscScorecardTemplate(id);
    },
    { enabled: !!id },
  );

export const useGetBscScorecards = (filters?: {
  userId?: string;
  managerId?: string;
  cycleId?: string;
  status?: ScorecardStatus | ScorecardStatus[];
}) => {
  const actorUserId = useAuthenticationStore((s) => s.userId);

  return useQuery(
    [BSC_QUERY_KEYS.scorecards, actorUserId || 'anonymous', filters],
    async () => {
      if (!USE_BSC_API) {
        return bscMockRepo.listScorecards(filters);
      }

      // Template detail: list everyone assigned to this scorecard.
      if (filters?.cycleId) {
        let items = await listBscScorecardAssignments(filters.cycleId);
        if (filters?.userId) {
          items = items.filter((s) => s.userId === filters.userId);
        }
        if (filters?.managerId) {
          items = items.filter((s) => s.managerId === filters.managerId);
        }
        if (filters?.status) {
          const statuses = Array.isArray(filters.status)
            ? filters.status
            : [filters.status];
          items = items.filter((s) => statuses.includes(s.status));
        }
        return items;
      }

      // Otherwise only "my" scorecards (use useGetBscResultsScorecards for team/all).
      const currentUserId = useAuthenticationStore.getState().userId;
      if (!currentUserId) {
        return [];
      }
      if (filters?.userId && filters.userId !== currentUserId) {
        return [];
      }
      if (filters?.managerId && filters.managerId !== currentUserId) {
        return [];
      }

      const statusFilter = Array.isArray(filters?.status)
        ? undefined
        : filters?.status;

      let items = await listMyBscScorecards(
        statusFilter ? { status: statusFilter } : undefined,
      );

      // Hard-scope to the authenticated user so a stale cache/response cannot
      // leak another person's scorecards into My Scorecard.
      items = items.filter((s) => s.userId === currentUserId);

      if (filters?.userId) {
        items = items.filter((s) => s.userId === filters.userId);
      }
      if (filters?.managerId) {
        items = items.filter((s) => s.managerId === filters.managerId);
      }
      if (Array.isArray(filters?.status)) {
        items = items.filter((s) => filters.status!.includes(s.status));
      }

      return items;
    },
    {
      // Never reuse another user's "mine" payload across account switches.
      keepPreviousData: Boolean(filters?.cycleId),
      enabled:
        Boolean(actorUserId) &&
        (!filters?.cycleId || Boolean(filters.cycleId)),
    },
  );
};

/** Results tab scopes: mine / team (direct reports) / all employees. */
export const useGetBscResultsScorecards = (scope: ResultsScope = 'mine') => {
  const actorUserId = useAuthenticationStore((s) => s.userId);

  return useQuery(
    [BSC_QUERY_KEYS.resultsScorecards, actorUserId || 'anonymous', scope],
    async () => {
      if (!USE_BSC_API) {
        const list = await bscMockRepo.listScorecards();
        const actorId = useAuthenticationStore.getState().userId || 'demo-user';
        if (scope === 'mine') {
          return list.filter((card) => card.userId === actorId);
        }
        if (scope === 'team') {
          return list.filter(
            (card) =>
              card.managerId === actorId && card.userId !== actorId,
          );
        }
        return list;
      }
      return listBscResultsScorecards(scope);
    },
    {
      keepPreviousData: false,
      enabled: Boolean(actorUserId),
    },
  );
};

/** People assigned to a scorecard template (admin detail People card). */
export const useGetBscScorecardAssignments = (scorecardId: string) =>
  useQuery(
    [BSC_QUERY_KEYS.scorecardAssignments, scorecardId],
    async () => {
      if (!scorecardId) return [];
      if (!USE_BSC_API) {
        return bscMockRepo.listScorecards({ cycleId: scorecardId });
      }
      return listBscScorecardAssignments(scorecardId);
    },
    {
      enabled: Boolean(scorecardId),
      keepPreviousData: true,
    },
  );

export const useGetBscScorecard = (id: string) =>
  useQuery(
    [BSC_QUERY_KEYS.scorecard, id],
    async () => {
      if (!USE_BSC_API) return bscMockRepo.getScorecard(id);
      return getMyBscScorecardDetail(id);
    },
    { enabled: !!id },
  );

export const useGetBscScorecardResults = (id: string) =>
  useQuery(
    [BSC_QUERY_KEYS.scorecardResults, id],
    () => getMyBscScorecardResults(id),
    { enabled: !!id && USE_BSC_API },
  );

export const useGetBscMyCheckInQueue = () => {
  const actorUserId = useAuthenticationStore((s) => s.userId);
  return useQuery(
    [BSC_QUERY_KEYS.checkInMyQueue, actorUserId || 'anonymous'],
    () => (USE_BSC_API ? listMyBscCheckInQueue() : Promise.resolve([])),
    { enabled: Boolean(actorUserId), keepPreviousData: false },
  );
};

export const useGetBscReviewCheckInQueue = () => {
  const actorUserId = useAuthenticationStore((s) => s.userId);
  return useQuery(
    [BSC_QUERY_KEYS.checkInReviewQueue, actorUserId || 'anonymous'],
    () => (USE_BSC_API ? listBscReviewCheckInQueue() : Promise.resolve([])),
    { enabled: Boolean(actorUserId), keepPreviousData: false },
  );
};

export const useGetBscHrisOutbox = () =>
  useQuery(BSC_QUERY_KEYS.hris, () => bscMockRepo.getHrisOutbox());

export const useGetBscAudit = (scorecardId?: string) =>
  useQuery([BSC_QUERY_KEYS.audit, scorecardId], () =>
    bscMockRepo.listAudit(scorecardId),
  );

export const useGetBscPepAuditRows = (filters?: {
  managerId?: string;
  userId?: string;
}) =>
  useQuery([BSC_QUERY_KEYS.pepAudit, filters], () =>
    USE_BSC_API
      ? listBscPepAuditRows(filters)
      : bscMockRepo.listPepAuditRows(filters),
  );

export const useGetBscPerspectiveCatalog = () =>
  useQuery(BSC_QUERY_KEYS.catalog, () =>
    USE_BSC_API ? listBscPerspectives() : bscMockRepo.listPerspectives(),
  );

export const useGetBscRolePerspectives = (filters?: {
  evaluationConfigId?: string;
  positionTitle?: string;
}) =>
  useQuery(
    [BSC_QUERY_KEYS.perspectives, filters],
    () => bscMockRepo.listRolePerspectives(filters),
    { keepPreviousData: true },
  );

export const useGetBscRolePerspective = (
  evaluationConfigId: string,
  positionId: string | null,
  positionTitle: string,
) =>
  useQuery(
    [
      BSC_QUERY_KEYS.perspectives,
      evaluationConfigId,
      positionId,
      positionTitle,
    ],
    () =>
      bscMockRepo.getRolePerspectives(
        evaluationConfigId,
        positionId,
        positionTitle,
      ),
    { enabled: !!evaluationConfigId && !!positionTitle },
  );
