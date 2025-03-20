import { Col, Row, Tag } from 'antd';
import React from 'react';

const bonusData = {
  Formula: '(Earned schedule / Actual Time) * Budget',
  'Earned Schedule': 326,
  'Actual Time': 326,
  Budget: 326,
  Bonus: '20,000 ETB',
  Status: 'Paid',
};

const IncentiveDetail: React.FC = () => {
  return (
    <div className="my-3">
      <Row gutter={[10, 30]}>
        {Object.entries(bonusData).map(([key, value]) => (
          <React.Fragment key={key}>
            <Col
              xs={24}
              sm={24}
              md={8}
              lg={8}
              xl={8}
              className="font-medium text-gray-600"
            >
              {key}
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              {key === 'Status' ? (
                <Tag
                  color="#D3E4F0"
                  className="px-4 py-1 text-sm font-bold text-[#5EB4F0] rounded-xl"
                >
                  {value}
                </Tag>
              ) : (
                <span className="text-gray-900 font-semibold">
                  {typeof value === 'string' ? value : value.toString()}
                </span>
              )}
            </Col>
          </React.Fragment>
        ))}
      </Row>
    </div>
  );
};

export default IncentiveDetail;
