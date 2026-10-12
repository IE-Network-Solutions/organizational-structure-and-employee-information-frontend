import {
  DeadlineKeyResult,
  DeadlineTaskSummaryRow,
} from '@/store/server/features/deadlinePlan/interface';
import {
  formatKrMetricTypeDisplayName,
  getKeyResultProgressPercent,
  getKeyResultProgressRatioText,
  getMetricTypeName,
} from '@/utils/okrKeyResultProgressDisplay';

/** Id of the synthetic card that collects tasks with no key result. */
export const GENERAL_CARD_ID = 'general';

export interface PanelCard {
  id: string;
  title: string;
  /** May exceed 100 when a key result has a stretch target. */
  progress: number;
  /** Empty for the general card. */
  metricLabel: string;
  /** "achieved/target", e.g. "98/98". */
  ratioLabel: string;
  taskCount: number;
  /** Set for real key results; the general card has none. */
  keyResultId: string | null;
}

export interface PanelOwnerGroup {
  ownerId: string;
  cards: PanelCard[];
  keyResultCount: number;
  avgProgress: number;
  taskCount: number;
}

/** Same thresholds as the Plan & Report key result cards. */
export function progressColor(progress: number): string {
  if (progress >= 100) return '#10B981';
  if (progress >= 60) return '#1E40AF';
  if (progress > 0) return '#F59E0B';
  return '#D1D5DB';
}

export function progressPillClass(progress: number): string {
  if (progress >= 100) return 'bg-[#D1FAE5] text-[#059669]';
  if (progress >= 60) return 'bg-[#DBEAFE] text-[#1E40AF]';
  if (progress > 0) return 'bg-[#FEF3C7] text-[#D97706]';
  return 'bg-[#F3F4F6] text-[#9CA3AF]';
}

function summaryKey(assigneeId: string, keyResultId: string | null) {
  return `${assigneeId}:${keyResultId ?? GENERAL_CARD_ID}`;
}

/**
 * Weighted by key result weight when weights are set, like the OKR pages;
 * otherwise a plain average.
 */
function averageKeyResultProgress(
  keyResults: DeadlineKeyResult[],
  cards: PanelCard[],
): number {
  if (!cards.length) return 0;

  let weightSum = 0;
  let weightedTotal = 0;
  cards.forEach((card, index) => {
    const weight = Number(keyResults[index]?.weight);
    if (Number.isFinite(weight) && weight > 0) {
      weightSum += weight;
      weightedTotal += card.progress * weight;
    }
  });
  if (weightSum > 0) return Math.round(weightedTotal / weightSum);

  return Math.round(
    cards.reduce((sum, card) => sum + card.progress, 0) / cards.length,
  );
}

/**
 * One owner's panel section: a general card for unlinked tasks (only when
 * there are some) followed by a card per key result.
 */
export function buildOwnerGroup(
  ownerId: string,
  keyResults: DeadlineKeyResult[],
  summary: DeadlineTaskSummaryRow[],
): PanelOwnerGroup {
  const countByKey = new Map(
    summary.map((row) => [summaryKey(row.assigneeId, row.keyResultId), row]),
  );

  const keyResultCards: PanelCard[] = keyResults.map((keyResult) => ({
    id: keyResult.id,
    title: keyResult.title?.trim() || 'Untitled KR',
    progress: getKeyResultProgressPercent(keyResult),
    metricLabel: formatKrMetricTypeDisplayName(getMetricTypeName(keyResult)),
    ratioLabel: getKeyResultProgressRatioText(keyResult),
    taskCount: countByKey.get(summaryKey(ownerId, keyResult.id))?.total ?? 0,
    keyResultId: keyResult.id,
  }));

  const general = countByKey.get(summaryKey(ownerId, null));
  const generalCard: PanelCard | null =
    general && general.total > 0
      ? {
          id: GENERAL_CARD_ID,
          title: 'General (no key result)',
          progress: Math.round((100 * general.done) / general.total),
          metricLabel: '',
          ratioLabel: `${Math.round((100 * general.done) / general.total)}/100`,
          taskCount: general.total,
          keyResultId: null,
        }
      : null;

  const cards = generalCard ? [generalCard, ...keyResultCards] : keyResultCards;

  return {
    ownerId,
    cards,
    keyResultCount: keyResults.length,
    avgProgress: averageKeyResultProgress(keyResults, keyResultCards),
    taskCount: cards.reduce((sum, card) => sum + card.taskCount, 0),
  };
}
