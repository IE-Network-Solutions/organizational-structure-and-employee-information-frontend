import { Progress, Spin } from 'antd';
import React, { useMemo } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useGetUserObjective } from '@/store/server/features/okrplanning/okr/objective/queries';

// Color palette for dynamic metric types
const colorPalette = [
  '#3636F0', // Primary blue
  '#4F8CFF', // Light blue
  '#3EC3FF', // Cyan
  '#22C55E', // Green
  '#FACC15', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Teal
  '#84CC16', // Lime
];

const MetricsProgressOverview: React.FC = () => {
  const userId = useAuthenticationStore.getState().userId;
  const { pageSize, currentPage, fiscalYearId, sessionIds } = useOKRStore();
  const {
    data: objectivesData,
    isLoading,
    isFetching,
  } = useGetUserObjective(
    userId,
    pageSize,
    currentPage,
    '',
    fiscalYearId,
    sessionIds,
  );

  const isMetricsLoading = isLoading || isFetching;

  // Calculate percent achieved for each metric type dynamically
  const metrics = useMemo(() => {
    const counts: Record<string, { total: number; achieved: number }> = {};

    if (objectivesData?.items) {
      objectivesData.items.forEach((obj: any) => {
        (obj.keyResults || []).forEach((kr: any) => {
          const metricTypeName = (
            kr.metricType?.name ||
            kr.key_type ||
            'Unknown'
          ).trim();
          const progress = Number(kr.progress || 0);

          if (!counts[metricTypeName]) {
            counts[metricTypeName] = { total: 0, achieved: 0 };
          }

          counts[metricTypeName].total++;
          if (progress >= 100) {
            counts[metricTypeName].achieved++;
          }
        });
      });
    }

    // Create metrics array with colors
    return Object.keys(counts).map((metricType, index) => ({
      label: metricType,
      percent:
        counts[metricType].total > 0
          ? Math.round(
              (counts[metricType].achieved / counts[metricType].total) * 100,
            )
          : 0,
      color: colorPalette[index % colorPalette.length],
    }));
  }, [objectivesData]);

  return (
    <div
      className="bg-white rounded-xl shadow-md px-6 py-4 w-full h-full flex flex-col pb-4"
      id="okr-metrics-overview-container-display-div"
      data-cy="okr-metrics-overview-container-display-div"
    >
      <div
        className="font-bold text-lg text-gray-900 mb-4"
        id="okr-metrics-overview-header-display-div"
        data-cy="okr-metrics-overview-header-display-div"
      >
        Metrics Progress Overview
      </div>
      {isMetricsLoading ? (
        <div
          className="flex justify-center items-center h-24"
          id="okr-metrics-overview-loading-container-display-div"
          data-cy="okr-metrics-overview-loading-container-display-div"
        >
          <Spin data-cy="okr-metrics-overview-loading-spinner-display-spin" />
        </div>
      ) : (
        <div
          className="grid grid-cols-2 gap-y-6 items-center"
          id="okr-metrics-overview-grid-display-div"
          data-cy="okr-metrics-overview-grid-display-div"
        >
          {metrics.map((item) => (
            <React.Fragment key={item.label}>
              <div
                className="text-base text-gray-700 font-medium"
                id={`okr-metrics-overview-label-display-div-${item.label
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')}`}
                data-cy={`okr-metrics-overview-label-display-div-${item.label
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')}`}
              >
                {item.label}
              </div>
              <div
                className="flex flex-col items-end"
                id={`okr-metrics-overview-stats-container-display-div-${item.label
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')}`}
                data-cy={`okr-metrics-overview-stats-container-display-div-${item.label
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')}`}
              >
                <div
                  className="flex items-center gap-1"
                  id={`okr-metrics-overview-stat-row-display-div-${item.label
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')}`}
                  data-cy={`okr-metrics-overview-stat-row-display-div-${item.label
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')}`}
                >
                  <span
                    className="text-xs font-semibold"
                    style={{ color: item.color }}
                    id={`okr-metrics-overview-percent-display-span-${item.label
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-+|-+$/g, '')}`}
                    data-cy={`okr-metrics-overview-percent-display-span-${item.label
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-+|-+$/g, '')}`}
                  >
                    {item.percent}%
                  </span>
                  <span
                    className="text-xs text-gray-400"
                    id={`okr-metrics-overview-achieved-label-display-span-${item.label
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-+|-+$/g, '')}`}
                    data-cy={`okr-metrics-overview-achieved-label-display-span-${item.label
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-+|-+$/g, '')}`}
                  >
                    achieved
                  </span>
                </div>
                <Progress
                  percent={item.percent}
                  size="default"
                  showInfo={false}
                  strokeColor={item.color}
                  trailColor="#E5E7EB"
                  className="!h-1.5 !rounded-full w-48"
                  data-cy={`okr-metrics-overview-progress-display-progress-${item.label
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')}`}
                />
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default MetricsProgressOverview;
