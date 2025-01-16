import { Card, Col, Row } from 'antd';
import React from 'react';
import { BiAward } from 'react-icons/bi';

const IncentiveCards: React.FC = () => {
  return (
    <Row gutter={[16, 10]}>
      <Col xs={24} sm={24} md={24} lg={6} xl={6}>
        <Card className="bg-[#FAFAFA]" bordered={false}>
          <div className="flex items-center mb-7">
            <div className="w-10 h-8 rounded-full bg-indigo-50 flex justify-center items-center">
              <BiAward size={25} fill="#0BA259" />
            </div>
          </div>
          <h3 className="text-sm font-normal text-gray-500 mb-2">
            Recognized Employees
          </h3>
          <p className="text-3xl font-bold text-gray-900 mb-4">010</p>
        </Card>
      </Col>
      <Col xs={24} sm={24} md={24} lg={6} xl={6}>
        <Card className="bg-[#FAFAFA]" bordered={false}>
          <div className="flex items-center mb-7">
            <div className="w-10 h-8 rounded-full bg-indigo-50 flex justify-center items-center">
              <BiAward size={25} fill="#0BA259" />
            </div>
          </div>
          <h3 className="text-sm font-normal text-gray-500 mb-2">Criteria</h3>
          <p className="text-3xl font-bold text-gray-900 mb-4">010</p>
        </Card>
      </Col>
      <Col xs={24} sm={24} md={24} lg={6} xl={6}>
        <Card className="bg-[#FAFAFA]" bordered={false}>
          <div className="flex items-center mb-7">
            <div className="w-10 h-8 rounded-full bg-indigo-50 flex justify-center items-center">
              <BiAward size={25} fill="#0BA259" />
            </div>
          </div>
          <h3 className="text-sm font-normal text-gray-500 mb-2">
            Incentive Amount
          </h3>
          <p className="text-3xl font-bold text-gray-900 mb-4">010</p>
        </Card>
      </Col>
      <Col xs={24} sm={24} md={24} lg={6} xl={6}>
        <Card className="bg-[#FAFAFA]" bordered={false}>
          <div className="flex items-center mb-7">
            <div className="w-10 h-8 rounded-full bg-indigo-50 flex justify-center items-center">
              <BiAward size={25} fill="#0BA259" />
            </div>
          </div>
          <h3 className="text-sm font-normal text-gray-500 mb-2">
            Total Project
          </h3>
          <p className="text-3xl font-bold text-gray-900 mb-4">010</p>
        </Card>
      </Col>
    </Row>
  );
};

export default IncentiveCards;
