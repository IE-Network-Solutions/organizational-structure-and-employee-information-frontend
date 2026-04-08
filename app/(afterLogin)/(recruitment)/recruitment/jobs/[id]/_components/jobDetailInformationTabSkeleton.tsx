import React from 'react';

const Bar = ({
  className,
  dataCy,
}: {
  className: string;
  dataCy: string;
}) => (
  <div
    className={`animate-pulse rounded bg-gray-200 ${className}`}
    data-cy={dataCy}
    aria-hidden
  />
);

const JobDetailInformationTabSkeleton: React.FC = () => {
  return (
    <div
      data-cy="talent-acquisition-job-detail-information-tab-skeleton"
      className="w-full"
    >
      <div
        className="grid grid-cols-1 gap-0 lg:grid-cols-3 lg:items-stretch"
        data-cy="talent-acquisition-job-detail-information-skeleton-grid"
      >
        <div
          className="flex flex-col bg-white p-6 lg:col-span-2 lg:pr-8"
          data-cy="talent-acquisition-job-detail-information-skeleton-description"
        >
          <div
            className="mb-4 flex items-center justify-between"
            data-cy="talent-acquisition-job-detail-information-skeleton-desc-header"
          >
            <Bar
              className="h-5 w-40"
              dataCy="talent-acquisition-job-detail-information-skeleton-desc-title"
            />
            <Bar
              className="h-6 w-6 shrink-0"
              dataCy="talent-acquisition-job-detail-information-skeleton-desc-edit"
            />
          </div>
          <div
            className="space-y-3"
            data-cy="talent-acquisition-job-detail-information-skeleton-desc-body"
          >
            <Bar
              className="h-4 w-full"
              dataCy="talent-acquisition-job-detail-information-skeleton-desc-line-0"
            />
            <Bar
              className="h-4 w-[95%]"
              dataCy="talent-acquisition-job-detail-information-skeleton-desc-line-1"
            />
            <Bar
              className="h-4 w-[88%]"
              dataCy="talent-acquisition-job-detail-information-skeleton-desc-line-2"
            />
            <Bar
              className="h-4 w-full"
              dataCy="talent-acquisition-job-detail-information-skeleton-desc-line-3"
            />
            <Bar
              className="h-4 w-[72%]"
              dataCy="talent-acquisition-job-detail-information-skeleton-desc-line-4"
            />
          </div>
        </div>

        <div
          className="flex min-h-0 flex-col border-t border-solid border-[#E5E7EB] px-6 py-6 lg:border-l lg:border-t-0 lg:px-0 lg:pl-8"
          data-cy="talent-acquisition-job-detail-information-skeleton-sidebar"
        >
          <div
            className="bg-white p-0"
            data-cy="talent-acquisition-job-detail-information-skeleton-sidebar-inner"
          >
            <div
              className="mb-4 flex items-center justify-between"
              data-cy="talent-acquisition-job-detail-information-skeleton-closing-header"
            >
              <Bar
                className="h-5 w-56 max-w-[85%]"
                dataCy="talent-acquisition-job-detail-information-skeleton-closing-title"
              />
              <Bar
                className="h-6 w-6 shrink-0"
                dataCy="talent-acquisition-job-detail-information-skeleton-closing-edit"
              />
            </div>
            <div
              className="space-y-4"
              data-cy="talent-acquisition-job-detail-information-skeleton-closing-body"
            >
              <div
                className="flex items-center justify-between gap-4"
                data-cy="talent-acquisition-job-detail-information-skeleton-closed-row"
              >
                <Bar
                  className="h-4 w-24"
                  dataCy="talent-acquisition-job-detail-information-skeleton-closed-label"
                />
                <Bar
                  className="h-4 w-36"
                  dataCy="talent-acquisition-job-detail-information-skeleton-closed-value"
                />
              </div>
              <div
                className="rounded-lg border border-solid border-[#E5E7EB] bg-white p-4"
                data-cy="talent-acquisition-job-detail-information-skeleton-days-card"
              >
                <div
                  className="mb-3 flex items-center justify-between gap-2"
                  data-cy="talent-acquisition-job-detail-information-skeleton-days-header"
                >
                  <Bar
                    className="h-4 w-28"
                    dataCy="talent-acquisition-job-detail-information-skeleton-days-label"
                  />
                  <Bar
                    className="h-4 w-24"
                    dataCy="talent-acquisition-job-detail-information-skeleton-days-value"
                  />
                </div>
                <Bar
                  className="h-2 w-full"
                  dataCy="talent-acquisition-job-detail-information-skeleton-progress"
                />
              </div>
            </div>
            <div
              className="mt-6"
              data-cy="talent-acquisition-job-detail-information-skeleton-preference-block"
            >
              <Bar
                className="mb-4 h-5 w-36"
                dataCy="talent-acquisition-job-detail-information-skeleton-preference-title"
              />
              <div
                className="grid grid-cols-2 gap-y-3"
                data-cy="talent-acquisition-job-detail-information-skeleton-preference-grid"
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="contents"
                    data-cy={`talent-acquisition-job-detail-information-skeleton-pref-row-${i}`}
                  >
                    <Bar
                      className="h-4 w-28"
                      dataCy={`talent-acquisition-job-detail-information-skeleton-pref-label-${i}`}
                    />
                    <Bar
                      className="h-4 w-20 justify-self-end"
                      dataCy={`talent-acquisition-job-detail-information-skeleton-pref-value-${i}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailInformationTabSkeleton;
