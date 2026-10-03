import {
  IncompleteKeyResult,
  IncompleteObjective,
  MissingObjectiveType,
  TypeChecklistItem,
} from '@/store/server/features/okrplanning/okr-readiness/interface';

export const getReadinessStatusLabel = (item: TypeChecklistItem) => {
  const label = `${item.name} (${item.weight}%)`;

  if (item.status === 'ok') return `${label} - ready`;
  if (item.status === 'incomplete') return `${label} - incomplete`;
  return `${label} - not created yet`;
};

export const getReadinessIssueSummary = ({
  missingObjectiveTypes,
  incompleteObjectives,
  incompleteKeyResults,
}: {
  missingObjectiveTypes: MissingObjectiveType[];
  incompleteObjectives: IncompleteObjective[];
  incompleteKeyResults: IncompleteKeyResult[];
}) => [
  ...missingObjectiveTypes.map(
    (type) => `${type.name} (${type.weight}%) has not been created.`,
  ),
  ...incompleteObjectives.map(
    (objective) => `${objective.title}: ${objective.reasons.join(', ')}`,
  ),
  ...incompleteKeyResults.map(
    (keyResult) => `${keyResult.title}: ${keyResult.reasons.join(', ')}`,
  ),
];
