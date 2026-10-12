import { describe, expect, it } from '@jest/globals';
import { DeadlineKeyResult } from '@/store/server/features/deadlinePlan/interface';
import {
  buildOwnerGroup,
  GENERAL_CARD_ID,
  progressColor,
} from './keyResultPanelData';

const percentageKr = (
  overrides: Partial<DeadlineKeyResult> = {},
): DeadlineKeyResult => ({
  id: 'kr-1',
  title: 'Reach 98% quality',
  metricType: { id: 'm', name: 'Percentage' },
  initialValue: 0,
  targetValue: 98,
  currentValue: 98,
  progress: 100,
  ...overrides,
});

describe('buildOwnerGroup', () => {
  it('shows a key result the way Plan & Report does', () => {
    const group = buildOwnerGroup('me', [percentageKr()], []);

    expect(group.cards).toEqual([
      {
        id: 'kr-1',
        title: 'Reach 98% quality',
        progress: 100,
        metricLabel: 'Percentage',
        ratioLabel: '98/98',
        taskCount: 0,
        keyResultId: 'kr-1',
      },
    ]);
    expect(group.keyResultCount).toBe(1);
    expect(group.avgProgress).toBe(100);
  });

  it('counts the tasks linked to each key result for this owner only', () => {
    const group = buildOwnerGroup(
      'me',
      [percentageKr()],
      [
        { assigneeId: 'me', keyResultId: 'kr-1', total: 3, done: 1 },
        { assigneeId: 'alice', keyResultId: 'kr-1', total: 9, done: 9 },
      ],
    );

    expect(group.cards[0].taskCount).toBe(3);
    expect(group.taskCount).toBe(3);
  });

  it('puts unlinked tasks in a general card ahead of the key results', () => {
    const group = buildOwnerGroup(
      'me',
      [percentageKr()],
      [{ assigneeId: 'me', keyResultId: null, total: 12, done: 3 }],
    );

    expect(group.cards.map((card) => card.id)).toEqual([
      GENERAL_CARD_ID,
      'kr-1',
    ]);
    expect(group.cards[0]).toMatchObject({
      title: 'General (no key result)',
      progress: 25,
      ratioLabel: '25/100',
      taskCount: 12,
      keyResultId: null,
    });
  });

  it('leaves the general card out of the key result count and average', () => {
    const group = buildOwnerGroup(
      'me',
      [percentageKr()],
      [{ assigneeId: 'me', keyResultId: null, total: 4, done: 0 }],
    );

    expect(group.keyResultCount).toBe(1);
    expect(group.avgProgress).toBe(100);
  });

  it('has no general card when every task is linked', () => {
    expect(buildOwnerGroup('me', [percentageKr()], []).cards).toHaveLength(1);
  });

  it('averages by key result weight when weights are set', () => {
    const group = buildOwnerGroup(
      'me',
      [
        percentageKr({ id: 'a', weight: 75 }),
        percentageKr({ id: 'b', weight: 25, currentValue: 0, progress: 0 }),
      ],
      [],
    );

    expect(group.avgProgress).toBe(75);
  });

  it('handles an owner with no key results and no tasks', () => {
    expect(buildOwnerGroup('me', [], [])).toEqual({
      ownerId: 'me',
      cards: [],
      keyResultCount: 0,
      avgProgress: 0,
      taskCount: 0,
    });
  });
});

describe('progressColor', () => {
  it('uses the same bands as the Plan & Report cards', () => {
    expect(progressColor(0)).toBe('#D1D5DB');
    expect(progressColor(30)).toBe('#F59E0B');
    expect(progressColor(60)).toBe('#1E40AF');
    expect(progressColor(105)).toBe('#10B981');
  });
});
