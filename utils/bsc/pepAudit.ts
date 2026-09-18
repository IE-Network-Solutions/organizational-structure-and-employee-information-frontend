import {
  EmployeeScorecard,
  PepAuditFlag,
  PepAuditRow,
  ScorecardKpiTarget,
  ScorecardStatus,
  TargetLogic,
} from '@/types/bsc';

/** Whether a reported actual fails the acceptable threshold band. */
export function isUnrealisticKpiResult(
  actual: number | null | undefined,
  target: number,
  threshold: number | null | undefined,
  logic: TargetLogic,
): boolean {
  if (actual == null || !Number.isFinite(actual)) return false;
  if (threshold == null || !Number.isFinite(threshold)) return false;

  if (logic === TargetLogic.HigherBetter) {
    return actual < threshold;
  }
  if (logic === TargetLogic.LowerBetter) {
    return actual > threshold;
  }
  return false;
}

export function resolvePepAuditFlag(
  target: Pick<
    ScorecardKpiTarget,
    'actualValue' | 'targetValue' | 'acceptableThreshold' | 'targetLogic' | 'pepAuditFlag'
  >,
): PepAuditFlag {
  if (target.pepAuditFlag) return target.pepAuditFlag;
  if (target.actualValue == null) return PepAuditFlag.PendingReview;
  if (
    isUnrealisticKpiResult(
      target.actualValue,
      target.targetValue,
      target.acceptableThreshold,
      target.targetLogic,
    )
  ) {
    return PepAuditFlag.Unrealistic;
  }
  return PepAuditFlag.Realistic;
}

export function buildPepAuditRows(
  scorecards: EmployeeScorecard[],
): PepAuditRow[] {
  const auditStatuses: ScorecardStatus[] = [
    ScorecardStatus.PendingEval,
    ScorecardStatus.NeedsResubmit,
    ScorecardStatus.Scored,
    ScorecardStatus.Completed,
  ];

  const rows: PepAuditRow[] = [];
  for (const card of scorecards) {
    if (!auditStatuses.includes(card.status)) continue;
    for (const target of card.targets) {
      if (target.actualValue == null) continue;
      rows.push({
        scorecardId: card.id,
        targetId: target.id,
        userId: card.userId,
        employeeName: card.userName,
        cycleLabel: card.cycleLabel,
        departmentName: card.departmentName,
        kpiName: target.kpiName,
        perspective: target.perspective,
        targetValue: target.targetValue,
        actualValue: target.actualValue,
        acceptableThreshold: target.acceptableThreshold ?? null,
        dataSource: target.dataSource ?? null,
        targetLogic: target.targetLogic,
        measurementUnit: target.measurementUnit,
        pepAuditFlag: resolvePepAuditFlag(target),
        approvalStatus: target.approvalStatus,
        rejectionReason: target.rejectionReason,
        pepReturnReason: target.pepReturnReason,
      });
    }
  }

  return rows.sort((a, b) => {
    const flagOrder = (flag: PepAuditFlag) => {
      if (flag === PepAuditFlag.Unrealistic) return 0;
      if (flag === PepAuditFlag.PendingReview) return 1;
      return 2;
    };
    const byFlag = flagOrder(a.pepAuditFlag) - flagOrder(b.pepAuditFlag);
    if (byFlag !== 0) return byFlag;
    return a.employeeName.localeCompare(b.employeeName);
  });
}
