import { selectTopDeadlineRoots } from './topDeadlineTasks';
import type { DeadlineTask } from './types';

const task = (
  id: string,
  deadline: string,
  overrides: Partial<DeadlineTask> = {},
): DeadlineTask => ({
  id,
  title: id,
  start: deadline,
  deadline,
  spanDays: 1,
  kind: 'daily',
  parentId: null,
  done: false,
  ...overrides,
});

describe('selectTopDeadlineRoots', () => {
  it('returns up to 5 root tasks sorted by closest deadline', () => {
    const tasks = [
      task('far', '2026-09-20'),
      task('soon', '2026-09-03'),
      task('mid', '2026-09-10'),
      task('child', '2026-09-02', { parentId: 'soon' }),
      task('done', '2026-09-01', { sourceStatus: 'completed' }),
    ];
    const top = selectTopDeadlineRoots(tasks, 5);
    expect(top.map((t) => t.id)).toEqual(['soon', 'mid', 'far']);
  });

  it('limits to N roots', () => {
    const tasks = Array.from({ length: 8 }, (_, i) =>
      task(`t${i}`, `2026-09-${String(i + 1).padStart(2, '0')}`),
    );
    expect(selectTopDeadlineRoots(tasks, 5)).toHaveLength(5);
  });
});
