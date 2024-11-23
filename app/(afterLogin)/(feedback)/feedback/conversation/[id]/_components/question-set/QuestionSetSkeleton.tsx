'use client';

import React from 'react';
import { Card, Skeleton } from 'antd';

const QuestionSetSkeleton: React.FC = () => (
  <Card className="p-4 flex flex-col items-center shadow-lg rounded-lg text-center">
    <Skeleton.Input className="mb-2" active size="small" style={{ width: '70%' }} />
    <Skeleton.Input className="mb-4" active size="small" style={{ width: '50%' }} />
    <div className="flex justify-center mb-4">
      <Skeleton.Avatar active size="large" shape="circle" />
    </div>
    <div className="text-sm text-gray-700 space-y-1">
      <Skeleton.Input className="mb-1" active size="small" style={{ width: '80%' }} />
      <Skeleton.Input className="mb-1" active size="small" style={{ width: '60%' }} />
    </div>
  </Card>
);

export default QuestionSetSkeleton;
