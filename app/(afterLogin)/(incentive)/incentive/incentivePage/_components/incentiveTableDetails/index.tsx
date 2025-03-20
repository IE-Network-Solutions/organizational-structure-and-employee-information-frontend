import { Col, Row } from 'antd';
import React from 'react';
import IncentiveUserInfo from './userInfo';
import IncentiveDetail from './incentiveDetail';
import Link from 'next/link';
import { IoArrowBack } from 'react-icons/io5';
import { useFetchIncentiveUserDetails } from '@/store/server/features/incentive/all/queries';

// interface Params {
//   id: string;
// }
// interface IncentiveTableDetailsProps {
//   params: Params;
// }

// function EmployeeDetails({ params: { id } }: IncentiveTableDetailsProps) {

function IncentiveTableDetails() {
  // { params: { id } }: IncentiveTableDetailsProps)
  const { data: userDetailData, isLoading: responseLoading } =
    useFetchIncentiveUserDetails('4986aee2-314d-46ce-9689-f800b7873324');

  return (
    <div className="m-2">
      <Link
        href={'/'}
        className="flex items-center justify-start space-x-3 mb-4 text-gray-800 "
      >
        <IoArrowBack />
        <span className="text-2xl font-bold">Detail</span>
      </Link>

      <Row gutter={[10, 10]} justify="space-between">
        <Col xs={24} sm={24} md={5} lg={5} xl={5}>
          <IncentiveUserInfo />
        </Col>
        <Col xs={24} sm={24} md={17} lg={17} xl={17}>
          <IncentiveDetail />
        </Col>
      </Row>
    </div>
  );
}

export default IncentiveTableDetails;
