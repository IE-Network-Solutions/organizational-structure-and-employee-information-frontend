import { useMutation, useQueryClient } from 'react-query';
import {
  AssignScorecardInput,
  AppendIndividualKpisInput,
  CreateEvaluationConfigInput,
  CreateKpiLibraryInput,
  CreatePerspectiveInput,
  AdjustReportedKpiInput,
  CycleStatus,
  EmployeeScorecard,
  ReportKpiInput,
  SaveRolePerspectiveInput,
  ScorecardStatus,
  UpdateEvaluationConfigInput,
} from '@/types/bsc';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  activateBscScorecardTemplate,
  adjustBscCheckInKpis,
  appendIndividualBscKpis,
  approveBscCheckInKpi,
  assignBscScorecard,
  createBscKpi,
  createBscPerspective,
  createBscScorecardTemplate,
  deactivateBscScorecardTemplate,
  deleteBscKpi,
  deleteBscPerspective,
  deleteBscScorecardTemplate,
  finalizeBscCheckIn,
  getMyBscScorecardDetail,
  lockBscScorecardTemplate,
  mapAssignAssigneesToScorecards,
  rejectBscCheckInKpi,
  removeIndividualBscKpi,
  submitBscCheckIn,
  updateBscKpi,
  updateBscPerspective,
  updateBscScorecardTemplate,
} from './api';
import { USE_BSC_API } from './config';
import { bscMockRepo } from './mock/repository';
import { BSC_QUERY_KEYS } from './queries';
import type {
  CreateBscCycleApiInput,
  UpdateBscCycleApiInput,
} from './scorecard.mappers';

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries(BSC_QUERY_KEYS.kpis);
  qc.invalidateQueries(BSC_QUERY_KEYS.cycles);
  qc.invalidateQueries(BSC_QUERY_KEYS.scorecards);
  qc.invalidateQueries(BSC_QUERY_KEYS.scorecardAssignments);
  qc.invalidateQueries(BSC_QUERY_KEYS.scorecard);
  qc.invalidateQueries(BSC_QUERY_KEYS.scorecardResults);
  qc.invalidateQueries(BSC_QUERY_KEYS.checkInMyQueue);
  qc.invalidateQueries(BSC_QUERY_KEYS.checkInReviewQueue);
  qc.invalidateQueries(BSC_QUERY_KEYS.hris);
  qc.invalidateQueries(BSC_QUERY_KEYS.audit);
  qc.invalidateQueries(BSC_QUERY_KEYS.perspectives);
  qc.invalidateQueries(BSC_QUERY_KEYS.catalog);
}

export const useCreateBscKpi = () => {
  const qc = useQueryClient();
  return useMutation(
    (input: CreateKpiLibraryInput) =>
      USE_BSC_API ? createBscKpi(input) : bscMockRepo.createKpi(input),
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
      USE_BSC_API
        ? updateBscKpi(id, input)
        : bscMockRepo.updateKpi(id, input),
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
  return useMutation(
    (id: string) =>
      USE_BSC_API ? deleteBscKpi(id) : bscMockRepo.deleteKpi(id),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'KPI deleted' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to delete KPI',
        }),
    },
  );
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
    (input: CreatePerspectiveInput) =>
      USE_BSC_API
        ? createBscPerspective(input)
        : bscMockRepo.createPerspective(input),
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
      USE_BSC_API
        ? updateBscPerspective(id, input)
        : bscMockRepo.updatePerspective(id, input),
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
  return useMutation(
    (id: string) =>
      USE_BSC_API
        ? deleteBscPerspective(id)
        : bscMockRepo.deletePerspective(id),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'Perspective deleted' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to delete perspective',
        }),
    },
  );
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
    (input: CreateEvaluationConfigInput | CreateBscCycleApiInput) => {
      if (!USE_BSC_API) {
        return bscMockRepo.createCycle(input);
      }
      if (!('templateKpis' in input) || !input.templateKpis?.length) {
        throw new Error(
          'Scorecard create requires KPI lines with weights totaling 100%',
        );
      }
      return createBscScorecardTemplate(input as CreateBscCycleApiInput);
    },
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
    ({
      id,
      input,
    }: {
      id: string;
      input: UpdateEvaluationConfigInput | UpdateBscCycleApiInput;
    }) =>
      USE_BSC_API
        ? updateBscScorecardTemplate(id, input as UpdateBscCycleApiInput)
        : bscMockRepo.updateCycle(id, input),
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
  return useMutation(
    (id: string) =>
      USE_BSC_API
        ? lockBscScorecardTemplate(id)
        : bscMockRepo.lockCycle(id),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'Scorecard locked' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to lock scorecard',
        }),
    },
  );
};

