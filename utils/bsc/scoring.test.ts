import {
  computeCompositeScore,
  normalizeRatio,
  validateWeights,
} from './scoring';
import { BscPerspective, TargetLogic } from '@/types/bsc';
import { canTransition } from './stateMachine';
import { ScorecardStatus } from '@/types/bsc';

describe('bsc scoring', () => {
  it('normalizes higher-is-better', () => {
    expect(normalizeRatio(12, 10, TargetLogic.HigherBetter).ratio).toBe(1.2);
  });

  it('normalizes lower-is-better and caps at R_max', () => {
    const { ratio, capped } = normalizeRatio(1, 10, TargetLogic.LowerBetter);
    expect(ratio).toBe(1.25);
    expect(capped).toBe(true);
  });

  it('matches Tier-1 Support Agent golden fixture', () => {
    const result = computeCompositeScore([
      {
        id: '1',
        scorecardId: 's',
        kpiLibraryId: 'k1',
        kpiName: 'Individual CSAT',
        perspective: BscPerspective.Customer,
        targetLogic: TargetLogic.HigherBetter,
        measurementUnit: '%',
        weightPercentage: 40,
        targetValue: 90,
        actualValue: 85,
        approvalStatus: 'Approved' as any,
      },
      {
        id: '2',
        scorecardId: 's',
        kpiLibraryId: 'k2',
        kpiName: 'Avg Speed of Answer',
        perspective: BscPerspective.InternalProcess,
        targetLogic: TargetLogic.LowerBetter,
        measurementUnit: 'sec',
        weightPercentage: 40,
        targetValue: 30,
        actualValue: 25,
        approvalStatus: 'Approved' as any,
      },
      {
        id: '3',
        scorecardId: 's',
        kpiLibraryId: 'k3',
        kpiName: 'Product Training',
        perspective: BscPerspective.LearningGrowth,
        targetLogic: TargetLogic.HigherBetter,
        measurementUnit: 'hours',
        weightPercentage: 20,
        targetValue: 10,
        actualValue: 10,
        approvalStatus: 'Approved' as any,
      },
    ]);
    expect(result.compositeScore).toBeCloseTo(105.78, 2);
  });

  it('rejects invalid weight distribution', () => {
    const invalid = validateWeights(
      [60, 20, 20],
      [
        BscPerspective.Customer,
        BscPerspective.InternalProcess,
        BscPerspective.LearningGrowth,
      ],
    );
    expect(invalid.valid).toBe(false);
  });

  it('accepts balanced weights', () => {
    const valid = validateWeights(
      [40, 40, 20],
      [
        BscPerspective.Customer,
        BscPerspective.InternalProcess,
        BscPerspective.LearningGrowth,
      ],
    );
    expect(valid.valid).toBe(true);
  });
});

describe('bsc state machine', () => {
  it('allows Draft to PendingAck', () => {
    expect(
      canTransition(ScorecardStatus.Draft, ScorecardStatus.PendingAck),
    ).toBe(true);
  });

  it('blocks Completed transitions', () => {
    expect(
      canTransition(ScorecardStatus.Completed, ScorecardStatus.Active),
    ).toBe(false);
  });
});
