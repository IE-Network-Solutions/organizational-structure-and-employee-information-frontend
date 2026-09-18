import { useMutation, useQueryClient } from 'react-query';
import {
  AssignScorecardInput,
  AppendIndividualKpisInput,
  CreateEvaluationConfigInput,
  CreateKpiLibraryInput,
  CreatePerspectiveInput,
  AdjustReportedKpiInput,
  KpiImportRowInput,
  ReportKpiInput,
  SaveRolePerspectiveInput,
  UpdateEvaluationConfigInput,
} from '@/types/bsc';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { bscMockRepo } from './mock/repository';
import { BSC_QUERY_KEYS } from './queries';

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries(BSC_QUERY_KEYS.kpis);
  qc.invalidateQueries(BSC_QUERY_KEYS.cycles);
  qc.invalidateQueries(BSC_QUERY_KEYS.scorecards);
  qc.invalidateQueries(BSC_QUERY_KEYS.scorecard);
  qc.invalidateQueries(BSC_QUERY_KEYS.hris);
  qc.invalidateQueries(BSC_QUERY_KEYS.audit);
  qc.invalidateQueries(BSC_QUERY_KEYS.pepAudit);
  qc.invalidateQueries(BSC_QUERY_KEYS.perspectives);
  qc.invalidateQueries(BSC_QUERY_KEYS.catalog);
}

export const useImportBscKpis = () => {
  const qc = useQueryClient();
  return useMutation(
    ({
      rows,
      evaluationConfigId,
    }: {
      rows: KpiImportRowInput[];
      evaluationConfigId?: string;
    }) => bscMockRepo.importKpiBatch(rows, evaluationConfigId),
    {
      onSuccess: (result) => {
        invalidateAll(qc);
        if (result.created.length) {
          NotificationMessage.success({
            message: `${result.created.length} KPI(s) imported`,
          });
        }
        if (result.errors.length) {
          NotificationMessage.warning({
            message: `${result.errors.length} row(s) failed validation`,
          });
        }
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Import failed',
        }),
    },
  );
};

export const useRejectKpiForPepAudit = () => {
  const qc = useQueryClient();
  return useMutation(
    ({
      scorecardId,
      targetId,
      rejectionReason,
    }: {
      scorecardId: string;
      targetId: string;
      rejectionReason: string;
    }) => {
      const actorId = useAuthenticationStore.getState().userId;
      return bscMockRepo.rejectKpiForPepAudit(
        scorecardId,
        targetId,
        rejectionReason,
        actorId,
      );
    },
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({
          message: 'KPI rejected — progress reset for re-report',
        });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Reject failed',
        }),
    },
  );
};

export const useReturnUnrealisticKpiForPepAudit = () => {
  const qc = useQueryClient();
  return useMutation(
    ({
      scorecardId,
      targetId,
      returnReason,
    }: {
      scorecardId: string;
      targetId: string;
      returnReason: string;
    }) => {
      const actorId = useAuthenticationStore.getState().userId;
      return bscMockRepo.returnUnrealisticKpiForPepAudit(
        scorecardId,
        targetId,
        returnReason,
        actorId,
      );
    },
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({
          message: 'KPI returned to manager for revision',
        });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Return failed',
        }),
    },
  );
};

export const useApproveKpiForPepAudit = () => {
  const qc = useQueryClient();
  return useMutation(
    ({ scorecardId, targetId }: { scorecardId: string; targetId: string }) => {
      const actorId = useAuthenticationStore.getState().userId;
      return bscMockRepo.approveKpiForPepAudit(scorecardId, targetId, actorId);
    },
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({
          message: 'KPI approved',
        });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Approve failed',
        }),
    },
  );
};

export const useBulkApproveKpiForPepAudit = () => {
  const qc = useQueryClient();
  return useMutation(
    (items: Array<{ scorecardId: string; targetId: string }>) => {
      const actorId = useAuthenticationStore.getState().userId;
      return bscMockRepo.bulkApproveKpiForPepAudit(items, actorId);
    },
    {
      onSuccess: (result) => {
        invalidateAll(qc);
        if (result.approved > 0) {
          NotificationMessage.success({
            message:
              result.approved === 1
                ? '1 KPI approved'
                : `${result.approved} KPIs approved`,
          });
        }
        if (result.failed.length) {
          NotificationMessage.warning({
            message: `${result.failed.length} KPI(s) could not be approved`,
          });
        }
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Bulk approve failed',
        }),
    },
  );
};

export const useCreateBscKpi = () => {
  const qc = useQueryClient();
  return useMutation(
    (input: CreateKpiLibraryInput) => bscMockRepo.createKpi(input),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'KPI created' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to create KPI',
        }),
    },
  );
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
        NotificationMessage.error({
          message: e.message || 'Failed to update KPI',
        }),
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
      NotificationMessage.error({
        message: e.message || 'Failed to delete KPI',
      }),
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