export const useDeactivateBscCycle = () => {
  const qc = useQueryClient();
  return useMutation(
    (id: string) =>
      USE_BSC_API
        ? deactivateBscScorecardTemplate(id)
        : bscMockRepo.deactivateCycle(id),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'Scorecard marked inactive' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to deactivate scorecard',
        }),
    },
  );
};

export const useActivateBscCycle = () => {
  const qc = useQueryClient();
  return useMutation(
    (id: string) =>
      USE_BSC_API
        ? activateBscScorecardTemplate(id)
        : bscMockRepo.updateCycle(id, { isActive: true, status: CycleStatus.Open }),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'Scorecard activated' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to activate scorecard',
        }),
    },
  );
};

export const useDeleteBscCycle = () => {
  const qc = useQueryClient();
  return useMutation(
    (id: string) =>
      USE_BSC_API
        ? deleteBscScorecardTemplate(id)
        : bscMockRepo.deleteCycle(id),
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({ message: 'Scorecard deleted' });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to delete scorecard',
        }),
    },
  );
};

export const useAssignBscScorecard = () => {
  const qc = useQueryClient();
  return useMutation(
    ({
      scorecardId,
      asOf,
    }: {
      scorecardId: string;
      asOf?: string | null;
    }) => assignBscScorecard(scorecardId, asOf),
    {
      onSuccess: (result, variables) => {
        const people = mapAssignAssigneesToScorecards(result);
        if (people.length) {
          qc.setQueryData(
            [BSC_QUERY_KEYS.scorecardAssignments, variables.scorecardId],
            people,
          );
          qc.setQueryData(
            [BSC_QUERY_KEYS.scorecards, { cycleId: variables.scorecardId }],
            people,
          );
        }
        invalidateAll(qc);
        NotificationMessage.success({
          message: 'Scorecard assigned',
          description: `${result.created} created, ${result.updated} updated for ${result.userCount} user(s) (${result.period.periodLabel}).`,
        });
      },
      onError: (e: Error) =>
        NotificationMessage.error({
          message: e.message || 'Failed to assign scorecard',
        }),
    },
  );
};

