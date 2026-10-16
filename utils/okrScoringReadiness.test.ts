import { getTypeWeightedReadiness } from './okrScoringReadiness';

const types = [
  { id: 'business', name: 'Business' },
  { id: 'strategic', name: 'Strategic' },
];

describe('getTypeWeightedReadiness', () => {
  it('is ready when every active type has a weight and they total 100%', () => {
    const result = getTypeWeightedReadiness(types, {
      lines: [
        { objectiveTypeId: 'business', weightPercent: 80 },
        { objectiveTypeId: 'strategic', weightPercent: '20' },
      ],
    });

    expect(result).toEqual({ ready: true, issues: [] });
  });

  it('asks to set the default weights when there is no tenant assignment', () => {
    expect(getTypeWeightedReadiness(types, null)).toEqual({
      ready: false,
      issues: ['Set the default weights for your objective types.'],
    });
    expect(getTypeWeightedReadiness(types, { lines: [] }).ready).toBe(false);
  });

  it('names the active types that are missing a weight', () => {
    const result = getTypeWeightedReadiness(types, {
      lines: [{ objectiveTypeId: 'business', weightPercent: 100 }],
    });

    expect(result.ready).toBe(false);
    expect(result.issues).toEqual(['Add a weight for Strategic.']);
  });

  it('reports a total other than 100%', () => {
    const result = getTypeWeightedReadiness(types, {
      lines: [
        { objectiveTypeId: 'business', weightPercent: 60 },
        { objectiveTypeId: 'strategic', weightPercent: 30 },
      ],
    });

    expect(result.issues).toEqual([
      'The weights add up to 90%. They must total 100%.',
    ]);
  });

  it('tolerates rounding noise around 100%', () => {
    const result = getTypeWeightedReadiness(types, {
      lines: [
        { objectiveTypeId: 'business', weightPercent: 33.33 },
        { objectiveTypeId: 'strategic', weightPercent: 66.67 },
      ],
    });

    expect(result.ready).toBe(true);
  });

  it('asks for an objective type when none are active', () => {
    expect(getTypeWeightedReadiness([], null).issues).toEqual([
      'Create at least one objective type.',
    ]);
  });
});
