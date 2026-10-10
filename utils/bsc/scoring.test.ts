import {
  computeCompositeScore,
  normalizeRatio,
  rebalanceSharedWeightsForAppend,
  validateKpisMatchPerspectiveAllocation,
  validateAcceptableThreshold,
  validatePerspectiveWeights,
  validateWeights,
} from './scoring';
import { BscPerspective, TargetLogic } from '@/types/bsc';
import { canTransition, PROMPT_TO_MOCK_STATUS } from './stateMachine';
import { ScorecardStatus } from '@/types/bsc';

describe('bsc scoring', () => {
  it('normalizes higher-is-better', () => {
    expect(normalizeRatio(8, 10, TargetLogic.HigherBetter).ratio).toBe(0.8);
    expect(
      normalizeRatio(12, 10, TargetLogic.HigherBetter, { stretchTarget: 15 })
        .ratio,
    ).toBe(1.2);
  });

  it('caps over-achievement at stretch / target, or 100% without a stretch', () => {
    expect(
      normalizeRatio(150, 100, TargetLogic.HigherBetter, { stretchTarget: 120 })
        .ratio,
    ).toBe(1.2);
    expect(normalizeRatio(150, 100, TargetLogic.HigherBetter).ratio).toBe(1);
  });

  it('caps over-achievement at 100% when the card has a threshold breach', () => {
    const options = { stretchTarget: 120, cardThresholdBreached: true };
    expect(
      normalizeRatio(110, 100, TargetLogic.HigherBetter, options).ratio,
    ).toBe(1);
    expect(
      normalizeRatio(150, 100, TargetLogic.HigherBetter, options).ratio,
    ).toBe(1);
    // Below target is unaffected.
    expect(
      normalizeRatio(90, 100, TargetLogic.HigherBetter, options).ratio,
    ).toBe(0.9);
  });

  it('gives no credit below the higher-is-better threshold', () => {
    expect(
      normalizeRatio(75, 90, TargetLogic.HigherBetter, {
        acceptableThreshold: 80,
      }).ratio,
    ).toBe(0);
    // At the threshold it still scores normally (80 / 100).
    expect(
      normalizeRatio(80, 100, TargetLogic.HigherBetter, {
        acceptableThreshold: 80,
      }).ratio,
    ).toBe(0.8);
  });

  it('gives no credit above the lower-is-better threshold', () => {
    expect(
      normalizeRatio(20, 10, TargetLogic.LowerBetter, {
        acceptableThreshold: 15,
      }).ratio,
    ).toBe(0);
  });

  it('normalizes lower-is-better and caps at target / stretch', () => {
    const { ratio, capped } = normalizeRatio(1, 10, TargetLogic.LowerBetter, {
      stretchTarget: 8,
    });
    expect(ratio).toBe(1.25);
    expect(capped).toBe(true);
    expect(
      normalizeRatio(1, 10, TargetLogic.LowerBetter, {
        stretchTarget: 8,
        cardThresholdBreached: true,
      }).ratio,
    ).toBe(1);
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
    // ASA 25s vs 30s target has no stretch → capped at 100%:
    // 0.4 * 85/90 + 0.4 * 1 + 0.2 * 1 = 97.78
    expect(result.compositeScore).toBeCloseTo(97.78, 2);
  });

  it('rejects invalid weight distribution', () => {
    const invalid = validateWeights(
      [60, 20, 10],
      [
        BscPerspective.Customer,
        BscPerspective.InternalProcess,
        BscPerspective.LearningGrowth,
      ],
    );
    expect(invalid.valid).toBe(false);
    expect(validateWeights([100], [BscPerspective.Customer]).valid).toBe(true);
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

  it('requires role perspective weights to sum to 100%', () => {
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
    ).toBe(true);
    expect(
      validatePerspectiveWeights({
        [BscPerspective.Customer]: 100,
      }).valid,
    ).toBe(true);
    expect(
      validatePerspectiveWeights({
        [BscPerspective.Customer]: 70,
        [BscPerspective.InternalProcess]: 20,
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
    expect(PROMPT_TO_MOCK_STATUS.PENDING_EVAL).toBe(
      ScorecardStatus.PendingEval,
    );
    expect(PROMPT_TO_MOCK_STATUS.MANAGER_REVIEW).toBe(ScorecardStatus.Scored);
    expect(PROMPT_TO_MOCK_STATUS.COMPLETED).toBe(ScorecardStatus.Completed);
    expect('SYSTEM_SCORING' in PROMPT_TO_MOCK_STATUS).toBe(false);
    expect(Object.values(ScorecardStatus)).not.toContain('SYSTEM_SCORING');
  });

  it('rebalances shared weights when appending individual KPIs', () => {
    const result = rebalanceSharedWeightsForAppend(
      [40, 40, 20],
      ['shared', 'shared', 'shared'],
      [20],
    );
    expect(result.valid).toBe(true);
    expect(result.sharedScaled.reduce((a, b) => a + b, 0)).toBeCloseTo(80, 2);
    expect(result.sharedScaled[0] / result.sharedScaled[1]).toBeCloseTo(1, 2);
  });

  it('keeps prior individual weights when appending more', () => {
    const result = rebalanceSharedWeightsForAppend(
      [32, 32, 16, 20],
      ['shared', 'shared', 'shared', 'individual'],
      [10],
    );
    expect(result.valid).toBe(true);
    const sharedSum = result.sharedScaled
      .slice(0, 3)
      .reduce((a, b) => a + b, 0);
    expect(sharedSum).toBeCloseTo(70, 2);
    expect(result.sharedScaled[3]).toBe(20);
  });

  it('validates acceptable threshold against target logic', () => {
    expect(
      validateAcceptableThreshold(90, 81, TargetLogic.HigherBetter).valid,
    ).toBe(true);
    expect(
      validateAcceptableThreshold(90, 95, TargetLogic.HigherBetter).valid,
    ).toBe(false);
    expect(
      validateAcceptableThreshold(30, 33, TargetLogic.LowerBetter).valid,
    ).toBe(true);
    expect(
      validateAcceptableThreshold(30, 28, TargetLogic.LowerBetter).valid,
    ).toBe(false);
  });
});
