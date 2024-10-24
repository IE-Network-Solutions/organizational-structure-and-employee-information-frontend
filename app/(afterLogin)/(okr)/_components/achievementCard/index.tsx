import { Progress, Card } from 'antd';
import React from 'react';
import Receipt from './receipt.png';
import Cycle from './cyclee.png';
import Image from 'next/image';

interface ProgressCardParams {
  title: string;
  amount: number;
  progress: number;
  totalAmount: number;
}
const ProgressCard: React.FC<ProgressCardParams> = ({
  title,
  amount,
  progress,
  totalAmount,
}) => {
  return (
    <Card className="shadow-md rounded-lg my-2">
      <div className="flex items-center justify-start">
        <div className="bg-[#7152F30D] p-3 rounded-lg my-4">
          <Image src={Receipt.src} alt="icon" width={20} height={20} />
        </div>
      </div>
      <div className="flex items-center justify-start gap-7">
        <h2 className="text-3xl font-bold mb-1">{amount.toLocaleString()} $</h2>
        <div>
          <div className="bg-[#7152F30D] p-3 rounded-lg my-4">
            <Image src={Cycle.src} alt="icon" width={15} height={15} />
          </div>
        </div>
      </div>
      <p className="text-gray-600">{title}</p>
      <div className="mt-4">
        <p className="text-sm font-semibold">Progress Review</p>
        <Progress
          percent={(progress / totalAmount) * 100}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          format={(percent: any) => `${percent.toFixed(2)}%`}
        />
      </div>
    </Card>
  );
};

export default ProgressCard;
