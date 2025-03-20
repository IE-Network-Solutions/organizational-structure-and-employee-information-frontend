import CustomBreadcrumb from '@/components/common/breadCramp';
import { Card, Col, Divider, Row, Typography } from 'antd';
import React, { ReactNode } from 'react';
import GenerateModal from './generateModal';
import { useAllIncentiveCards } from '@/store/server/features/incentive/all/queries';
import {
  RecordType,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import IncentivePagination from '@/app/(afterLogin)/(incentive)/_components/incentivePagination';
import IncentiveTableDetails from '../../incentiveTableDetails';

const { Title } = Typography;

interface PayRoleViewProps {
  operationSlot: ReactNode;
}
const PayRoleView: React.FC<PayRoleViewProps> = ({ operationSlot }) => {
  const { data: cardData } = useAllIncentiveCards();
  const { currentPage, setCurrentPage, pageSize, setPageSize } =
    useIncentiveStore();
  return (
    <div className="m-3">
      <div className="flex items-center justify-between">
        <CustomBreadcrumb
          title="Incentive"
          subtitle="Generated Incentive Report"
        />
        <div>{operationSlot}</div>
      </div>
      <div className="mx-3 my-2">
        <Row gutter={[16, 16]}>
          {cardData &&
            cardData?.length &&
            cardData?.map((items: RecordType) => (
              <Col key={items?.id} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Card className="bg-[#FAFAFA]" bordered={false}>
                  <div className="flex flex-wrap items-start justify-between mb-0">
                    <Title level={5}>{items?.fiscalYear}</Title>
                    {items?.status === 'Paid' ? (
                      <div className="rounded-xl bg-[#55C79033] py-1 px-6 ">
                        <span className="text-[#0CAF60] font-md text-md">
                          {items?.status}
                        </span>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-[#FFEDEC] py-1 px-4 ">
                        <span className="text-[#E03137] font-md text-md">
                          {items?.status}
                        </span>
                      </div>
                    )}
                  </div>
                  <Divider className="mt-0" />
                  {items?.categories.map((cat, index: number) => (
                    <div
                      key={index}
                      className="bg-[#D3E4F0] rounded-xl my-3 py-2 px-3 inline-block mx-1"
                    >
                      <span className="text-[#1D9BF0] text-sm font-md ">
                        {cat}
                      </span>
                    </div>
                  ))}
                  <div className="flex flex-wrap items-center justify-between mt-3">
                    <span className="text-[16px] font-semibold text-[#687588]">
                      {items?.totalAmount}
                    </span>
                    <span className="text-sm font-normal text-[#687588]">
                      {items?.employeeCount} {''} Employees
                    </span>
                  </div>
                </Card>
              </Col>
            ))}
        </Row>
      </div>
      <IncentiveTableDetails />
      <IncentivePagination
        current={currentPage}
        total={10}
        // total={positions?.meta?.totalItems ?? 1}
        pageSize={pageSize}
        onChange={(page: number, pageSize: number) => {
          setCurrentPage(page);
          setPageSize(pageSize);
        }}
        onShowSizeChange={(size: number) => {
          setPageSize(size);
          setCurrentPage(pageSize);
        }}
      />
      <GenerateModal />
    </div>
  );
};

export default PayRoleView;
