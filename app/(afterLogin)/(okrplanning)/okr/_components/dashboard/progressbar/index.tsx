import React from 'react';
import { Progress, Card } from 'antd';

interface PercentageProps {
  percent: number | string; // Allow percent to be a number or a string (for ratios)
  title: string; // Title for the progress indicator
  format?: string; // Title for the progress indicator
  loading: boolean; // Loading state
  type: 'percent' | 'ratio' | 'daysLeft'; // Define allowed types
}

const ProgressPercent: React.FC<PercentageProps> = ({
  percent,
  title,
  loading,
  type,
  format,
}) => {
  // Format the display text based on the type
  const formatText = () => {
    if (type === 'percent') {
      return `${Number(percent)?.toLocaleString() || 0} %`; // Show percentage without the "%" symbol
    } else if (type === 'ratio') {
      return `${format || 0}`; // Display as is, e.g., '5/10'
    } else if (type === 'daysLeft') {
      return `${percent || 0}`; // Append "Days Left"
    }
    return `${percent || 0}`; // Default fallback
  };

  return (
    <div className="p-2 flex justify-center">
      {/* Card Wrapper with Background Color */}
      <Card loading={loading} className="bg-gray-100 w-full max-w-md">
        <div className="flex flex-col items-center gap-4">
          {/* Progress Bars */}
          <div className="relative flex flex-col items-center gap-4">
            <div className="absolute top-24 text-xs  text-[#3636f0]">
              {title}
            </div>
            <Progress
              style={{ color: '#3636f0' }}
              strokeColor="#3636f0"
              strokeWidth={8}
              size={150}
              percent={typeof percent === 'number' ? percent : 0} // Handle numeric percent
              type="circle"
              format={() => (
                <span className="text-[#3636F0]">{formatText()}</span>
              )}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProgressPercent;
