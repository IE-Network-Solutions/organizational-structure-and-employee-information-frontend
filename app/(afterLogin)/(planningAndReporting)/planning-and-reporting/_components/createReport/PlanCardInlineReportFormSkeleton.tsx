'use client';

/** Mirrors PlanCardInlineReportFields + footer while tasks load */
export function PlanCardInlineReportFormSkeleton() {
  return (
    <div
      className="min-h-[168px] animate-pulse sm:min-h-[188px]"
      data-cy="plan-card-inline-report-form-skeleton"
      role="status"
      aria-label="Loading report form"
    >
      <div
        data-cy="planning-and-reporting-components-createreport-plancardinlinereportformskeleton-tsx-plancardinlinereportformskeleton-div-12"
        className="space-y-1"
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            data-cy="planning-and-reporting-components-createreport-plancardinlinereportformskeleton-tsx-plancardinlinereportformskeleton-div-14"
            key={i}
            className="rounded-lg px-2.5 py-2.5 sm:py-3"
          >
            <div
              data-cy="planning-and-reporting-components-createreport-plancardinlinereportformskeleton-tsx-plancardinlinereportformskeleton-div-15"
              className="flex items-center gap-2.5"
            >
              <div
                data-cy="planning-and-reporting-components-createreport-plancardinlinereportformskeleton-tsx-plancardinlinereportformskeleton-div-16"
                className="flex shrink-0 items-center gap-1"
              >
                <div
                  data-cy="planning-and-reporting-components-createreport-plancardinlinereportformskeleton-tsx-plancardinlinereportformskeleton-div-17"
                  className="h-[18px] w-[18px] rounded-[5px] bg-[#F1F2F6]"
                />
                <div
                  data-cy="planning-and-reporting-components-createreport-plancardinlinereportformskeleton-tsx-plancardinlinereportformskeleton-div-18"
                  className="h-[18px] w-[18px] rounded-[5px] bg-[#F1F2F6]"
                />
              </div>
              <div
                data-cy="planning-and-reporting-components-createreport-plancardinlinereportformskeleton-tsx-plancardinlinereportformskeleton-div-39"
                className={[
                  'h-4 min-w-0 flex-1 rounded bg-[#F1F2F6]',
                  i === 0
                    ? 'max-w-[85%]'
                    : i === 1
                      ? 'max-w-[72%]'
                      : i === 2
                        ? 'max-w-[60%]'
                        : 'max-w-[68%]',
                ].join(' ')}
              />
            </div>
          </div>
        ))}
      </div>
      <div
        data-cy="planning-and-reporting-components-createreport-plancardinlinereportformskeleton-tsx-plancardinlinereportformskeleton-div-36"
        className="mt-4 flex flex-col gap-2.5 border-t border-[#F1F2F6] pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
      >
        <div
          data-cy="planning-and-reporting-components-createreport-plancardinlinereportformskeleton-tsx-plancardinlinereportformskeleton-div-37"
          className="flex items-center gap-2 px-0.5"
        >
          <div
            data-cy="planning-and-reporting-components-createreport-plancardinlinereportformskeleton-tsx-plancardinlinereportformskeleton-div-38"
            className="h-2.5 w-10 rounded bg-[#F1F2F6] sm:w-12"
          />
          <div
            data-cy="planning-and-reporting-components-createreport-plancardinlinereportformskeleton-tsx-plancardinlinereportformskeleton-div-39"
            className="h-3.5 w-8 rounded bg-[#F1F2F6]"
          />
        </div>
        <div
          data-cy="planning-and-reporting-components-createreport-plancardinlinereportformskeleton-tsx-plancardinlinereportformskeleton-div-41"
          className="flex flex-wrap justify-end gap-2"
        >
          <div
            data-cy="planning-and-reporting-components-createreport-plancardinlinereportformskeleton-tsx-plancardinlinereportformskeleton-div-42"
            className="h-9 w-[4.75rem] rounded-lg bg-[#F1F2F6]"
          />
          <div
            data-cy="planning-and-reporting-components-createreport-plancardinlinereportformskeleton-tsx-plancardinlinereportformskeleton-div-43"
            className="h-9 w-[8rem] rounded-lg bg-[#F1F2F6]"
          />
        </div>
      </div>
    </div>
  );
}
