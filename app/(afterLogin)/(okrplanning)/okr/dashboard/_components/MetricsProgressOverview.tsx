import { Progress, Spin } from 'antd';
import React, { useMemo } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useGetUserObjective } from '@/store/server/features/okrplanning/okr/objective/queries';

const metricTypes = [
  { label: 'Milestone', color: '#3636F0' },
  { label: 'Currency', color: '#4F8CFF' },
  { label: 'Numeric', color: '#3EC3FF' },
  { label: 'Achieved or Not', color: '#D1D5DB' },
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

  // Calculate percent achieved for each metric type
  const metrics = useMemo(() => {
    const result = metricTypes.map((type) => ({
      label: type.label,
      percent: 0,
      color: type.color,
    }));
    if (!objectivesData?.items) return result;
    const counts: Record<string, { total: number; achieved: number }> = {
      Milestone: { total: 0, achieved: 0 },
      Currency: { total: 0, achieved: 0 },
      Numeric: { total: 0, achieved: 0 },
      'Achieved or Not': { total: 0, achieved: 0 },
    };
    objectivesData.items.forEach((obj: any) => {
      (obj.keyResults || []).forEach((kr: any) => {
        const metricTypeName = (kr.metricType?.name || kr.key_type || '')
          .trim()
          .toLowerCase();
        const progress = Number(kr.progress);
        if (metricTypeName === 'milestone') {
          counts.Milestone.total++;
          if (progress >= 100) counts.Milestone.achieved++;
        } else if (metricTypeName === 'currency') {
          counts.Currency.total++;
          if (progress >= 100) counts.Currency.achieved++;
        } else if (metricTypeName === 'numeric') {
          counts.Numeric.total++;
          if (progress >= 100) counts.Numeric.achieved++;
        } else if (
          metricTypeName === 'achieve' ||
          metricTypeName === 'achieved or not'
        ) {
          counts['Achieved or Not'].total++;
          if (progress >= 100) counts['Achieved or Not'].achieved++;
        }
      });
    });
    return metricTypes.map((type) => ({
      label: type.label,
      percent:
        counts[type.label].total > 0
          ? Math.round(
              (counts[type.label].achieved / counts[type.label].total) * 100,
            )
          : 0,
      color: type.color,
    }));
  }, [objectivesData]);

  return (
    <div className="bg-white rounded-xl shadow-md px-6 py-4 w-full h-full flex flex-col">
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
