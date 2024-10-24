import React from 'react';
import { Col, Row } from 'antd';
import IssuedAppreciation from '../performanceCard/issuedAppreciation';
import IssuedReprimand from '../performanceCard/issuedReprimand';
import ReceivedAppreciation from '../performanceCard/receivedAppreciation';
import ReceivedReprimand from '../performanceCard/receivedReprimand';

const PerformanceEvaluation: React.FC = () => {
  return (
    <div className="my-2">
      <Row gutter={[16, 16]} className="my-4">
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <IssuedReprimand />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <IssuedAppreciation />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <ReceivedReprimand />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <ReceivedAppreciation />
        </Col>
      </Row>
    </div>
  );
};

export default PerformanceEvaluation;
