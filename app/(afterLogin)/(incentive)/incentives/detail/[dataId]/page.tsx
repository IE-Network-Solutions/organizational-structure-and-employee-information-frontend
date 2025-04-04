'use client';

import { Col, Row } from 'antd';
import React from 'react';
import IncentiveDetail from './_components/incentiveDetail';
import { IoArrowBack } from 'react-icons/io5';
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
    <div className="my-[72px] mx-10">
      <div
        onClick={handleGoBack}
        className="flex items-center justify-start space-x-2 mb-4 text-gray-800 "
      >
        <IoArrowBack />
        <span className="text-2xl font-bold">Detail</span>
      </div>
      <Row gutter={[10, 10]} justify="space-between">
        <Col xs={24} sm={24} md={5} lg={5} xl={5}>
          <IncentiveUserInfo detailId={dataId} />
        </Col>
        <Col xs={24} sm={24} md={17} lg={17} xl={17}>
          <IncentiveDetail detailId={dataId} />
        </Col>
      </Row>
    </div>
  );
}

export default Page;
