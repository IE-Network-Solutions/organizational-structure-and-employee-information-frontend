import { useMutation, useQueryClient } from 'react-query';
import {
  AssignScorecardInput,
  CreateEvaluationConfigInput,
  CreateKpiLibraryInput,
  ReportKpiInput,
  UpdateEvaluationConfigInput,
} from '@/types/bsc';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { bscMockRepo } from './mock/repository';
import { BSC_QUERY_KEYS } from './queries';

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries(BSC_QUERY_KEYS.kpis);
  qc.invalidateQueries(BSC_QUERY_KEYS.cycles);
  qc.invalidateQueries(BSC_QUERY_KEYS.scorecards);
  qc.invalidateQueries(BSC_QUERY_KEYS.scorecard);
  qc.invalidateQueries(BSC_QUERY_KEYS.hris);
}

export const useCreateBscKpi = () => {
  const qc = useQueryClient();
  return useMutation((input: CreateKpiLibraryInput) => bscMockRepo.createKpi(input), {
    onSuccess: () => {
      invalidateAll(qc);
      NotificationMessage.success({ message: 'KPI created' });
    },
    onError: (e: Error) =>
      NotificationMessage.error({ message: e.message || 'Failed to create KPI' }),
  });
};

export const useUpdateBscKpi = () => {
  const qc = useQueryClient();
  return useMutation(
    ({ id, input }: { id: string; input: Partial<CreateKpiLibraryInput> }) =>
      bscMockRepo.updateKpi(id, input),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'KPI updated' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({ message: e.message || 'Failed to update KPI' }),
    },
  );
};

export const useDeleteBscKpi = () => {
  const qc = useQueryClient();
  return useMutation((id: string) => bscMockRepo.deleteKpi(id), {
    onSuccess: () => {
      invalidateAll(qc);
      NotificationMessage.success({ message: 'KPI deleted' });
    },
    onError: (e: Error) =>
      NotificationMessage.error({ message: e.message || 'Failed to delete KPI' }),
  });
};

export const useSaveBscRoleKpis = () => {
  const qc = useQueryClient();
  return useMutation(
    (input: Parameters<typeof bscMockRepo.syncRoleKpis>[0]) =>
      bscMockRepo.syncRoleKpis(input),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'KPIs saved' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to save KPIs',
        }),
    },
  );
};

export const useCreateBscCycle = () => {
  const qc = useQueryClient();
  return useMutation(
    (input: CreateEvaluationConfigInput) => bscMockRepo.createCycle(input),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'BSC evaluation setup saved' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to save evaluation setup',
        }),
    },
  );
};

export const useUpdateBscCycle = () => {
  const qc = useQueryClient();
  return useMutation(
    ({ id, input }: { id: string; input: UpdateEvaluationConfigInput }) =>
      bscMockRepo.updateCycle(id, input),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'BSC evaluation setup updated' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to update evaluation setup',
        }),
    },
  );
};

export const useLockBscCycle = () => {
  const qc = useQueryClient();
  return useMutation((id: string) => bscMockRepo.lockCycle(id), {
    onSuccess: () => {
      invalidateAll(qc);
      NotificationMessage.success({ message: 'Cycle locked' });
    },
    onError: (e: Error) =>
      NotificationMessage.error({ message: e.message || 'Failed to lock cycle' }),
  });
};

export const useDeleteBscCycle = () => {
  const qc = useQueryClient();
  return useMutation((id: string) => bscMockRepo.deleteCycle(id), {
    onSuccess: () => {
      invalidateAll(qc);
      NotificationMessage.success({ message: 'BSC setup deleted' });
    },
    onError: (e: Error) =>
      NotificationMessage.error({
        message: e.message || 'Failed to delete BSC setup',
      }),
  });
};

export const useCreateBscScorecard = () => {
  const qc = useQueryClient();
  return useMutation(
    (input: AssignScorecardInput) => bscMockRepo.createScorecard(input),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'Scorecard created' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to create scorecard',
        }),
    },
  );
};

export const useSubmitBscForAck = () => {
  const qc = useQueryClient();
  return useMutation((id: string) => bscMockRepo.submitForAck(id), {
    onSuccess: () => {
      invalidateAll(qc);
      NotificationMessage.success({ message: 'Submitted for acknowledgment' });
    },
    onError: (e: Error) =>
      NotificationMessage.error({ message: e.message || 'Submit failed' }),
  });
};

export const useAcknowledgeBscScorecard = () => {
  const qc = useQueryClient();
  return useMutation((id: string) => bscMockRepo.acknowledge(id), {
    onSuccess: () => {
      invalidateAll(qc);
      NotificationMessage.success({ message: 'Scorecard acknowledged' });
    },
    onError: (e: Error) =>
      NotificationMessage.error({ message: e.message || 'Acknowledge failed' }),
  });
};

export const useReportBscKpis = () => {
  const qc = useQueryClient();
  return useMutation(
    ({
      scorecardId,
      reports,
    }: {
      scorecardId: string;
      reports: ReportKpiInput[];
    }) => bscMockRepo.reportKpis(scorecardId, reports),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'KPI values saved' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({ message: e.message || 'Report failed' }),
    },
  );
};

export const useSubmitBscFinal = () => {
  const qc = useQueryClient();
  return useMutation((id: string) => bscMockRepo.submitFinal(id), {
    onSuccess: () => {
      invalidateAll(qc);
      NotificationMessage.success({ message: 'Submitted for evaluation' });
    },
    onError: (e: Error) =>
      NotificationMessage.error({ message: e.message || 'Submit failed' }),
  });
};

export const useSetBscKpiApproval = () => {
  const qc = useQueryClient();
  return useMutation(
    ({
      scorecardId,
      targetId,
      approved,
      rejectionReason,
    }: {
      scorecardId: string;
      targetId: string;
      approved: boolean;
      rejectionReason?: string;
    }) =>
      bscMockRepo.setKpiApproval(
        scorecardId,
        targetId,
        approved,
        rejectionReason,
      ),
    {
      onSuccess: () => invalidateAll(qc),
      onError: (e: Error) =>
        NotificationMessage.error({ message: e.message || 'Approval failed' }),
    },
  );
};

export const useFinalizeBscApprovals = () => {
  const qc = useQueryClient();
  return useMutation((id: string) => bscMockRepo.finalizeApprovals(id), {
    onSuccess: () => {
      invalidateAll(qc);
      NotificationMessage.success({ message: 'Approvals processed' });
    },
    onError: (e: Error) =>
      NotificationMessage.error({ message: e.message || 'Finalize failed' }),
  });
};

export const useLockBscEvaluation = () => {
  const qc = useQueryClient();
  return useMutation(
    ({
      scorecardId,
      managerNote,
      evaluatorUserId,
    }: {
      scorecardId: string;
      managerNote: string;
      evaluatorUserId: string;
    }) => bscMockRepo.lockEvaluation(scorecardId, managerNote, evaluatorUserId),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({
          message: 'Evaluation locked — score pushed to HRIS (mock)',
        });
      },
      onError: (e: Error) =>
        NotificationMessage.error({ message: e.message || 'Lock failed' }),
    },
  );
};
