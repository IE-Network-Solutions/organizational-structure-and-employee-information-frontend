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
      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
        <VPPayCard id={id} />
      </Col>
      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
        <LineGraph id={id} />
      </Col>
    </Row>
  );
};

export default VPChart;
