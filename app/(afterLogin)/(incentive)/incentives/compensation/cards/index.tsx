import { Card, Col, Row, Tooltip } from 'antd';
import React from 'react';
import RecognizedEmployees from './images/recognizedEmployees.svg';
import Projects from './images/projects.svg';
import IncentiveAmount from './images/incentiveAmount.svg';
import Criterion from './images/criterion.svg';
import Image from 'next/image';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import { useGetAllIncentiveData } from '@/store/server/features/incentive/other/queries';
import { useTextFitFontSize } from '@/hooks/useTextFitFontSize';

const IncentiveCards: React.FC = () => {
  const { searchParams, currentPage, pageSize } = useIncentiveStore();
  const { data: incentiveData } = useGetAllIncentiveData(
    searchParams?.employee_name || '',
    searchParams?.byYear || ' ',
    searchParams?.bySession,
    searchParams?.byMonth || '',
    pageSize,
    currentPage,
  );

  const formattedAmount = (incentiveData?.data?.totalAmount || 0)
    .toString()
    .padStart(3, '0')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const { ref: amountRef, fontSizeClass } = useTextFitFontSize(
    formattedAmount,
    'text-3xl',
    'text-2xl',
  );

  return (
    <Row gutter={[10, 10]} className="m-1">
      <Col xs={24} sm={24} md={24} lg={12} xl={6}>
        <Card className="bg-[#FAFAFA]" bordered={false}>
          <div className="flex items-center mb-5">
            <Image
              src={RecognizedEmployees}
              alt="Recognized Employees"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full bg-[#7152F30D] flex justify-center items-center"
            />
          </div>
          <h3 className="text-sm font-normal text-gray-500 mb-2">
            Recognized Employees
          </h3>
          <p className="text-3xl font-bold text-gray-900 mb-4">
            {String(incentiveData?.data?.totalEmployee || 0).padStart(3, '0')}
          </p>
        </Card>
      </Col>
      <Col xs={24} sm={24} md={24} lg={12} xl={6}>
        <Card className="bg-[#FAFAFA]" bordered={false}>
          <div className="flex items-center mb-5">
            <Image
              src={Criterion}
              alt="Recognized Employees"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full bg-[#7152F30D] flex justify-center items-center"
            />
          </div>
          <h3 className="text-sm font-normal text-gray-500 mb-2">Criteria</h3>
          <p className="text-3xl font-bold text-gray-900 mb-4">
            {String(incentiveData?.data?.totalCriteria || 0).padStart(3, '0')}
          </p>
        </Card>
      </Col>
      <Col xs={24} sm={24} md={24} lg={12} xl={6}>
        <Card className="bg-[#FAFAFA]" bordered={false}>
          <div className="flex items-center mb-5">
            <Image
              src={IncentiveAmount}
              alt="Recognized Employees"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full bg-[#7152F30D] flex justify-center items-center"
            />
          </div>
          <h3 className="text-sm font-normal text-gray-500 mb-2">
            Incentive Amount
          </h3>
          <Tooltip title={incentiveData?.data?.totalAmount || 0}>
            <p
              ref={amountRef as React.RefObject<HTMLParagraphElement>}
              className={`inline-block font-bold text-gray-900 mb-3 w-full overflow-hidden whitespace-nowrap ${fontSizeClass}`}
              style={{ textOverflow: 'ellipsis' }}
            >
              {formattedAmount}
            </p>
          </Tooltip>
        </Card>
      </Col>
      <Col xs={24} sm={24} md={24} lg={12} xl={6}>
        <Card className="bg-[#FAFAFA]" bordered={false}>
          <div className="flex items-center mb-5">
            <Image
              src={Projects}
              alt="Recognized Employees"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full bg-[#7152F30D] flex justify-center items-center"
            />
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
