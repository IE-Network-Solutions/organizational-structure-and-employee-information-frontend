import { Card, Col } from 'antd';
import React from 'react';
import { ArrowUpOutlined } from '@ant-design/icons';
import { useIsMobile } from '@/components/common/hooks/useIsMobile';

interface PayrollCardProps {
  title?: string;
  value?: string;
  growth?: string;
}

const PayrollCard: React.FC<PayrollCardProps> = ({ title, value, growth }) => {
  const { isMobile } = useIsMobile();
  
  return (
    <Col 
      xs={24} 
      sm={24} 
      md={24} 
      lg={24} 
      className={`${isMobile ? 'w-full px-3' : 'max-w-[25%]'} flex-shrink-0`}
    >
      <Card bordered={false} className="bg-[#FAFAFA] my-2 h-full">
        <h3 className="text-2xl font-bold mb-2">{value ? Number(value).toFixed(2) : '--'}</h3>
        <p className="text-gray-600">{title}</p>
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
