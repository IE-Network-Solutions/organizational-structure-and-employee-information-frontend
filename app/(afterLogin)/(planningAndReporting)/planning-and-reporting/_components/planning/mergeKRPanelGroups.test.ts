import { describe, expect, it } from '@jest/globals';
import {
  aggregateKeyResultForPanel,
  calculateTypeWeightedPanelOkr,
  flattenObjectiveKeyResults,
  mergeUserKeyResultSources,
  normalizeUserKeyResultItems,
} from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/planning/mergeKRPanelGroups';

describe('mergeKRPanelGroups — KRLeftPanel aggregation', () => {
  it('uses OKR metric type + milestone progress for thin plan KRs', () => {
    const planKr = {
      id: 'kr-1',
      title: 'Uptime',
      progress: 0,
      targetValue: 100,
      currentValue: 0,
      milestones: [{ id: 'shell', tasks: [{ id: 't1' }] }],
    };
    const apiKr = {
      id: 'kr-1',
      title: 'Uptime',
      metricType: { name: 'Milestone' },
      progress: 0,
      milestones: [
        { id: 'm1', status: 'pending' },
        { id: 'm2', status: 'pending' },
        { id: 'm3', status: 'pending' },
      ],
    };

    const card = aggregateKeyResultForPanel(planKr, 2, [apiKr]);
    expect(card.metricType).toBe('Milestone');
    expect(card.progress).toBe(0);
    expect(card.progressLabel).toBe('0/3');
  });

  it('prefers objective nested KR metric over thin user-KR row', () => {
    const thinApi = {
      id: 'kr-2',
      title: 'Feature',
      progress: 100,
      targetValue: 100,
      currentValue: 100,
    };
    const objectiveKr = {
      id: 'kr-2',
      title: 'Feature',
      metricType: { name: 'Achieve' },
      key_type: 'Achieve',
      progress: 100,
      targetValue: 100,
      currentValue: 100,
      initialValue: 0,
    };

    const merged = mergeUserKeyResultSources([thinApi], [objectiveKr]);
    const card = aggregateKeyResultForPanel(thinApi, 0, merged);
    expect(card.metricType).toBe('Achieve');
    expect(card.progress).toBe(100);
    expect(card.progressLabel).toBe('100/100');
  });

  it('flattens objective items into key results', () => {
    const flat = flattenObjectiveKeyResults([
      {
        id: 'obj-1',
        title: 'Objective',
        keyResults: [
          {
            id: 'kr-a',
            metricType: { name: 'Numeric' },
            progress: 40,
            currentValue: 40,
            targetValue: 100,
            initialValue: 0,
          },
        ],
      },
    ]);
    expect(flat).toHaveLength(1);
    expect(flat[0].id).toBe('kr-a');
    expect(flat[0].metricType.name).toBe('Numeric');
  });

  it('normalizes objective-shaped key-results/user payloads', () => {
    const items = normalizeUserKeyResultItems({
      items: [
        {
          id: 'obj-1',
          title: 'Obj',
          keyResults: [
            { id: 'kr-b', metricType: { name: 'Currency' }, progress: 10 },
          ],
        },
      ],
    });
    expect(items).toHaveLength(1);
    expect(items[0].metricType.name).toBe('Currency');
  });

  it('scores business KRs at 110 and an 80% type weight as 88', () => {
    const percentageKr = (
      id: string,
      weight: number,
      progress: number,
      objectiveId: string,
      objectiveTypeId: string,
    ) => ({
      id,
      weight,
      progress,
      objectiveId,
      objectiveTypeId,
      metricType: { name: 'Percentage' },
      initialValue: 0,
      targetValue: 100,
      thresholdValue: 80,
      stretchValue: 110,
      currentValue: progress,
    });

    const score = calculateTypeWeightedPanelOkr({
      panelKrs: [
        { id: 'kr-1', progress: 110 },
        { id: 'kr-2', progress: 110 },
        { id: 'kr-3', progress: 110 },
      ],
      userKeyResultItems: [
        percentageKr('kr-1', 50, 100, 'business', 'type-business'),
        percentageKr('kr-2', 30, 100, 'business', 'type-business'),
        percentageKr('kr-3', 20, 100, 'business', 'type-business'),
        percentageKr('kr-4', 100, 0, 'strategic', 'type-strategic'),
      ],
      typeWeights: [
        { objectiveTypeId: 'type-business', weightPercent: 80 },
        { objectiveTypeId: 'type-strategic', weightPercent: 20 },
      ],
    });

    expect(score).toBe(88);
  });
});
