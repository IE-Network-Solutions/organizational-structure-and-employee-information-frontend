import {
  KpiApprovalStatus,
  PepAuditFlag,
  PepAuditRow,
  ScorecardStatus,
  TargetLogic,
} from '@/types/bsc';
import {
  resolveAggregatePepWorkflowSteps,
  resolvePepWorkflowSteps,
  rowNeedsPepAction,
} from './pepAuditWorkflow';
import {
  resolveScorecardResultsStatus,
  scorecardNeedsPepReview,
} from './pepAuditGroups';

function sampleRow(overrides: Partial<PepAuditRow> = {}): PepAuditRow {
  return {
    scorecardId: 'sc-1',
    targetId: 't-1',
    userId: 'u-1',
    employeeName: 'Alex Morgan',
    cycleLabel: 'March 2026',
    kpiName: 'CSAT',
    perspective: 'Customer',
    targetValue: 90,
    stretchTarget: null,
    actualValue: 70,
    acceptableThreshold: 81,
    dataSource: 'CRM',
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: '%',
    pepAuditFlag: PepAuditFlag.Unrealistic,
    approvalStatus: KpiApprovalStatus.Pending,
    ...overrides,
  };
}

describe('pepAuditWorkflow', () => {
  it('does not activate PEP before manager approval on a single row', () => {
    const steps = resolvePepWorkflowSteps(
      sampleRow({ approvalStatus: KpiApprovalStatus.Pending }),
    );
    expect(steps[1]).toBe('active');
    expect(steps[2]).toBe('pending');
  });

  it('activates PEP only after manager approval on a single row', () => {
    const steps = resolvePepWorkflowSteps(
      sampleRow({ approvalStatus: KpiApprovalStatus.Approved }),
    );
    expect(steps[1]).toBe('done');
    expect(steps[2]).toBe('active');
  });

  it('does not activate PEP in aggregate before manager approval', () => {
    const steps = resolveAggregatePepWorkflowSteps([
      sampleRow({ approvalStatus: KpiApprovalStatus.Pending }),
    ]);
    expect(steps[1]).toBe('active');
    expect(steps[2]).toBe('pending');
  });

  it('activates PEP in aggregate after all manager approvals', () => {
    const steps = resolveAggregatePepWorkflowSteps([
      sampleRow({ approvalStatus: KpiApprovalStatus.Approved }),
    ]);
    expect(steps[1]).toBe('done');
    expect(steps[2]).toBe('active');
  });

  it('requires manager approval for rowNeedsPepAction', () => {
    expect(
      rowNeedsPepAction(
        sampleRow({ approvalStatus: KpiApprovalStatus.Pending }),
      ),
    ).toBe(false);
    expect(
      rowNeedsPepAction(
        sampleRow({ approvalStatus: KpiApprovalStatus.Approved }),
      ),
    ).toBe(true);
  });
});

describe('resolveScorecardResultsStatus', () => {
  it('returns awaiting-manager when manager approval is pending', () => {
    expect(
      resolveScorecardResultsStatus(
        [sampleRow({ approvalStatus: KpiApprovalStatus.Pending })],
        ScorecardStatus.PendingEval,
      ),
    ).toBe('awaiting-manager');
  });

  it('returns awaiting-pep for actionable scorecards after manager approval', () => {
    expect(
      resolveScorecardResultsStatus(
        [sampleRow({ approvalStatus: KpiApprovalStatus.Approved })],
        ScorecardStatus.PendingEval,
      ),
    ).toBe('awaiting-pep');
  });

  it('queues completed scorecards when PEP audit is still pending', () => {
    expect(
      resolveScorecardResultsStatus(
        [sampleRow({ approvalStatus: KpiApprovalStatus.Approved })],
        ScorecardStatus.Completed,
      ),
    ).toBe('awaiting-pep');
    expect(
      scorecardNeedsPepReview(
        [sampleRow({ approvalStatus: KpiApprovalStatus.Approved })],
        ScorecardStatus.Completed,
      ),
    ).toBe(true);
  });

  it('treats fully PEP-approved completed scorecards as approved', () => {
    expect(
      resolveScorecardResultsStatus(
        [
          sampleRow({
            approvalStatus: KpiApprovalStatus.Approved,
            pepAuditFlag: PepAuditFlag.Realistic,
          }),
        ],
        ScorecardStatus.Completed,
      ),
    ).toBe('approved');
  });
});
