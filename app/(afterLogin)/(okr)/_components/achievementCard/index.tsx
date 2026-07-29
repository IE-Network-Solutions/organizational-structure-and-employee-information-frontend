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
  bgColor?: string;
}
const ProgressCard: React.FC<ProgressCardParams> = ({
  title,
  amount,
  progress,
  totalAmount,
  bgColor,
}) => {
  return (
    <Card
      className="shadow-md rounded-lg my-2"
      style={{ backgroundColor: bgColor }}
      id={`okr-achievement-card-${title}`}
      data-cy={`okr-achievement-card-${title}`}
    >
      <div
        className="flex items-center justify-start"
        id={`okr-achievement-card-icon-row-${title}`}
        data-cy={`okr-achievement-card-icon-row-${title}`}
      >
        <div
          className="bg-[#7152F30D] p-3 rounded-lg my-4"
          id={`okr-achievement-card-icon-wrapper-${title}`}
          data-cy={`okr-achievement-card-icon-wrapper-${title}`}
        >
          <Image unoptimized
            src={Receipt.src}
            alt="icon"
            width={20}
            height={20}
            id={`okr-achievement-card-icon-${title}`}
            data-cy={`okr-achievement-card-icon-${title}`}
          />
        </div>
      </div>
      <div
        className="flex items-center justify-start gap-7"
        id={`okr-achievement-card-amount-row-${title}`}
        data-cy={`okr-achievement-card-amount-row-${title}`}
      >
        <h2
          className="text-3xl font-bold mb-1"
          id={`okr-achievement-card-amount-${title}`}
          data-cy={`okr-achievement-card-amount-${title}`}
        >
          {amount.toLocaleString()} $
        </h2>
        <div
          id={`okr-achievement-card-cycle-wrapper-${title}`}
          data-cy={`okr-achievement-card-cycle-wrapper-${title}`}
        >
          <div
            className="bg-[#7152F30D] p-3 rounded-lg my-4"
            id={`okr-achievement-card-cycle-icon-wrapper-${title}`}
            data-cy={`okr-achievement-card-cycle-icon-wrapper-${title}`}
          >
            <Image unoptimized
              src={Cycle.src}
              alt="icon"
              width={15}
              height={15}
              id={`okr-achievement-card-cycle-icon-${title}`}
              data-cy={`okr-achievement-card-cycle-icon-${title}`}
            />
          </div>
        </div>
      </div>
      <p
        className="text-gray-600"
        id={`okr-achievement-card-title-${title}`}
        data-cy={`okr-achievement-card-title-${title}`}
      >
        {title}
      </p>
      <div
        className="mt-4"
        id={`okr-achievement-card-progress-section-${title}`}
        data-cy={`okr-achievement-card-progress-section-${title}`}
      >
        <p
          className="text-sm font-semibold"
          id={`okr-achievement-card-progress-label-${title}`}
          data-cy={`okr-achievement-card-progress-label-${title}`}
        >
          Progress Review
        </p>
        <Progress
          percent={(progress / totalAmount) * 100}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          format={(percent: any) => `${percent.toFixed(2)}%`}
          data-cy={`okr-achievement-card-progress-bar-${title}`}
        />
      </div>
    </Card>
  );
};

export default ProgressCard;
