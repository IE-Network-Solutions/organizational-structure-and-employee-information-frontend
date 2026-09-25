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
  KpiImportRowInput,
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
  approveBscPepAuditKpi,
  assignBscScorecard,
  bulkApproveBscPepAuditKpis,
  createBscKpi,
  createBscPerspective,
  createBscScorecardTemplate,
  deactivateBscScorecardTemplate,
  deleteBscKpi,
  deleteBscPerspective,
  deleteBscScorecardTemplate,
  finalizeBscCheckIn,
  getMyBscScorecardDetail,
  importBscKpis,
  lockBscScorecardTemplate,
  mapAssignAssigneesToScorecards,
  markUnrealisticBscPepAuditKpi,
  rejectBscCheckInKpi,
  rejectBscPepAuditKpi,
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
  qc.invalidateQueries(BSC_QUERY_KEYS.pepAudit);
  qc.invalidateQueries(BSC_QUERY_KEYS.perspectives);
  qc.invalidateQueries(BSC_QUERY_KEYS.catalog);
}

export const useImportBscKpis = () => {
  const qc = useQueryClient();
  return useMutation(
    ({
      rows,
    }: {
      rows: KpiImportRowInput[];
      evaluationConfigId?: string;
    }) =>
      USE_BSC_API ? importBscKpis(rows) : bscMockRepo.importKpiBatch(rows),
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
      if (USE_BSC_API) {
        return rejectBscPepAuditKpi(scorecardId, targetId, rejectionReason);
      }
      const actorId = useAuthenticationStore.getState().userId;
      return bscMockRepo
        .rejectKpiForPepAudit(
          scorecardId,
          targetId,
          rejectionReason,
          actorId,
        )
        .then(() => undefined);
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
      if (USE_BSC_API) {
        return markUnrealisticBscPepAuditKpi(
          scorecardId,
          targetId,
          returnReason,
        );
      }
      const actorId = useAuthenticationStore.getState().userId;
      return bscMockRepo
        .returnUnrealisticKpiForPepAudit(
          scorecardId,
          targetId,
          returnReason,
          actorId,
        )
        .then(() => undefined);
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
      if (USE_BSC_API) {
        return approveBscPepAuditKpi(scorecardId, targetId);
      }
      const actorId = useAuthenticationStore.getState().userId;
      return bscMockRepo
        .approveKpiForPepAudit(scorecardId, targetId, actorId)
        .then(() => undefined);
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
      if (USE_BSC_API) {
        return bulkApproveBscPepAuditKpis(items);
      }
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
    (input: Parameters<typeof bscMockRepo.syncRoleKpis>[0]) => {
      if (USE_BSC_API) {
        // Mock-only: role KPIs are set on a Role-scope scorecard instead.
        return Promise.reject(
          new Error(
            'Role KPIs are managed on the scorecard (Role scope) in BSC setup.',
          ),
        );
      }
      return bscMockRepo.syncRoleKpis(input);
    },
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
    (input: SaveRolePerspectiveInput) => {
      if (USE_BSC_API) {
        // Mock-only: BSC v1 weights KPIs on the scorecard (total 100%).
        return Promise.reject(
          new Error(
            'Perspective weights per role are not part of BSC v1 — set KPI weights on the scorecard.',
          ),
        );
      }
      return bscMockRepo.saveRolePerspectives(input);
    },
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
        : bscMockRepo.updateCycle(id, {
            isActive: false,
            status: CycleStatus.Closed,
          }),
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

// Acknowledgment and "lock to HRIS" are not part of the BSC v1 scope (no BE
// endpoints) — their prototype-only hooks were removed. A scorecard is Active
// once assigned and Completed after the last PEP approval.

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
