import { PepAuditFlag, PepAuditRow, KpiApprovalStatus, TargetLogic } from '@/types/bsc';
import {
  actionableItemsFromPepRows,
  pepAuditSelectionKey,
  resolveSelectedBulkItems,
} from './pepAuditBulk';

function sampleRow(overrides: Partial<PepAuditRow> = {}): PepAuditRow {
  return {
    scorecardId: 'sc-1',
    targetId: 't-1',
    userId: 'u-1',
    employeeName: 'Alex',
    cycleLabel: 'March 2026',
    kpiName: 'CSAT',
    perspective: 'Customer',
    targetValue: 90,
    actualValue: 70,
    acceptableThreshold: 81,
    dataSource: 'CRM',
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: '%',
    pepAuditFlag: PepAuditFlag.PendingReview,
    approvalStatus: KpiApprovalStatus.Approved,
    ...overrides,
  };
}

describe('pepAuditBulk', () => {
  it('builds selection keys', () => {
    expect(pepAuditSelectionKey({ scorecardId: 'sc-1', targetId: 't-2' })).toBe(
      'sc-1:t-2',
    );
  });

  it('lists only actionable pep rows', () => {
    const items = actionableItemsFromPepRows([
      sampleRow({ targetId: 't-1' }),
      sampleRow({
        targetId: 't-2',
        approvalStatus: KpiApprovalStatus.Pending,
      }),
      sampleRow({
        targetId: 't-3',
        pepAuditFlag: PepAuditFlag.Realistic,
      }),
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].targetId).toBe('t-1');
  });

  it('resolves selected bulk items', () => {
    const actionable = actionableItemsFromPepRows([
      sampleRow({ targetId: 't-1' }),
      sampleRow({ targetId: 't-2', scorecardId: 'sc-2' }),
    ]);
    const selected = resolveSelectedBulkItems(actionable, ['sc-1:t-1']);
    expect(selected).toHaveLength(1);
    expect(selected[0].targetId).toBe('t-1');
  });
});
