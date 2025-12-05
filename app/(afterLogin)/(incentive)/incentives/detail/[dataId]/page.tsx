'use client';

import { Col, Row } from 'antd';
import React from 'react';
import IncentiveDetail from './_components/incentiveDetail';
import { IoChevronBackOutline } from 'react-icons/io5';
import IncentiveUserInfo from './_components/userInfo';
import { useRouter } from 'next/navigation';

interface Params {
  dataId: string;
}
interface IncentiveTableDetailsProps {
  params: Params;
}

function Page({ params: { dataId } }: IncentiveTableDetailsProps) {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div id="incentive-detail-page-container" data-cy="incentive-detail-page-container" className="my-[72px] mx-4 sm:mx-10">
      <div
        id="incentive-detail-page-back-button"
        data-cy="incentive-detail-page-back-button"
        onClick={handleGoBack}
        className="flex items-center justify-start space-x-1 mb-4 text-gray-800 "
      >
        <IoChevronBackOutline id="incentive-detail-page-back-icon" data-cy="incentive-detail-page-back-icon" className="text-xl text-gray-500" />
        <span id="incentive-detail-page-back-text" data-cy="incentive-detail-page-back-text" className="text-2xl font-bold">Detail</span>
      </div>
      <Row id="incentive-detail-page-content-row" data-cy="incentive-detail-page-content-row" gutter={[10, 10]} justify="space-between">
        <Col id="incentive-detail-page-user-info-col" data-cy="incentive-detail-page-user-info-col" xs={24} sm={24} md={24} lg={24} xl={7}>
          <IncentiveUserInfo data-cy="incentive-detail-page-user-info" detailId={dataId} />
        </Col>
        <Col id="incentive-detail-page-detail-col" data-cy="incentive-detail-page-detail-col" xs={24} sm={24} md={24} lg={24} xl={16}>
          <IncentiveDetail data-cy="incentive-detail-page-detail" detailId={dataId} />
        </Col>
      </Row>
    </div>
  );
}

export default Page;
