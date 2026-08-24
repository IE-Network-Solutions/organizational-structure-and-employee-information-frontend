import { Card } from 'antd';
import React from 'react';
import DeadlinePlanWidget from './deadline/DeadlinePlanWidget';

const Plan = () => {
  return (
    <Card
      bodyStyle={{ padding: 0 }}
      className="bg-white p-3 border h-[343px] border-gray-200 rounded-lg overflow-hidden"
    >
      <DeadlinePlanWidget />
    </Card>
  );
};

export default Plan;
