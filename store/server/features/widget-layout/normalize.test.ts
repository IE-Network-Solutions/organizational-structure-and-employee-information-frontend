import {
  isDashboardLayoutForUser,
  normalizeDashboardWidgetLayout,
} from './normalize';
import type { DashboardWidgetLayoutRow } from './interface';

const row = (
  widgetId: string,
  userId = 'user-a',
): DashboardWidgetLayoutRow => ({
  id: `${widgetId}-id`,
  tenantId: 'tenant-1',
  userId,
  plan: 'enterprise',
  widgetId,
  x: 0,
  y: 0,
  w: 12,
  h: 8,
  isVisible: true,
});

describe('normalizeDashboardWidgetLayout', () => {
  it('reads the current { userId, plan, items } shape', () => {
    const result = normalizeDashboardWidgetLayout(
      { userId: 'user-a', plan: 'enterprise', items: [row('calendar')] },
      'enterprise',
      'fallback',
    );

    expect(result.userId).toBe('user-a');
    expect(result.items).toHaveLength(1);
  });

  it('still reads a bare row array from an older API build', () => {
    const result = normalizeDashboardWidgetLayout(
      [row('calendar'), row('my-plan')],
      'enterprise',
      'fallback',
    );

    // Regression guard: reading `items` off an array yields undefined, which
    // used to silently reset every user's saved layout to the default.
    expect(result.items).toHaveLength(2);
    expect(result.userId).toBe('user-a');
    expect(result.plan).toBe('enterprise');
  });

  it('reports no saved layout for an empty response, not a broken one', () => {
    expect(
      normalizeDashboardWidgetLayout([], 'performance', 'me').items,
    ).toEqual([]);
    expect(
      normalizeDashboardWidgetLayout(
        { userId: 'me', plan: 'performance', items: [] },
        'performance',
        'me',
      ).items,
    ).toEqual([]);
  });

  it('rejects a payload that names a different user', () => {
    expect(
      isDashboardLayoutForUser(
        { userId: 'user-a', plan: 'enterprise', items: [row('calendar')] },
        'user-b',
      ),
    ).toBe(false);
    expect(
      isDashboardLayoutForUser(
        { userId: 'user-b', plan: 'enterprise', items: [] },
        'user-b',
      ),
    ).toBe(true);
  });

  it('falls back to the signed-in user only when the payload names nobody', () => {
    expect(
      normalizeDashboardWidgetLayout(null, 'performance', 'me').userId,
    ).toBe('me');
    expect(
      normalizeDashboardWidgetLayout(
        [row('calendar', 'user-b')],
        'enterprise',
        'me',
      ).userId,
    ).toBe('user-b');
  });
});
