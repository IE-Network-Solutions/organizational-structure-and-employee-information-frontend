import React from 'react';
import VPPayCard from './vpCard';
import { Col, Row } from 'antd';
import LineGraph from './lineGraph';
import CriteriaDoughnut from './criteriaDoughnut';

interface VPChartProps {
  id?: string;
}
const VPChart: React.FC<VPChartProps> = ({ id }) => {
  return (
    <Row gutter={[16, 16]} className="mx-4 ">
      <Col xs={24} sm={24} md={24} lg={10} xl={10}>
        <Row gutter={[16, 16]} className="">
          <Col xs={24} sm={24} md={24} lg={24} xl={24} className="">
            <VPPayCard id={id} />{' '}
          </Col>
          <Col xs={24} sm={24} md={24} lg={24} xl={24} className="">
            <CriteriaDoughnut />
          </Col>
        </Row>
      </Col>
      <Col xs={24} sm={24} md={24} lg={14} xl={14} className="">
        <LineGraph id={id} />{' '}
      </Col>
    </Row>
  );
};

export default VPChart;
