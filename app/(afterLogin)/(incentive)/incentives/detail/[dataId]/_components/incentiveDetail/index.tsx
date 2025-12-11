import { useFetchIncentiveUserDetails } from '@/store/server/features/incentive/all/queries';
import { Col, Row, Tag } from 'antd';
import React from 'react';

interface IncentiveUserInfoProps {
  detailId: string;
}
const IncentiveDetail: React.FC<IncentiveUserInfoProps> = ({ detailId }) => {
  const { data: userDetail, isLoading } =
    useFetchIncentiveUserDetails(detailId);

  return (
    <div id="incentive-detail-container" data-cy="incentive-detail-container" className="my-3">
      <Row id="incentive-detail-row" data-cy="incentive-detail-row" gutter={[10, 30]}>
        <Col id="incentive-detail-formula-label-col" data-cy="incentive-detail-formula-label-col" xs={12} sm={12} md={8} lg={8} xl={8}>
          Formula
        </Col>
        <Col id="incentive-detail-formula-value-col" data-cy="incentive-detail-formula-value-col" xs={12} sm={12} md={12} lg={12} xl={12}>
          <span id="incentive-detail-formula-value" data-cy="incentive-detail-formula-value" className="text-gray-900 font-semibold">
            {userDetail?.Formula?.expression
              ? userDetail?.Formula?.expression
              : '-'}
          </span>
        </Col>

        {/* {userDetail && Object.keys(userDetail).length > 0 ? (
          <> */}
        {userDetail?.breakdown &&
          Array.isArray(userDetail?.breakdown) &&
          userDetail?.breakdown?.map((item: any, index: number) => (
            <React.Fragment key={index} data-cy={`incentive-detail-breakdown-fragment-${index}`}>
              <Col
                id={`incentive-detail-breakdown-label-col-${index}`}
                data-cy={`incentive-detail-breakdown-label-col-${index}`}
                xs={12}
                sm={12}
                md={8}
                lg={8}
                xl={8}
                className="font-medium text-gray-600"
              >
                {item?.criterionKey}
              </Col>
              <Col id={`incentive-detail-breakdown-value-col-${index}`} data-cy={`incentive-detail-breakdown-value-col-${index}`} xs={12} sm={12} md={12} lg={12} xl={12}>
                <span id={`incentive-detail-breakdown-value-${index}`} data-cy={`incentive-detail-breakdown-value-${index}`} className="text-gray-900 font-semibold">
                  {item?.score ?? 'N/A'}
                </span>
              </Col>
            </React.Fragment>
          ))}

        <Col id="incentive-detail-bonus-label-col" data-cy="incentive-detail-bonus-label-col" xs={12} sm={12} md={8} lg={8} xl={8}>
          Bonus
        </Col>
        <Col id="incentive-detail-bonus-value-col" data-cy="incentive-detail-bonus-value-col" xs={12} sm={12} md={12} lg={12} xl={12}>
          <span id="incentive-detail-bonus-value" data-cy="incentive-detail-bonus-value" className="text-gray-900 font-semibold">
            {userDetail?.Bonus}
          </span>
        </Col>
        <Col id="incentive-detail-status-label-col" data-cy="incentive-detail-status-label-col" xs={12} sm={12} md={8} lg={8} xl={8}>
          Status
        </Col>
        <Col id="incentive-detail-status-value-col" data-cy="incentive-detail-status-value-col" xs={12} sm={12} md={12} lg={12} xl={12}>
          <span id="incentive-detail-status-value-wrapper" data-cy="incentive-detail-status-value-wrapper" className="text-gray-900 font-semibold">
            <Tag
              id="incentive-detail-status-tag"
              data-cy="incentive-detail-status-tag"
              color={
                isLoading
                  ? '#D3E4F0'
                  : userDetail?.Status === false
                    ? '#FFEDEC'
                    : '#D3E4F0'
              }
              className={`px-4 py-1 text-sm font-bold rounded-xl ${
                isLoading
                  ? 'text-[#5EB4F0]'
                  : userDetail?.Status === false
                    ? 'text-[#E03137] bg-[#FFEDEC]'
                    : 'text-[#5EB4F0]'
              }`}
            >
              {isLoading
                ? '—'
                : userDetail?.Status === false
                  ? 'Not Paid'
                  : 'Paid'}
            </Tag>
          </span>
        </Col>
      </Row>
    </div>
  );
};

export default IncentiveDetail;
