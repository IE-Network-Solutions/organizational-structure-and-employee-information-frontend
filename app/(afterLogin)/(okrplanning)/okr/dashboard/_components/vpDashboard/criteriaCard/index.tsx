// components/PerformanceCard.tsx
import React from 'react';
import { useVariablePayStore } from '@/store/uistate/features/okrplanning/VP';
import { Card } from 'antd';
import { BiAward } from 'react-icons/bi';
import { GoArrowUp } from 'react-icons/go';

const CriteriaCard: React.FC = () => {
  const { value, change } = useVariablePayStore();

  return (
    <Card className="mt-10">
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 rounded-full bg-indigo-50 flex justify-center items-center">
          <BiAward size={25} fill="#0BA259" />
        </div>
      </div>
      <h3 className="text-sm font-light text-gray-500 mb-2">Criteria one</h3>
      <p className="text-3xl font-bold text-gray-900">
        {value.toString().padStart(3, '0')}%
      </p>
      <div className="flex items-center mt-2 text-sm text-gray-500 justify-end">
        <span className="text-green-500 font-medium flex items-center">
          <></> {change}
          <GoArrowUp />
        </span>
        <span className="ml-2 text-sm font-light">vs last month</span>
      </div>
    </Card>
  );
};

export default CriteriaCard;
