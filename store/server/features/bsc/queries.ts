import { useQuery } from 'react-query';
import { ScorecardStatus } from '@/types/bsc';
import { bscMockRepo } from './mock/repository';

export const BSC_QUERY_KEYS = {
  kpis: 'bsc-kpis',
  cycles: 'bsc-cycles',
  scorecards: 'bsc-scorecards',
  scorecard: 'bsc-scorecard',
  hris: 'bsc-hris-outbox',
};

export const useGetBscKpiLibrary = (filters?: {
  evaluationConfigId?: string;
  departmentName?: string;
  positionTitle?: string;
  search?: string;
}) =>
  useQuery(
    [BSC_QUERY_KEYS.kpis, filters],
    () => bscMockRepo.listKpis(filters),
    { keepPreviousData: true },
  );

export const useGetBscCycles = () =>
  useQuery(BSC_QUERY_KEYS.cycles, () => bscMockRepo.listCycles());

export const useGetBscCycle = (id: string) =>
  useQuery([BSC_QUERY_KEYS.cycles, id], () => bscMockRepo.getCycle(id), {
    enabled: !!id,
  });

export const useGetBscScorecards = (filters?: {
  userId?: string;
  managerId?: string;
  cycleId?: string;
  status?: ScorecardStatus | ScorecardStatus[];
}) =>
  useQuery(
    [BSC_QUERY_KEYS.scorecards, filters],
    () => bscMockRepo.listScorecards(filters),
    { keepPreviousData: true },
  );

export const useGetBscScorecard = (id: string) =>
  useQuery(
    [BSC_QUERY_KEYS.scorecard, id],
    () => bscMockRepo.getScorecard(id),
    { enabled: !!id },
  );

export const useGetBscHrisOutbox = () =>
  useQuery(BSC_QUERY_KEYS.hris, () => bscMockRepo.getHrisOutbox());
