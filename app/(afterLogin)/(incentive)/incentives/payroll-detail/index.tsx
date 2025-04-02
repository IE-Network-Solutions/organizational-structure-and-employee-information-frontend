import CustomBreadcrumb from '@/components/common/breadCramp';
import { Card, Col, Divider, Row, Skeleton, Typography } from 'antd';
import React, { ReactNode } from 'react';
import GenerateModal from './generateModal';
import { useAllIncentiveCards } from '@/store/server/features/incentive/all/queries';
import {
  IncentiveDetail,
  IncentiveItem,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import IncentivePagination from '@/app/(afterLogin)/(incentive)/_components/incentivePagination';
import Link from 'next/link';
import { useFetchIncentiveSessions } from '@/store/server/features/incentive/project/queries';

const { Title } = Typography;

interface PayRoleViewProps {
  operationSlot: ReactNode;
}
const PayRoleView: React.FC<PayRoleViewProps> = ({ operationSlot }) => {
  const { data: cardData, isLoading: cardResponseLoading } =
    useAllIncentiveCards();
  const { data: allSessions } = useFetchIncentiveSessions();
  const { currentPage, setCurrentPage, pageSize, setPageSize } =
    useIncentiveStore();

  const getCardInformation = (id: string) => {
    const user = allSessions?.items?.find((item: any) => item?.id === id);
    return user;
  };
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
          {cardResponseLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map(
                /* eslint-disable-next-line @typescript-eslint/naming-convention */
                (_, index) => (
                  /*  eslint-enable-next-line @typescript-eslint/naming-convention */
                  <Card key={index}>
                    <Skeleton
                      active
                      paragraph={{ rows: 4 }}
                      style={{ width: '200px', height: '40px' }}
                    />
                  </Card>
                ),
              )}
            </div>
          ) : (
            cardData?.items?.length > 0 &&
            cardData.items.map((items: IncentiveDetail, index: number) => (
              <Col key={index} xs={24} sm={24} md={24} lg={8} xl={8}>
                <Link
                  href={`/incentive/payroll-detail/${items?.parentRecognitionTypeId}`}
                >
                  <Card className="bg-[#FAFAFA]" bordered={false}>
                    <div className="flex flex-wrap items-start justify-between mb-0">
                      <Title level={5}>
                        {getCardInformation(items?.sessionId)?.name ??
                          'Unknown'}
                      </Title>
                      {items?.isPaid ? (
                        <div className="rounded-xl bg-[#55C79033] py-1 px-6">
                          <span className="text-[#0CAF60] font-semibold text-md">
                            Paid
                          </span>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-[#FFEDEC] py-1 px-4">
                          <span className="text-[#E03137] font-semibold text-md">
                            Not Paid
                          </span>
                        </div>
                      )}
                    </div>
                    <Divider className="mt-0" />
                    {items?.criteria?.map((cat: IncentiveItem, idx: number) => (
                      <div
                        key={idx}
                        className="bg-[#D3E4F0] rounded-xl my-3 py-2 px-3 inline-block mx-1"
                      >
                        <span className="text-[#1D9BF0] text-sm font-semibold">
                          {cat?.name}
                        </span>
                      </div>
                    ))}
                    <div className="flex flex-wrap items-center justify-between mt-3">
                      <span className="text-[16px] font-semibold text-[#687588]">
                        {items?.totalAmount || 0} ETB
                      </span>
                      <span className="text-sm font-normal text-[#687588]">
                        {items?.totalEmployees || 0}{' '}
                        {items?.totalEmployees === 1 ? 'Employee' : 'Employees'}
                      </span>
                    </div>
                  </Card>
                </Link>
              </Col>
            ))
          )}
        </Row>
      </div>

      <IncentivePagination
        current={currentPage}
        total={cardData?.meta?.totalItems ?? 1}
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
