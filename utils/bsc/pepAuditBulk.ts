import { PepAuditRow } from '@/types/bsc';
import { rowNeedsPepAction } from '@/utils/bsc/pepAuditWorkflow';

export type PepAuditBulkItem = {
  scorecardId: string;
  targetId: string;
  userId?: string;
  kpiName?: string;
};

export function pepAuditSelectionKey(item: Pick<PepAuditBulkItem, 'scorecardId' | 'targetId'>) {
  return `${item.scorecardId}:${item.targetId}`;
}

export function actionableItemsFromPepRows(
  pepRows: PepAuditRow[],
): PepAuditBulkItem[] {
  return pepRows.filter(rowNeedsPepAction).map((row) => ({
    scorecardId: row.scorecardId,
    targetId: row.targetId,
    userId: row.userId,
    kpiName: row.kpiName,
  }));
}

export function resolveSelectedBulkItems(
  actionable: PepAuditBulkItem[],
  selectedKeys: string[],
): PepAuditBulkItem[] {
  const keySet = new Set(selectedKeys);
  return actionable.filter((item) => keySet.has(pepAuditSelectionKey(item)));
}

export function bulkSelectionKeys(items: PepAuditBulkItem[]): string[] {
  return items.map(pepAuditSelectionKey);
}
