import React from 'react';
import { Col, Row } from 'antd';
import IssuedAppreciation from '../performanceCard/issuedAppreciation';
import IssuedReprimand from '../performanceCard/issuedReprimand';
import ReceivedAppreciation from '../performanceCard/receivedAppreciation';
import ReceivedReprimand from '../performanceCard/receivedReprimand';
import { useGetPersonalRecognition } from '@/store/server/features/CFR/recognition/queries';

const PerformanceEvaluation: React.FC = () => {
  const { data: getPersonalRecognition } = useGetPersonalRecognition();

  return (
    <div className="my-2">
      <Row gutter={[16, 16]} className="my-4">
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <IssuedReprimand
            kpi={getPersonalRecognition?.feedbackIssued?.KPI?.reprimands || 0}
            engagement={
              getPersonalRecognition?.feedbackIssued?.Engagement?.reprimands ||
              0
            }
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <IssuedAppreciation
            kpi={
              getPersonalRecognition?.feedbackIssued?.KPI?.appreciations || 0
            }
            engagement={
              getPersonalRecognition?.feedbackIssued?.Engagement
                ?.appreciations || 0
            }
          />{' '}
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <ReceivedReprimand
            kpi={getPersonalRecognition?.feedbackReceived?.KPI?.reprimands || 0}
            engagement={
              getPersonalRecognition?.feedbackReceived?.Engagement
                ?.reprimands || 0
            }
          />{' '}
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <ReceivedAppreciation
            kpi={
              getPersonalRecognition?.feedbackReceived?.KPI?.appreciations || 0
            }
            engagement={
              getPersonalRecognition?.feedbackReceived?.Engagement
                ?.appreciations || 0
            }
          />{' '}
        </Col>
      </Row>
    </div>
  );
};

export default PerformanceEvaluation;
