import { describe, expect, it, beforeEach } from '@jest/globals';
import { useRecentReportTaskStatuses } from './recentReportTaskStatuses';

describe('recentReportTaskStatuses reconcile', () => {
  beforeEach(() => {
    useRecentReportTaskStatuses.getState().clear();
  });

  it('keeps the submitted score when the API returns a leftover negative', () => {
    useRecentReportTaskStatuses.getState().remember('r1', {
      t1: { status: 'Done', actualValue: 10 },
    });
    useRecentReportTaskStatuses.getState().reconcile('r1', [
      {
        planTaskId: 't1',
        status: 'Done',
        isAchieved: true,
        actualValue: -10,
      },
    ]);
    expect(
      useRecentReportTaskStatuses.getState().getOverride('r1', 't1')
        ?.actualValue,
    ).toBe(10);
  });

  it('drops the override once the API score matches', () => {
    useRecentReportTaskStatuses.getState().remember('r1', {
      t1: { status: 'Done', actualValue: 10 },
    });
    useRecentReportTaskStatuses.getState().reconcile('r1', [
      {
        planTaskId: 't1',
        status: 'Done',
        isAchieved: true,
        actualValue: 10,
      },
    ]);
    expect(
      useRecentReportTaskStatuses.getState().getOverride('r1', 't1'),
    ).toBeNull();
  });
});
