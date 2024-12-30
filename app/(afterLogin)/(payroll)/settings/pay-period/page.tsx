'use client';
import React, { useState } from 'react';
import { Radio, Typography } from 'antd';

const { Title } = Typography;

const PayPeriod = () => {
  const [value, setValue] = useState('monthly');

  const onChange = (e: any) => {
    setValue(e.target.value);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <Title level={3}>Pay Period</Title>
      </div>

      <Radio.Group
        onChange={onChange}
        value={value}
        style={{ display: 'block' }}
      >
        <div style={radioItemStyle}>
          <Radio className="h-12 items-center" value="weekly" type="Choose">
            Weekly
          </Radio>
        </div>
        <div style={radioItemStyle}>
          <Radio className="h-12 items-center" value="bi-weekly">
            Bi-weekly
          </Radio>
        </div>
        <div style={radioItemStyle}>
          <Radio className="h-12 items-center" value="monthly">
            Monthly
          </Radio>
        </div>
      </Radio.Group>
    </div>
  );
};

const radioItemStyle = {
  marginBottom: '12px',
  padding: '10px',
  border: '1px solid #e8e8e8',
  borderRadius: '8px',
};

export default PayPeriod;
