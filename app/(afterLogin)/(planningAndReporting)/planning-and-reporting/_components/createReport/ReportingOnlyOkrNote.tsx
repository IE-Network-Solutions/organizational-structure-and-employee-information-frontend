import React from 'react';

export function ReportingOnlyOkrNote({
  countingPeriodName,
}: {
  countingPeriodName: string;
}) {
  const label = countingPeriodName?.trim() || 'highest assigned';
  return (
    <p
      data-cy="planning-reporting-only-okr-note"
      className="mb-3 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 text-xs leading-relaxed text-[#64748B]"
    >
      This report is for tracking only. OKR progress is updated from your{' '}
      <span
        data-cy="planning-reporting-only-okr-note-period"
        className="font-semibold text-[#334155]"
      >
        {label}
      </span>{' '}
      report.
    </p>
  );
}