export const useCreateBscPerspective = () => {
  const qc = useQueryClient();
  return useMutation(
    (input: CreatePerspectiveInput) => bscMockRepo.createPerspective(input),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'Perspective created' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to create perspective',
        }),
    },
  );
};

export const useUpdateBscPerspective = () => {
  const qc = useQueryClient();
  return useMutation(
    ({ id, input }: { id: string; input: Partial<CreatePerspectiveInput> }) =>
      bscMockRepo.updatePerspective(id, input),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'Perspective updated' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to update perspective',
        }),
    },
  );
};

export const useDeleteBscPerspective = () => {
  const qc = useQueryClient();
  return useMutation((id: string) => bscMockRepo.deletePerspective(id), {
    onSuccess: () => {
      invalidateAll(qc);
      NotificationMessage.success({ message: 'Perspective deleted' });
    },
    onError: (e: Error) =>
      NotificationMessage.error({
        message: e.message || 'Failed to delete perspective',
      }),
  });
};

export const useSaveBscRolePerspectives = () => {
  const qc = useQueryClient();
  return useMutation(
    (input: SaveRolePerspectiveInput) =>
      bscMockRepo.saveRolePerspectives(input),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'Perspective weights saved' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to save perspective weights',
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
        NotificationMessage.success({ message: 'BSC saved' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to save BSC',
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
        NotificationMessage.success({
          message: 'BSC updated',
        });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to update BSC',
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
      NotificationMessage.error({
        message: e.message || 'Failed to lock cycle',
      }),
  });
};

export const useDeleteBscCycle = () => {
  const qc = useQueryClient();
  return useMutation((id: string) => bscMockRepo.deleteCycle(id), {
    onSuccess: () => {
      invalidateAll(qc);
      NotificationMessage.success({ message: 'BSC deleted' });
    },
    onError: (e: Error) =>
      NotificationMessage.error({
        message: e.message || 'Failed to delete BSC',
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

export const useAppendIndividualBscKpis = () => {
  const qc = useQueryClient();
  return useMutation(
    (input: AppendIndividualKpisInput) =>
      bscMockRepo.appendIndividualKpis(input),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({
          message: 'Individual KPIs added (this person only)',
        });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to add individual KPIs',
        }),
    },
  );
};

export const useRemoveIndividualBscKpi = () => {
  const qc = useQueryClient();
  return useMutation(
    ({ scorecardId, targetId }: { scorecardId: string; targetId: string }) =>
      bscMockRepo.removeIndividualKpi(scorecardId, targetId),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'Individual KPI removed' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to remove KPI',
        }),
    },
  );
};

export const useSubmitBscForAck = () => {
  const qc = useQueryClient();
  return useMutation(
    (id: string) => {
      const actorId = useAuthenticationStore.getState().userId;
      return bscMockRepo.submitForAck(id, actorId);
    },
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({
          message: 'Submitted for acknowledgment',
        });
      },
      onError: (e: Error) =>
        NotificationMessage.error({ message: e.message || 'Submit failed' }),
    },
  );
};

export const useAcknowledgeBscScorecard = () => {
  const qc = useQueryClient();
  return useMutation(
    (id: string) => {
      const actorId = useAuthenticationStore.getState().userId;
      return bscMockRepo.acknowledge(id, actorId);
    },
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'Scorecard acknowledged' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Acknowledge failed',
        }),
    },
  );
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
  return useMutation(
    (id: string) => {
      const actorId = useAuthenticationStore.getState().userId;
      return bscMockRepo.submitFinal(id, actorId);
    },
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'Submitted for evaluation' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({ message: e.message || 'Submit failed' }),
    },
  );
};

export const useAdjustBscReportedKpis = () => {
  const qc = useQueryClient();
  return useMutation(
    ({
      scorecardId,
      adjustments,
    }: {
      scorecardId: string;
      adjustments: AdjustReportedKpiInput[];
    }) => bscMockRepo.adjustReportedKpis(scorecardId, adjustments),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'Reported KPI values updated' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to update reported KPIs',
        }),
    },
  );
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
      onSuccess: (result, vars) => {
        void result;
        invalidateAll(qc);
        NotificationMessage.success({
          message: vars.approved ? 'KPI approved' : 'KPI rejected',
        });
      },
      onError: (e: Error) =>
        NotificationMessage.error({ message: e.message || 'Approval failed' }),
    },
  );
};

export const useFinalizeBscApprovals = () => {
  const qc = useQueryClient();
  return useMutation(
    (id: string) => {
      const actorId = useAuthenticationStore.getState().userId;
      return bscMockRepo.finalizeApprovals(id, actorId);
    },
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'Team KPI review completed' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({ message: e.message || 'Finalize failed' }),
    },
  );
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
