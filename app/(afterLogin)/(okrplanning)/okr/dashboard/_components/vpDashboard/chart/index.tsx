import React from 'react';
import VPPayCard from './vpCard';
import { Col, Row } from 'antd';
import LineGraph from './lineGraph';

const VPChart: React.FC = () => {
  return (
    <Row gutter={[16, 18]}>
      <Col xs={24} sm={24} md={8} lg={8} xl={8}>
        <VPPayCard />
      </Col>
      <Col xs={24} sm={24} md={16} lg={16} xl={16}>
        <LineGraph />
      </Col>
    </Row>
  );
};

export default VPChart;
