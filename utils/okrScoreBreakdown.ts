export interface OkrTypeScoreWeight {
  objectiveTypeId: string;
  name: string;
  weightPercent: number;
}

export interface OkrScoreContribution {
  name: string;
  score: number;
  weightPercent: number;
  contribution: number;
}

export function buildOkrScoreBreakdown(
  typeScores: Record<string, number> | undefined,
  effectiveWeights: OkrTypeScoreWeight[] | undefined,
): OkrScoreContribution[] {
  if (!typeScores || !effectiveWeights) return [];

  return effectiveWeights.flatMap((weight) => {
    const score = Number(typeScores[weight.objectiveTypeId]);
    const weightPercent = Number(weight.weightPercent);

    if (!Number.isFinite(score) || !Number.isFinite(weightPercent)) return [];

    return [
      {
        name: weight.name,
        score,
        weightPercent,
        contribution: (score * weightPercent) / 100,
      },
    ];
  });
}
