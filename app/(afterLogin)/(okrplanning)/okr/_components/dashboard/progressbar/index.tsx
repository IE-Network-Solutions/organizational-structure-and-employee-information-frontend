import React from 'react';
import { Spin } from 'antd';
import { OkrScoreContribution } from '@/utils/okrScoreBreakdown';

interface PercentageProps {
  percent: number | string;
  title: string;
  format?: string;
  loading: boolean;
  type: 'percent' | 'ratio' | 'daysLeft';
  scoreBreakdown?: OkrScoreContribution[];
}

const ProgressPercent: React.FC<PercentageProps> = ({
  percent,
  title,
  loading,
  type,
  format,
  scoreBreakdown = [],
}) => {
  const normalizedTitle = title.replace(/\s+/g, '-').toLowerCase();
  const formatScore = (score: number) =>
    Number(score).toLocaleString(undefined, { maximumFractionDigits: 2 });

  const formatText = () => {
    if (type === 'percent') {
      return `${Number(percent)?.toLocaleString() || 0}%`;
    }
    if (type === 'ratio') {
      return format || '0';
    }
    if (type === 'daysLeft') {
      return `${percent || 0}`;
    }
    return `${percent || 0}`;
  };

  if (loading) {
    return (
      <div
        id={`okr-progress-percent-wrapper-${normalizedTitle}`}
        data-cy={`okr-progress-percent-wrapper-${normalizedTitle}`}
        className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow min-h-[100px] flex items-center justify-center"
      >
        <Spin size="small" />
      </div>
    );
  }

  return (
    <div
      id={`okr-progress-percent-wrapper-${normalizedTitle}`}
      data-cy={`okr-progress-percent-wrapper-${normalizedTitle}`}
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <h3
        id={`okr-progress-percent-title-${normalizedTitle}`}
        data-cy={`okr-progress-percent-title-${normalizedTitle}`}
        className="text-sm font-medium text-gray-500 mb-2"
      >
        {title}
      </h3>
      <div
        id={`okr-progress-percent-format-${normalizedTitle}`}
        data-cy={`okr-progress-percent-format-${normalizedTitle}`}
        className="text-3xl font-bold text-gray-900"
      >
        {formatText()}
      </div>
      {type === 'percent' && scoreBreakdown.length > 0 && (
        <div
          className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-gray-600"
          data-cy={`okr-progress-percent-breakdown-${normalizedTitle}`}
        >
          {scoreBreakdown.map((item, index) => (
            <React.Fragment key={item.name}>
              {index > 0 && (
                <span
                  aria-hidden="true"
                  data-cy={`okr-progress-percent-breakdown-separator-${index}`}
                >
                  ·
                </span>
              )}
              <span
                data-cy={`okr-progress-percent-breakdown-contribution-${index}`}
              >
                {item.name} {formatScore(item.score)}% ×{' '}
                {formatScore(item.weightPercent)}% ={' '}
                {formatScore(item.contribution)}
              </span>
            </React.Fragment>
          ))}
          <span
            aria-hidden="true"
            data-cy="okr-progress-percent-breakdown-overall-separator"
          >
            ·
          </span>
          <span data-cy="okr-progress-percent-breakdown-overall">
            Overall {formatScore(Number(percent))}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressPercent;
