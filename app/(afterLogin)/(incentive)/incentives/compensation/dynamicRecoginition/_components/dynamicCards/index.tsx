import { Card, Col, Row, Tooltip } from 'antd';
import React from 'react';
import RecognizedEmployees from './images/recognizedEmployees.svg';
import Projects from './images/projects.svg';
import IncentiveAmount from './images/incentiveAmount.svg';
import Criterion from './images/criterion.svg';
import Image from 'next/image';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import { useGetIncentiveDataByRecognitionId } from '@/store/server/features/incentive/other/queries';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useTextFitFontSize } from '@/hooks/useTextFitFontSize';

interface DynamicIncentiveCardsProps {
  parentRecognitionId: string;
}

const DynamicIncentiveCards: React.FC<DynamicIncentiveCardsProps> = ({
  parentRecognitionId,
}) => {
  const { searchParams, currentPage, pageSize } = useIncentiveStore();
  const { isMobile, isTablet } = useIsMobile();
  const { data: dynamicRecognitionData } = useGetIncentiveDataByRecognitionId(
    parentRecognitionId,
    searchParams?.employee_name || '',
    searchParams?.byType || '',
    searchParams?.byYear || ' ',
    searchParams?.bySession,
    searchParams?.byMonth || '',
    pageSize,
    currentPage,
  );

  const getColumnSpan = () => {
    if (isMobile) return 24;
    if (isTablet) return 12;
    return 6;
  };

  const formattedAmount = (dynamicRecognitionData?.data?.totalAmount || 0)
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
      id="dynamic-incentive-cards-row"
      data-cy="dynamic-incentive-cards-row"
      gutter={[10, 10]}
      className="m-1"
    >
      <Col
        id="dynamic-incentive-cards-recognized-employees-col"
        data-cy="dynamic-incentive-cards-recognized-employees-col"
        xs={24}
        sm={24}
        md={getColumnSpan()}
        lg={6}
        xl={6}
      >
        <Card
          id="dynamic-incentive-cards-recognized-employees-card"
          data-cy="dynamic-incentive-cards-recognized-employees-card"
          className="bg-[#FAFAFA]"
          bordered={false}
        >
          <div
            id="dynamic-incentive-cards-recognized-employees-icon-wrapper"
            data-cy="dynamic-incentive-cards-recognized-employees-icon-wrapper"
            className="flex items-center mb-5"
          >
            <Image
              id="dynamic-incentive-cards-recognized-employees-icon"
              data-cy="dynamic-incentive-cards-recognized-employees-icon"
              src={RecognizedEmployees}
              alt="Recognized Employees"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full bg-[#7152F30D] flex justify-center items-center"
            />
          </div>
          <h3
            id="dynamic-incentive-cards-recognized-employees-label"
            data-cy="dynamic-incentive-cards-recognized-employees-label"
            className="text-sm font-normal text-gray-500 mb-2"
          >
            Recognized Employees
          </h3>
          <p
            id="dynamic-incentive-cards-recognized-employees-value"
            data-cy="dynamic-incentive-cards-recognized-employees-value"
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            {String(dynamicRecognitionData?.data?.totalEmployee || 0).padStart(
              3,
              '0',
            )}
          </p>
        </Card>
      </Col>
      <Col
        id="dynamic-incentive-cards-criterion-col"
        data-cy="dynamic-incentive-cards-criterion-col"
        xs={24}
        sm={24}
        md={getColumnSpan()}
        lg={6}
        xl={6}
      >
        <Card
          id="dynamic-incentive-cards-criterion-card"
          data-cy="dynamic-incentive-cards-criterion-card"
          className="bg-[#FAFAFA]"
          bordered={false}
        >
          <div
            id="dynamic-incentive-cards-criterion-icon-wrapper"
            data-cy="dynamic-incentive-cards-criterion-icon-wrapper"
            className="flex items-center mb-5"
          >
            <Image
              id="dynamic-incentive-cards-criterion-icon"
              data-cy="dynamic-incentive-cards-criterion-icon"
              src={Criterion}
              alt="Recognized Employees"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full bg-[#7152F30D] flex justify-center items-center"
            />
          </div>
          <h3
            id="dynamic-incentive-cards-criterion-label"
            data-cy="dynamic-incentive-cards-criterion-label"
            className="text-sm font-normal text-gray-500 mb-2"
          >
            Criterion
          </h3>
          <p
            id="dynamic-incentive-cards-criterion-value"
            data-cy="dynamic-incentive-cards-criterion-value"
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            {String(dynamicRecognitionData?.data?.totalCriteria || 0).padStart(
              3,
              '0',
            )}
          </p>
        </Card>
      </Col>
      <Col
        id="dynamic-incentive-cards-amount-col"
        data-cy="dynamic-incentive-cards-amount-col"
        xs={24}
        sm={24}
        md={getColumnSpan()}
        lg={6}
        xl={6}
      >
        <Card
          id="dynamic-incentive-cards-amount-card"
          data-cy="dynamic-incentive-cards-amount-card"
          className="bg-[#FAFAFA]"
          bordered={false}
        >
          <div
            id="dynamic-incentive-cards-amount-icon-wrapper"
            data-cy="dynamic-incentive-cards-amount-icon-wrapper"
            className="flex items-center mb-5"
          >
            <Image
              id="dynamic-incentive-cards-amount-icon"
              data-cy="dynamic-incentive-cards-amount-icon"
              src={IncentiveAmount}
              alt="Recognized Employees"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full bg-[#7152F30D] flex justify-center items-center"
            />
          </div>
          <h3
            id="dynamic-incentive-cards-amount-label"
            data-cy="dynamic-incentive-cards-amount-label"
            className="text-sm font-normal text-gray-500 mb-2"
          >
            Incentive Amount
          </h3>
          <Tooltip
            id="dynamic-incentive-cards-amount-tooltip"
            data-cy="dynamic-incentive-cards-amount-tooltip"
            title={dynamicRecognitionData?.data?.totalAmount || 0}
          >
            <p
              id="dynamic-incentive-cards-amount-value"
              data-cy="dynamic-incentive-cards-amount-value"
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
        id="dynamic-incentive-cards-projects-col"
        data-cy="dynamic-incentive-cards-projects-col"
        xs={24}
        sm={24}
        md={getColumnSpan()}
        lg={6}
        xl={6}
      >
        <Card
          id="dynamic-incentive-cards-projects-card"
          data-cy="dynamic-incentive-cards-projects-card"
          className="bg-[#FAFAFA]"
          bordered={false}
        >
          <div
            id="dynamic-incentive-cards-projects-icon-wrapper"
            data-cy="dynamic-incentive-cards-projects-icon-wrapper"
            className="flex items-center mb-5"
          >
            <Image
              id="dynamic-incentive-cards-projects-icon"
              data-cy="dynamic-incentive-cards-projects-icon"
              src={Projects}
              alt="Recognized Employees"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full bg-[#7152F30D] flex justify-center items-center"
            />
          </div>
          <h3
            id="dynamic-incentive-cards-projects-label"
            data-cy="dynamic-incentive-cards-projects-label"
            className="text-sm font-normal text-gray-500 mb-2"
          >
            Total Project
          </h3>
          <p
            id="dynamic-incentive-cards-projects-value"
            data-cy="dynamic-incentive-cards-projects-value"
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            010
          </p>
        </Card>
      </Col>
    </Row>
  );
};

export default DynamicIncentiveCards;
