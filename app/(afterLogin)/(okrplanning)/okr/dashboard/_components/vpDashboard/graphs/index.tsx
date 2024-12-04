import { Col, Row } from 'antd';
import React from 'react';
import ActualVsTargetChart from './actualVsTarget';
import CriteriaContributionChart from './criteriaContribution';

const VPGraph: React.FC = () => {
  return (
    <Row gutter={[16, 16]} className="mt-10">
      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
        <ActualVsTargetChart />
      </Col>
      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
        <CriteriaContributionChart />
      </Col>
    </Row>
  );
};

export default VPGraph;
