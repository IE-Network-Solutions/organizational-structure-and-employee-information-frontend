import {
  computeCompositeScore,
  normalizeRatio,
  validateKpisMatchPerspectiveAllocation,
  validatePerspectiveWeights,
  validateWeights,
} from './scoring';
import { BscPerspective, TargetLogic } from '@/types/bsc';
import { canTransition, PROMPT_TO_MOCK_STATUS } from './stateMachine';
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

  it('requires role perspective weights to sum to 100 and stay within 50%', () => {
    expect(
      validatePerspectiveWeights({
        [BscPerspective.Customer]: 40,
        [BscPerspective.InternalProcess]: 35,
        [BscPerspective.LearningGrowth]: 25,
      }).valid,
    ).toBe(true);
    expect(
      validatePerspectiveWeights({
        [BscPerspective.Customer]: 60,
        [BscPerspective.InternalProcess]: 20,
        [BscPerspective.LearningGrowth]: 20,
      }).valid,
    ).toBe(false);
  });

  it('requires KPI weights to match a role perspective allocation', () => {
    const allocation = {
      [BscPerspective.Customer]: 35,
      [BscPerspective.InternalProcess]: 35,
      [BscPerspective.LearningGrowth]: 30,
    };
    expect(
      validateKpisMatchPerspectiveAllocation(
        [35, 35, 30],
        [
          BscPerspective.Customer,
          BscPerspective.InternalProcess,
          BscPerspective.LearningGrowth,
        ],
        allocation,
      ).valid,
    ).toBe(true);
    expect(
      validateKpisMatchPerspectiveAllocation(
        [40, 35, 25],
        [
          BscPerspective.Customer,
          BscPerspective.InternalProcess,
          BscPerspective.LearningGrowth,
        ],
        allocation,
      ).valid,
    ).toBe(false);
    expect(
      validateKpisMatchPerspectiveAllocation(
        [100],
        ['Community Impact'],
        allocation,
      ).message,
    ).toMatch(/not assigned/i);
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

  it('maps prompt names onto persisted statuses and omits SYSTEM_SCORING', () => {
    expect(PROMPT_TO_MOCK_STATUS.DRAFT).toBe(ScorecardStatus.Draft);
    expect(PROMPT_TO_MOCK_STATUS.PENDING_ACK).toBe(ScorecardStatus.PendingAck);
    expect(PROMPT_TO_MOCK_STATUS.ACTIVE_CYCLE).toBe(ScorecardStatus.Active);
    expect(PROMPT_TO_MOCK_STATUS.PENDING_EVAL).toBe(ScorecardStatus.PendingEval);
    expect(PROMPT_TO_MOCK_STATUS.MANAGER_REVIEW).toBe(ScorecardStatus.Scored);
    expect(PROMPT_TO_MOCK_STATUS.COMPLETED).toBe(ScorecardStatus.Completed);
    expect('SYSTEM_SCORING' in PROMPT_TO_MOCK_STATUS).toBe(false);
    expect(Object.values(ScorecardStatus)).not.toContain('SYSTEM_SCORING');
  });
});
