import React from 'react';

const pulseBar = (className: string, dataCy: string) => (
  <div
    className={`animate-pulse rounded bg-gray-200 ${className}`}
    data-cy={dataCy}
    aria-hidden
  />
);

const JobDetailHeaderCardSkeleton: React.FC = () => {
  return (
    <div
      className="relative"
      data-cy="talent-acquisition-job-detail-card-skeleton"
    >
      <div
        className="absolute top-5 right-5 flex items-center gap-2"
        data-cy="talent-acquisition-job-detail-card-skeleton-actions"
      >
        {pulseBar(
          'h-7 w-[72px]',
          'talent-acquisition-job-detail-card-skeleton-status',
        )}
      </div>
      <div
        className="mb-4 pr-24"
        data-cy="talent-acquisition-job-detail-card-skeleton-title-wrap"
      >
        {pulseBar(
          'h-7 w-full max-w-[320px]',
          'talent-acquisition-job-detail-card-skeleton-title',
        )}
      </div>
      <div
        className="grid grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:max-w-6xl sm:flex-wrap sm:justify-between sm:gap-y-4"
        data-cy="talent-acquisition-job-detail-card-skeleton-fields-grid"
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-2"
            data-cy={`talent-acquisition-job-detail-card-skeleton-field-${i}`}
          >
            {pulseBar(
              'h-4 w-24',
              `talent-acquisition-job-detail-card-skeleton-label-${i}`,
            )}
            {pulseBar(
              'mt-0.5 h-5 w-32 sm:w-36',
              `talent-acquisition-job-detail-card-skeleton-value-${i}`,
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobDetailHeaderCardSkeleton;
