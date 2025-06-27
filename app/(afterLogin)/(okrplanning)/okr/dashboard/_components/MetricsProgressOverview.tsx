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
  const { pageSize, currentPage } = useOKRStore();
  const { data: objectivesData, isLoading } = useGetUserObjective(
    userId,
    pageSize,
    currentPage,
    '',
  );

  // Calculate percent achieved for each metric type dynamically
  const metrics = useMemo(() => {
    const counts: Record<string, { total: number; achieved: number }> = {};
    
    if (objectivesData?.items) {
      objectivesData.items.forEach((obj: any) => {
        (obj.keyResults || []).forEach((kr: any) => {
          const metricTypeName = (kr.metricType?.name || kr.key_type || 'Unknown')
            .trim();
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
      percent: counts[metricType].total > 0
        ? Math.round((counts[metricType].achieved / counts[metricType].total) * 100)
        : 0,
      color: colorPalette[index % colorPalette.length],
    }));
  }, [objectivesData]);

  return (
    <div className="bg-white rounded-xl shadow-md px-6 py-4 w-full h-full flex flex-col pb-4">
      <div className="font-bold text-lg text-gray-900 mb-4">
        Metrics Progress Overview
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <Spin />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-y-6 items-center">
          {metrics.map((item) => (
            <React.Fragment key={item.label}>
              <div className="text-base text-gray-700 font-medium">
                {item.label}
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: item.color }}
                  >
                    {item.percent}%
                  </span>
                  <span className="text-xs text-gray-400">achieved</span>
                </div>
                <Progress
                  percent={item.percent}
                  size="default"
                  showInfo={false}
                  strokeColor={item.color}
                  trailColor="#E5E7EB"
                  className="!h-1.5 !rounded-full w-48"
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
