import dayjs from 'dayjs';
import { formatLastReportedLabel } from './utils';

describe('formatLastReportedLabel', () => {
  it('formats soft date-only labels', () => {
    const today = dayjs('2026-09-09');
    expect(formatLastReportedLabel('2026-09-02T09:00:00.000Z', today)).toBe(
      'Last reported Sep 2',
    );
    expect(formatLastReportedLabel('2025-12-15T09:00:00.000Z', today)).toBe(
      'Last reported Dec 15, 2025',
    );
  });

  it('returns empty for missing or invalid dates', () => {
    expect(formatLastReportedLabel(null)).toBe('');
    expect(formatLastReportedLabel('')).toBe('');
    expect(formatLastReportedLabel('not-a-date')).toBe('');
  });
});
