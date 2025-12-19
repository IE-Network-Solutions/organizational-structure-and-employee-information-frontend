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
    <Row
      id="incentive-cards-row"
      data-cy="incentive-cards-row"
      gutter={[10, 10]}
      className="m-1"
    >
      <Col
        id="incentive-cards-recognized-employees-col"
        data-cy="incentive-cards-recognized-employees-col"
        xs={24}
        sm={24}
        md={24}
        lg={12}
        xl={6}
      >
        <Card
          id="incentive-cards-recognized-employees-card"
          data-cy="incentive-cards-recognized-employees-card"
          className="bg-[#FAFAFA]"
          bordered={false}
        >
          <div
            id="incentive-cards-recognized-employees-icon-wrapper"
            data-cy="incentive-cards-recognized-employees-icon-wrapper"
            className="flex items-center mb-5"
          >
            <Image
              id="incentive-cards-recognized-employees-icon"
              data-cy="incentive-cards-recognized-employees-icon"
              src={RecognizedEmployees}
              alt="Recognized Employees"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full bg-[#7152F30D] flex justify-center items-center"
            />
          </div>
          <h3
            id="incentive-cards-recognized-employees-label"
            data-cy="incentive-cards-recognized-employees-label"
            className="text-sm font-normal text-gray-500 mb-2"
          >
            Recognized Employees
          </h3>
          <p
            id="incentive-cards-recognized-employees-value"
            data-cy="incentive-cards-recognized-employees-value"
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            {String(incentiveData?.data?.totalEmployee || 0).padStart(3, '0')}
          </p>
        </Card>
      </Col>
      <Col
        id="incentive-cards-criteria-col"
        data-cy="incentive-cards-criteria-col"
        xs={24}
        sm={24}
        md={24}
        lg={12}
        xl={6}
      >
        <Card
          id="incentive-cards-criteria-card"
          data-cy="incentive-cards-criteria-card"
          className="bg-[#FAFAFA]"
          bordered={false}
        >
          <div
            id="incentive-cards-criteria-icon-wrapper"
            data-cy="incentive-cards-criteria-icon-wrapper"
            className="flex items-center mb-5"
          >
            <Image
              id="incentive-cards-criteria-icon"
              data-cy="incentive-cards-criteria-icon"
              src={Criterion}
              alt="Recognized Employees"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full bg-[#7152F30D] flex justify-center items-center"
            />
          </div>
          <h3
            id="incentive-cards-criteria-label"
            data-cy="incentive-cards-criteria-label"
            className="text-sm font-normal text-gray-500 mb-2"
          >
            Criteria
          </h3>
          <p
            id="incentive-cards-criteria-value"
            data-cy="incentive-cards-criteria-value"
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            {String(incentiveData?.data?.totalCriteria || 0).padStart(3, '0')}
          </p>
        </Card>
      </Col>
      <Col
        id="incentive-cards-amount-col"
        data-cy="incentive-cards-amount-col"
        xs={24}
        sm={24}
        md={24}
        lg={12}
        xl={6}
      >
        <Card
          id="incentive-cards-amount-card"
          data-cy="incentive-cards-amount-card"
          className="bg-[#FAFAFA]"
          bordered={false}
        >
          <div
            id="incentive-cards-amount-icon-wrapper"
            data-cy="incentive-cards-amount-icon-wrapper"
            className="flex items-center mb-5"
          >
            <Image
              id="incentive-cards-amount-icon"
              data-cy="incentive-cards-amount-icon"
              src={IncentiveAmount}
              alt="Recognized Employees"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full bg-[#7152F30D] flex justify-center items-center"
            />
          </div>
          <h3
            id="incentive-cards-amount-label"
            data-cy="incentive-cards-amount-label"
            className="text-sm font-normal text-gray-500 mb-2"
          >
            Incentive Amount
          </h3>
          <Tooltip
            id="incentive-cards-amount-tooltip"
            data-cy="incentive-cards-amount-tooltip"
            title={incentiveData?.data?.totalAmount || 0}
          >
            <p
              id="incentive-cards-amount-value"
              data-cy="incentive-cards-amount-value"
              ref={amountRef as React.RefObject<HTMLParagraphElement>}
              className={`inline-block font-bold text-gray-900 mb-3 w-full overflow-hidden whitespace-nowrap ${fontSizeClass}`}
              style={{ textOverflow: 'ellipsis' }}
            >
              {formattedAmount}
            </p>
          </Tooltip>
        </Card>
      </Col>
      <Col
        id="incentive-cards-projects-col"
        data-cy="incentive-cards-projects-col"
        xs={24}
        sm={24}
        md={24}
        lg={12}
        xl={6}
      >
        <Card
          id="incentive-cards-projects-card"
          data-cy="incentive-cards-projects-card"
          className="bg-[#FAFAFA]"
          bordered={false}
        >
          <div
            id="incentive-cards-projects-icon-wrapper"
            data-cy="incentive-cards-projects-icon-wrapper"
            className="flex items-center mb-5"
          >
            <Image
              id="incentive-cards-projects-icon"
              data-cy="incentive-cards-projects-icon"
              src={Projects}
              alt="Recognized Employees"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full bg-[#7152F30D] flex justify-center items-center"
            />
          </div>
          <h3
            id="incentive-cards-projects-label"
            data-cy="incentive-cards-projects-label"
            className="text-sm font-normal text-gray-500 mb-2"
          >
            Total Project
          </h3>
          <p
            id="incentive-cards-projects-value"
            data-cy="incentive-cards-projects-value"
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            010
          </p>
        </Card>
      </Col>
    </Row>
  );
};

export default IncentiveCards;
