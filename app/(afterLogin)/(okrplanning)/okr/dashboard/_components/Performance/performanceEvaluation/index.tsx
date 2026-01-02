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
    <div
      className="my-2"
      id="okr-performance-evaluation-container-display-div"
      data-cy="okr-performance-evaluation-container-display-div"
    >
      <Row
        gutter={[16, 16]}
        className="my-4"
        id="okr-performance-evaluation-top-row-display-row"
        data-cy="okr-performance-evaluation-top-row-display-row"
      >
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={12}
          xl={12}
          id="okr-performance-evaluation-issued-reprimand-col-display-col"
          data-cy="okr-performance-evaluation-issued-reprimand-col-display-col"
        >
          <IssuedReprimand
            data-cy="okr-performance-evaluation-issued-reprimand-card"
            kpi={getPersonalRecognition?.feedbackIssued?.KPI?.reprimands || 0}
            engagement={
              getPersonalRecognition?.feedbackIssued?.Engagement?.reprimands ||
              0
            }
          />
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={12}
          xl={12}
          id="okr-performance-evaluation-issued-appreciation-col-display-col"
          data-cy="okr-performance-evaluation-issued-appreciation-col-display-col"
        >
          <IssuedAppreciation
            data-cy="okr-performance-evaluation-issued-appreciation-card"
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
      <Row
        gutter={[16, 16]}
        id="okr-performance-evaluation-bottom-row-display-row"
        data-cy="okr-performance-evaluation-bottom-row-display-row"
      >
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={12}
          xl={12}
          id="okr-performance-evaluation-received-reprimand-col-display-col"
          data-cy="okr-performance-evaluation-received-reprimand-col-display-col"
        >
          <ReceivedReprimand
            data-cy="okr-performance-evaluation-received-reprimand-card"
            kpi={getPersonalRecognition?.feedbackReceived?.KPI?.reprimands || 0}
            engagement={
              getPersonalRecognition?.feedbackReceived?.Engagement
                ?.reprimands || 0
            }
          />{' '}
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={12}
          xl={12}
          id="okr-performance-evaluation-received-appreciation-col-display-col"
          data-cy="okr-performance-evaluation-received-appreciation-col-display-col"
        >
          <ReceivedAppreciation
            data-cy="okr-performance-evaluation-received-appreciation-card"
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
