import {
  getReadinessIssueSummary,
  getReadinessStatusLabel,
} from './readinessUtils';

describe('OKR readiness helpers', () => {
  it('formats missing type checklist items with their required weight', () => {
    expect(
      getReadinessStatusLabel({
        objectiveTypeId: 'strategic',
        name: 'Strategic Objective',
        weight: 20,
        objectiveCount: 0,
        status: 'missing',
      }),
    ).toBe('Strategic Objective (20%) — not created yet');
  });

  it('summarizes all readiness blockers for the submit dialog', () => {
    expect(
      getReadinessIssueSummary({
        missingObjectiveTypes: [
          { id: 'strategic', name: 'Strategic Objective', weight: 20 },
        ],
        incompleteObjectives: [
          {
            id: 'objective-1',
            title: 'Grow revenue',
            reasons: ['Add at least one key result'],
          },
        ],
        incompleteKeyResults: [
          {
            id: 'kr-1',
            objectiveId: 'objective-1',
            title: 'Increase MRR',
            reasons: ['Set a target value'],
          },
        ],
      }),
    ).toEqual([
      'Strategic Objective (20%) has not been created.',
      'Grow revenue: Add at least one key result',
      'Increase MRR: Set a target value',
    ]);
  });
});
