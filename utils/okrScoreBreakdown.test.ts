import { buildOkrScoreBreakdown } from './okrScoreBreakdown';

describe('buildOkrScoreBreakdown', () => {
  it('maps type scores to named weighted contributions', () => {
    expect(
      buildOkrScoreBreakdown(
        {
          business: 105,
          strategic: 80,
        },
        [
          { objectiveTypeId: 'business', name: 'Business', weightPercent: 80 },
          {
            objectiveTypeId: 'strategic',
            name: 'Strategic',
            weightPercent: 20,
          },
        ],
      ),
    ).toEqual([
      {
        name: 'Business',
        score: 105,
        weightPercent: 80,
        contribution: 84,
      },
      {
        name: 'Strategic',
        score: 80,
        weightPercent: 20,
        contribution: 16,
      },
    ]);
  });

  it('omits type scores without an effective weight', () => {
    expect(
      buildOkrScoreBreakdown({ business: 70, retired: 90 }, [
        { objectiveTypeId: 'business', name: 'Business', weightPercent: 100 },
      ]),
    ).toEqual([
      {
        name: 'Business',
        score: 70,
        weightPercent: 100,
        contribution: 70,
      },
    ]);
  });
});
