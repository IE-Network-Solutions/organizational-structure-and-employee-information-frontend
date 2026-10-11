import { describe, expect, it } from '@jest/globals';
import { resolveDoneActualValue } from '@/utils/reportActualValue';

describe('resolveDoneActualValue', () => {
  it('fills the target when nothing was entered yet', () => {
    expect(resolveDoneActualValue(undefined, 100)).toBe(100);
    expect(resolveDoneActualValue(null, 100)).toBe(100);
    expect(resolveDoneActualValue('', 100)).toBe(100);
  });

  it('raises a value below the target to the target (Done needs the target)', () => {
    expect(resolveDoneActualValue(0, 100)).toBe(100);
    expect(resolveDoneActualValue(60, 100)).toBe(100);
  });

  it('keeps a value at or above the target, e.g. stretch 110 on target 100', () => {
    expect(resolveDoneActualValue(100, 100)).toBe(100);
    expect(resolveDoneActualValue(110, 100)).toBe(110);
  });

  it('keeps large currency amounts untouched', () => {
    expect(resolveDoneActualValue(1_800_000_000, 1_700_000_000)).toBe(
      1_800_000_000,
    );
  });

  it('never returns NaN for non-numeric input', () => {
    expect(resolveDoneActualValue('1,700,000', 100)).toBe(100);
    expect(resolveDoneActualValue(undefined, undefined)).toBe(0);
  });
});
