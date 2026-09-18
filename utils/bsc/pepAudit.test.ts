import {
  KpiApprovalStatus,
  PepAuditFlag,
  ScorecardStatus,
  TargetLogic,
} from '@/types/bsc';
import {
  buildPepAuditRows,
  isUnrealisticKpiResult,
  resolvePepAuditFlag,
} from './pepAudit';

describe('pepAudit', () => {
  it('flags higher-is-better results below threshold', () => {
    expect(
      isUnrealisticKpiResult(70, 90, 81, TargetLogic.HigherBetter),
    ).toBe(true);
    expect(
      isUnrealisticKpiResult(85, 90, 81, TargetLogic.HigherBetter),
    ).toBe(false);
  });

  it('flags lower-is-better results above threshold', () => {
    expect(
      isUnrealisticKpiResult(35, 30, 33, TargetLogic.LowerBetter),
    ).toBe(true);
    expect(
      isUnrealisticKpiResult(31, 30, 33, TargetLogic.LowerBetter),
    ).toBe(false);
  });

  it('resolves audit flags from target data', () => {
    expect(
      resolvePepAuditFlag({
        actualValue: 70,
        targetValue: 90,
        acceptableThreshold: 81,
        targetLogic: TargetLogic.HigherBetter,
      }),
    ).toBe(PepAuditFlag.Unrealistic);
    expect(
      resolvePepAuditFlag({
        actualValue: null,
        targetValue: 90,
        acceptableThreshold: 81,
        targetLogic: TargetLogic.HigherBetter,
      }),
    ).toBe(PepAuditFlag.PendingReview);
  });

  it('builds audit rows from pending evaluation scorecards', () => {
    const rows = buildPepAuditRows([
      {
        id: 'sc-1',
        userId: 'u1',
        userName: 'Alex Morgan',
        managerId: 'm1',
        cycleId: 'c1',
        cycleLabel: 'March 2026',
        status: ScorecardStatus.PendingEval,
        createdAt: '2026-03-01',
        updatedAt: '2026-03-01',
        targets: [
          {
            id: 't1',
            scorecardId: 'sc-1',
            kpiLibraryId: 'k1',
            kpiName: 'CSAT',
            perspective: 'Customer',
            targetLogic: TargetLogic.HigherBetter,
            measurementUnit: '%',
            weightPercentage: 100,
            targetValue: 90,
            actualValue: 70,
            acceptableThreshold: 81,
            dataSource: 'CRM',
            approvalStatus: KpiApprovalStatus.Pending,
          },
        ],
      },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].pepAuditFlag).toBe(PepAuditFlag.Unrealistic);
    expect(rows[0].employeeName).toBe('Alex Morgan');
    expect(rows[0].userId).toBe('u1');
    expect(rows[0].cycleLabel).toBe('March 2026');
  });
});