export const useCreateBscScorecard = () => {
  const qc = useQueryClient();
  return useMutation(
    async (input: AssignScorecardInput) => {
      if (!USE_BSC_API) {
        return bscMockRepo.createScorecard(input);
      }
      // BE assigns the whole scope in one call (not per-user).
      const result = await assignBscScorecard(input.cycleId);
      const stub: EmployeeScorecard = {
        id: result.employeeScorecardIds[0] || result.scorecardId,
        userId: input.userId,
        userName: input.userName,
        managerId: input.managerId,
        departmentId: input.departmentId ?? null,
        positionId: input.positionId ?? null,
        cycleId: input.cycleId,
        cycleLabel: '',
        status: ScorecardStatus.Active,
        targets: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return stub;
    },
    {
      onSuccess: () => {
        invalidateAll(qc);
        if (!USE_BSC_API) {
          NotificationMessage.success({ message: 'Scorecard created' });
        }
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
      USE_BSC_API
        ? appendIndividualBscKpis(input)
        : bscMockRepo.appendIndividualKpis(input),
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
      USE_BSC_API
        ? removeIndividualBscKpi(scorecardId, targetId)
        : bscMockRepo.removeIndividualKpi(scorecardId, targetId),
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
      if (USE_BSC_API) {
        throw new Error(
          'Acknowledgment is not available yet on the server. Scorecards become Active after assign.',
        );
      }
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
      if (USE_BSC_API) {
        throw new Error(
          'Acknowledgment is not available yet on the server. Scorecards become Active after assign.',
        );
      }
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
    }) =>
      USE_BSC_API
        ? submitBscCheckIn(scorecardId, reports)
        : bscMockRepo.reportKpis(scorecardId, reports),
    {
      onSuccess: () => {
        invalidateAll(qc);
        if (!USE_BSC_API) {
          NotificationMessage.success({ message: 'KPI values saved' });
        }
      },
      onError: (e: Error) =>
        NotificationMessage.error({ message: e.message || 'Report failed' }),
    },
  );
};

export const useSubmitBscFinal = () => {
  const qc = useQueryClient();
  return useMutation(
    async (id: string) => {
      if (USE_BSC_API) {
        // submitBscCheckIn already advances to PendingEval; reload only.
        try {
          return await getMyBscScorecardDetail(id);
        } catch {
          return { id } as any;
        }
      }
      const actorId = useAuthenticationStore.getState().userId;
      return bscMockRepo.submitFinal(id, actorId);
    },
    {
      onSuccess: () => {
        invalidateAll(qc);
        if (!USE_BSC_API) {
          NotificationMessage.success({ message: 'Submitted for evaluation' });
        }
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
    }) =>
      USE_BSC_API
        ? adjustBscCheckInKpis(scorecardId, adjustments)
        : bscMockRepo.adjustReportedKpis(scorecardId, adjustments),
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
    async ({
      scorecardId,
      targetId,
      approved,
      rejectionReason,
    }: {
      scorecardId: string;
      targetId: string;
      approved: boolean;
      rejectionReason?: string;
    }) => {
      if (!USE_BSC_API) {
        return bscMockRepo.setKpiApproval(
          scorecardId,
          targetId,
          approved,
          rejectionReason,
        );
      }
      if (approved) {
        await approveBscCheckInKpi(scorecardId, targetId);
      } else {
        await rejectBscCheckInKpi(
          scorecardId,
          targetId,
          rejectionReason || 'Rejected',
        );
      }
      try {
        return await getMyBscScorecardDetail(scorecardId);
      } catch {
        return { id: scorecardId } as any;
      }
    },
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
      if (USE_BSC_API) {
        return finalizeBscCheckIn(id);
      }
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
    async ({
      scorecardId,
      managerNote,
      evaluatorUserId,
    }: {
      scorecardId: string;
      managerNote: string;
      evaluatorUserId: string;
    }) => {
      if (USE_BSC_API) {
        // BE finalize already scores; Completed + HRIS outbox are not exposed yet.
        void managerNote;
        void evaluatorUserId;
        try {
          const detail = await getMyBscScorecardDetail(scorecardId);
          if (
            detail.status === ScorecardStatus.Scored ||
            detail.status === ScorecardStatus.Completed
          ) {
            return detail;
          }
        } catch {
          /* fall through */
        }
        throw new Error(
          'Locking evaluation to HRIS is not available yet. Finalize review to score on the server (status becomes Scored).',
        );
      }
      return bscMockRepo.lockEvaluation(
        scorecardId,
        managerNote,
        evaluatorUserId,
      );
    },
    {
      onSuccess: () => {
        invalidateAll(qc);
        NotificationMessage.success({
          message: USE_BSC_API
            ? 'Score already finalized on the server'
            : 'Evaluation locked — score pushed to HRIS (mock)',
        });
      },
      onError: (e: Error) =>
        NotificationMessage.error({ message: e.message || 'Lock failed' }),
    },
  );
};
