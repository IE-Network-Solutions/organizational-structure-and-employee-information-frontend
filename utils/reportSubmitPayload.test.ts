import { describe, expect, it } from '@jest/globals';
import {
  buildSanitizedReportPayload,
  sanitizeReportSubmitValues,
} from './reportSubmitPayload';

describe('sanitizeReportSubmitValues', () => {
  it('keeps a finite achieved value', () => {
    expect(
      sanitizeReportSubmitValues({
        t1: { status: 'Done', actualValue: 20 },
      }).t1.actualValue,
    ).toBe(20);
  });

  it('rejects leftover concatenations that Postgres cannot store as numeric', () => {
    expect(
      sanitizeReportSubmitValues({
        t1: { status: 'Done', actualValue: '0.000-30' },
      }).t1.actualValue,
    ).toBe(0);
  });

  it('strips locale formatting from actualValue', () => {
    expect(
      sanitizeReportSubmitValues({
        t1: { status: 'Done', actualValue: '1,000' },
      }).t1.actualValue,
    ).toBe(1000);
  });

  it('clamps negatives to 0', () => {
    expect(
      sanitizeReportSubmitValues({
        t1: { status: 'Not', actualValue: -30 },
      }).t1.actualValue,
    ).toBe(0);
  });
});

describe('buildSanitizedReportPayload', () => {
  it('merges Done from the status store when the form omitted status', () => {
    expect(
      buildSanitizedReportPayload(
        { t1: { actualValue: 20 } },
        { t1: 'Done' },
      ).t1,
    ).toEqual({ status: 'Done', actualValue: 20 });
  });

  it('drops tasks that still have no status after merge', () => {
    expect(
      buildSanitizedReportPayload({ t1: { actualValue: 20 } }, {}),
    ).toEqual({});
  });
});
