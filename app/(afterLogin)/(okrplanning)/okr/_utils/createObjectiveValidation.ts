import type { OkrScoringMode } from '@/store/server/features/okrplanning/okr-setting/interface';
import {
  getKeyResultBandValidationError,
  KeyResultScoreBands,
} from '@/utils/okrScoringBands';

interface KeyResultDraft extends KeyResultScoreBands {
  title?: string | null;
  deadline?: unknown;
  weight?: unknown;
  key_type?: string;
  metricType?: { name: string } | null;
  milestones?: { title?: string | null; weight?: unknown }[] | null;
}

/** Shared by the Create button and the submission guard. */
export function getObjectiveKeyResultsValidationError(
  keyResults: KeyResultDraft[] | null | undefined,
  scoringMode: OkrScoringMode | undefined,
): string | null {
  if (!keyResults?.length) {
    return 'Please add at least one key result before submitting.';
  }

  let totalWeight = 0;
  for (const [index, keyResult] of keyResults.entries()) {
    const prefix = `Key result ${index + 1}: `;
    if (!keyResult.title?.trim()) {
      return `${prefix}Please enter the name.`;
    }
    if (!keyResult.deadline || !String(keyResult.deadline).trim()) {
      return `${prefix}Please select a deadline.`;
    }
    const weight = toWeight(keyResult.weight);
    if (weight == null) {
      return `${prefix}Please enter a weight between 0 and 100.`;
    }
    totalWeight += weight;

    const keyType = keyResult.metricType?.name || keyResult.key_type;
    if (
      keyType === 'Currency' ||
      keyType === 'Numeric' ||
      keyType === 'Percentage'
    ) {
      const bandError = getKeyResultBandValidationError(keyResult, scoringMode);
      if (bandError) return prefix + bandError;
    }
    if (keyType === 'Milestone') {
      if (!keyResult.milestones?.length) {
        return `${prefix}Please add at least one milestone.`;
      }
      let milestoneWeight = 0;
      for (const [
        milestoneIndex,
        milestone,
      ] of keyResult.milestones.entries()) {
        if (!milestone.title?.trim()) {
          return `${prefix}Please enter the name for milestone ${milestoneIndex + 1}.`;
        }
        const value = toWeight(milestone.weight);
        if (value == null) {
          return `${prefix}Please enter a weight between 0 and 100 for milestone ${milestoneIndex + 1}.`;
        }
        milestoneWeight += value;
      }
      if (milestoneWeight !== 100) {
        return `${prefix}Milestone weights must total 100%. Current total: ${milestoneWeight}%.`;
      }
    }
  }

  return totalWeight === 100
    ? null
    : `Key result weights must total 100%. Current total: ${totalWeight}%.`;
}

function toWeight(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const weight = Number(value);
  return Number.isFinite(weight) && weight >= 0 && weight <= 100
    ? weight
    : null;
}
