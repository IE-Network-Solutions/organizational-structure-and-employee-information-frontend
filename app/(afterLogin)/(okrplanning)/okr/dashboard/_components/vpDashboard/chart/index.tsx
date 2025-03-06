import React from 'react';
import VPPayCard from './vpCard';
import { Col, Row } from 'antd';
import LineGraph from './lineGraph';

interface VPChartProps {
  id?: string;
}
const VPChart: React.FC<VPChartProps> = ({ id }) => {
  return (
    <Row gutter={[16, 18]}>
      <Col xs={24} sm={24} md={8} lg={8} xl={8}>
        <VPPayCard id={id} />
      </Col>
      <Col xs={24} sm={24} md={16} lg={16} xl={16}>
        <LineGraph id={id} />
      </Col>
    </Row>
  );
};

export default VPChart;
