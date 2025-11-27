import { Card, Col } from 'antd';
import React from 'react';
import { ArrowUpOutlined } from '@ant-design/icons';
import { useIsMobile } from '@/hooks/useIsMobile';

interface PayrollCardProps {
  title?: string;
  value?: string;
  growth?: string;
}

const PayrollCard: React.FC<PayrollCardProps> = ({ title, value, growth }) => {
  const { isMobile } = useIsMobile();

  return (
    <Col
      id="payroll-summary-card-view-column"
      data-cy="payroll-summary-card-view-column"
      xs={24}
      sm={24}
      md={24}
      lg={24}
      className={`${isMobile ? 'w-full px-3' : 'max-w-[25%]'} flex-shrink-0`}
    >
      <Card
        id="payroll-summary-card-view-card"
        data-cy="payroll-summary-card-view-card"
        bordered={false}
        className={
          isMobile
            ? 'bg-[#FAFAFA] my-2 h-full -mr-8 pr-2'
            : 'bg-[#FAFAFA] my-2 h-full'
        }
      >
        <h3
          id="payroll-summary-card-value-view-text"
          data-cy="payroll-summary-card-value-view-text"
          className="text-2xl font-bold mb-2"
        >
          {value ? Number(value).toFixed(2) : '--'}
        </h3>
        <p
          id="payroll-summary-card-title-view-text"
          data-cy="payroll-summary-card-title-view-text"
          className="text-gray-600"
        >
          {title}
        </p>
        <div
          id="payroll-summary-card-growth-view-container"
          data-cy="payroll-summary-card-growth-view-container"
          className="flex justify-end items-center"
        >
          <span
            id="payroll-summary-card-growth-view-text"
            data-cy="payroll-summary-card-growth-view-text"
            style={{ color: 'green' }}
          >
            <ArrowUpOutlined data-cy="payroll-summary-card-growth-view-icon" />{' '}
            {growth || '--'} vs last pay period
          </span>
        </div>
      </Card>
    </Col>
  );
};

export default PayrollCard;
