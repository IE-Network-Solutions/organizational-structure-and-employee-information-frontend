import { describe, expect, it } from '@jest/globals';
import { getReportTaskDisplayScore } from './reportTaskDisplayScore';

describe('getReportTaskDisplayScore', () => {
  it('shows the submitted actual when Done matches the planned target', () => {
    expect(
      getReportTaskDisplayScore({
        status: 'Done',
        isAchieved: true,
        actualValue: 10,
        planTask: { targetValue: 10 },
      }),
    ).toBe(10);
  });

  it('does not show a negative leftover after refresh', () => {
    expect(
      getReportTaskDisplayScore({
        status: 'Done',
        isAchieved: true,
        actualValue: -10,
        planTask: { targetValue: 10 },
      }),
    ).toBe(10);
  });

  it('does not fall through a falsy actualValue to KR achievedValue', () => {
    expect(
      getReportTaskDisplayScore({
        status: 'Done',
        isAchieved: true,
        actualValue: 0,
        achievedValue: 80,
        planTask: { targetValue: 10 },
      }),
    ).toBe(10);
  });

  it('does not treat KR currentValue copied into actualValue as the score', () => {
    expect(
      getReportTaskDisplayScore({
        status: 'Done',
        isAchieved: true,
        actualValue: 80,
        planTask: {
          targetValue: 10,
          keyResult: { currentValue: 80 },
        },
      }),
    ).toBe(10);
  });

  it('keeps a Done actual that is above the planned target', () => {
    expect(
      getReportTaskDisplayScore({
        status: 'Done',
        isAchieved: true,
        actualValue: 15,
        planTask: {
          targetValue: 10,
          keyResult: { currentValue: 80 },
        },
      }),
    ).toBe(15);
  });

  it('shows 0 for Not when actual is leftover negative', () => {
    expect(
      getReportTaskDisplayScore({
        status: 'Not',
        isAchieved: false,
        actualValue: -10,
        planTask: { targetValue: 10 },
      }),
    ).toBe(0);
  });

  it('shows a non-negative partial actual for Not', () => {
    expect(
      getReportTaskDisplayScore({
        status: 'Not',
        isAchieved: false,
        actualValue: 5,
        planTask: { targetValue: 10 },
      }),
    ).toBe(5);
  });

  it('treats actualValue 0 as 0, not as missing', () => {
    expect(
      getReportTaskDisplayScore({
        status: 'Not',
        isAchieved: false,
        actualValue: 0,
        achievedValue: 80,
        planTask: { targetValue: 10 },
      }),
    ).toBe(0);
  });
});
