import { Card, Col } from 'antd';
import React from 'react';
import { ArrowUpOutlined } from '@ant-design/icons';

interface PayrollCardProps {
  title?: string;
  value?: string;
  growth?: string;
}

const PayrollCard: React.FC<PayrollCardProps> = ({ title, value, growth }) => {
  return (
    <Col style={{ flex: '0 0 auto', minWidth: '350px' }} className="flex-none">
      <Card bordered={false} className="bg-[#FAFAFA] my-4 min-h-36">
        <h3 className="min-h-14">{value ? Number(value).toFixed(2) : '--'}</h3>
        <p>{title}</p>
        <div className="flex justify-end items-center">
          <span style={{ color: 'green' }}>
            <ArrowUpOutlined /> {growth || '--'} vs last pay period
          </span>
        </div>
      </Card>
    </Col>
  );
};

export default PayrollCard;
