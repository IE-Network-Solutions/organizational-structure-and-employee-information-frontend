import { useFetchIncentiveUserDetails } from '@/store/server/features/incentive/all/queries';
import { Col, Row, Tag } from 'antd';
import React from 'react';

interface IncentiveUserInfoProps {
  detailId: string;
}
const IncentiveDetail: React.FC<IncentiveUserInfoProps> = ({ detailId }) => {
  const { data: userDetail } = useFetchIncentiveUserDetails(detailId);
  return (
    <div className="my-3">
      <Row gutter={[10, 30]}>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          Formula
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <span className="text-gray-900 font-semibold">
            {userDetail?.Formula?.expression}
          </span>
        </Col>

        {/* {userDetail && Object.keys(userDetail).length > 0 ? (
          <> */}
        {userDetail?.breakdown &&
          Array.isArray(userDetail?.breakdown) &&
          userDetail?.breakdown?.map((item: any, index: number) => (
            <React.Fragment key={index}>
              <Col
                xs={24}
                sm={24}
                md={8}
                lg={8}
                xl={8}
                className="font-medium text-gray-600"
              >
                {item?.criterionKey}
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <span className="text-gray-900 font-semibold">
                  {item?.score ?? 'N/A'}
                </span>
              </Col>
            </React.Fragment>
          ))}
        {/* </> */}
        {/* // ) : (
        //   <Col span={24} className="text-center text-gray-500">
        //     No user details available
        //   </Col>
        // )} */}
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          Bonus
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <span className="text-gray-900 font-semibold">
            {userDetail?.Bonus}
          </span>
        </Col>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          Status
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <span className="text-gray-900 font-semibold">
            <Tag
              color={userDetail?.Status === false ? 'red' : '#D3E4F0'}
              className={`px-4 py-1 text-sm font-bold ${
                userDetail?.Status === false
                  ? 'text-white bg-red-500'
                  : 'text-[#5EB4F0]'
              } rounded-xl`}
            >
              {userDetail?.Status === false ? 'Not Paid' : 'Paid'}
            </Tag>
          </span>
        </Col>
      </Row>
    </div>
  );
};

export default IncentiveDetail;
