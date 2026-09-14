import { useQuery } from 'react-query';
import { ScorecardStatus } from '@/types/bsc';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  getMyBscScorecardDetail,
  getMyBscScorecardResults,
  listBscKpis,
  listBscPerspectives,
  listBscReviewCheckInQueue,
  listBscScorecards,
  listBscScorecardAssignments,
  getBscScorecardTemplate,
  listMyBscCheckInQueue,
  listMyBscScorecards,
} from './api';
import { USE_BSC_API } from './config';
import { bscMockRepo } from './mock/repository';

export const BSC_QUERY_KEYS = {
  kpis: 'bsc-kpis',
  cycles: 'bsc-cycles',
  scorecards: 'bsc-scorecards',
  scorecardAssignments: 'bsc-scorecard-assignments',
  scorecard: 'bsc-scorecard',
  scorecardResults: 'bsc-scorecard-results',
  checkInMyQueue: 'bsc-checkin-my-queue',
  checkInReviewQueue: 'bsc-checkin-review-queue',
  hris: 'bsc-hris-outbox',
  audit: 'bsc-audit',
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
}) =>
  useQuery(
    [BSC_QUERY_KEYS.scorecards, filters],
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

      // Otherwise only "my" scorecards (BE has no admin all-users list).
      const currentUserId = useAuthenticationStore.getState().userId;
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
      keepPreviousData: true,
      enabled: !filters?.cycleId || Boolean(filters.cycleId),
    },
  );

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

export const useGetBscMyCheckInQueue = () =>
  useQuery(BSC_QUERY_KEYS.checkInMyQueue, () =>
    USE_BSC_API ? listMyBscCheckInQueue() : Promise.resolve([]),
  );

export const useGetBscReviewCheckInQueue = () =>
  useQuery(BSC_QUERY_KEYS.checkInReviewQueue, () =>
    USE_BSC_API ? listBscReviewCheckInQueue() : Promise.resolve([]),
  );

export const useGetBscHrisOutbox = () =>
  useQuery(BSC_QUERY_KEYS.hris, () => bscMockRepo.getHrisOutbox());

export const useGetBscAudit = (scorecardId?: string) =>
  useQuery([BSC_QUERY_KEYS.audit, scorecardId], () =>
    bscMockRepo.listAudit(scorecardId),
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
