import React from 'react';
import { Progress, Card } from 'antd';

interface PercentageProps {
  percent: number; // define the type of the prop
  title: string; // define the type of the prop
  loading: boolean;
}

const ProgressPercent: React.FC<PercentageProps> = ({
  percent,
  title,
  loading,
}) => {
  return (
    <div className="p-2 flex justify-center">
      {/* Card Wrapper with Background Color */}
      <Card loading={loading} className="bg-gray-100 w-full max-w-md">
        <div className="flex flex-col items-center gap-4">
          {/* Progress Bars */}
          <div className="flex flex-col items-center gap-4">
            <div className="absolute top-28 text-sm text-[#3636f0] ">
              {title}
            </div>
            <Progress
              style={{ color: '#3636f0' }}
              strokeColor={'bg-blue-600'}
              strokeWidth={8}
              size={150}
              percent={percent}
              type="circle"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProgressPercent;
