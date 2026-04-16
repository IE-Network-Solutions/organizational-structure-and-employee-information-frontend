import React from 'react';
import { Spin } from 'antd';

interface PercentageProps {
  percent: number | string;
  title: string;
  format?: string;
  loading: boolean;
  type: 'percent' | 'ratio' | 'daysLeft';
}

const ProgressPercent: React.FC<PercentageProps> = ({
  percent,
  title,
  loading,
  type,
  format,
}) => {
  const normalizedTitle = title.replace(/\s+/g, '-').toLowerCase();

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
    </div>
  );
};

export default ProgressPercent;
