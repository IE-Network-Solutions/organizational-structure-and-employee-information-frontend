type NamedType = { id: string; name: string };

type WeightAssignment = {
  lines?: Array<{ objectiveTypeId: string; weightPercent: number | string }>;
} | null;

export type TypeWeightedReadiness = {
  ready: boolean;
  /** Plain-language reasons, in the order the admin should fix them. */
  issues: string[];
};

const roundPercent = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Mirrors the backend rule for enabling Type-weighted scoring: the tenant
 * default weights must exist, cover every active objective type, and total 100%.
 * The backend stays the authority; this only explains it before the user clicks.
 */
export const getTypeWeightedReadiness = (
  activeTypes: NamedType[],
  tenantDefault: WeightAssignment,
): TypeWeightedReadiness => {
  if (!activeTypes.length) {
    return {
      ready: false,
      issues: ['Create at least one objective type.'],
    };
  }

  const lines = tenantDefault?.lines ?? [];
  if (!lines.length) {
    return {
      ready: false,
      issues: ['Set the default weights for your objective types.'],
    };
  }

  const issues: string[] = [];

  const weightedIds = new Set(lines.map((line) => line.objectiveTypeId));
  const missing = activeTypes.filter((type) => !weightedIds.has(type.id));
  if (missing.length) {
    issues.push(
      `Add a weight for ${missing.map((type) => type.name).join(', ')}.`,
    );
  }

  const total = roundPercent(
    lines.reduce((sum, line) => sum + (Number(line.weightPercent) || 0), 0),
  );
  if (Math.abs(total - 100) > 0.01) {
    issues.push(`The weights add up to ${total}%. They must total 100%.`);
  }

  return { ready: issues.length === 0, issues };
};
