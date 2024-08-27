import { Col, DatePicker, Row, Select } from 'antd';
import React from 'react';

const LeaveManagementTableFilter = () => {
  const filterClass = 'w-full h-[54px]';

  return (
    <Row gutter={16}>
      <Col span={8}>
        <DatePicker.RangePicker
          className={filterClass}
          separator={'-'}
          format="DD MMM YYYY"
        />
      </Col>
      <Col span={8}>
        <Select
          className="w-full h-[54px]"
          placeholder="Select Type"
          options={[
            { value: 'all', label: 'All' },
            { value: 'engagement', label: 'Engagement' },
          ]}
        />
      </Col>
      <Col span={8}>
        <Select
          className="w-full h-[54px]"
          placeholder="Select Status"
          options={[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
          ]}
        />
      </Col>
    </Row>
  );
};

export default LeaveManagementTableFilter;
