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
    <div
      id="payroll-view-container"
      data-cy="payroll-view-container"
      className="mx-0 mt-3 mb-3"
    >
      <div
        id="payroll-view-header"
        data-cy="payroll-view-header"
        className="flex items-center justify-between"
      >
        <CustomBreadcrumb
          data-cy="payroll-view-breadcrumb"
          title="Incentive"
          subtitle="Generated Incentive Report"
        />
        <div
          id="payroll-view-operation-slot"
          data-cy="payroll-view-operation-slot"
        >
          {operationSlot}
        </div>
      </div>
      <div
        id="payroll-view-cards-container"
        data-cy="payroll-view-cards-container"
        className="mx-0 my-2"
      >
        <Row
          id="payroll-view-cards-row"
          data-cy="payroll-view-cards-row"
          gutter={[16, 16]}
        >
          {cardResponseLoading ? (
            <div
              id="payroll-view-cards-skeleton-container"
              data-cy="payroll-view-cards-skeleton-container"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full"
            >
              {[...Array(3)].map(
                /* eslint-disable-next-line @typescript-eslint/naming-convention */
                (_, index) => (
                  /*  eslint-enable-next-line @typescript-eslint/naming-convention */
                  <Card
                    id={`payroll-view-cards-skeleton-card-${index}`}
                    data-cy={`payroll-view-cards-skeleton-card-${index}`}
                    key={index}
                  >
                    <Skeleton
                      data-cy={`payroll-view-cards-skeleton-${index}`}
                      active
                      paragraph={{ rows: 4 }}
                      style={{ width: '100%', height: '40px' }}
                    />
                  </Card>
                ),
              )}
            </div>
          ) : (
            cardData?.items?.length > 0 &&
            cardData.items.map((items: IncentiveDetail, index: number) => (
              <Col
                id={`payroll-view-card-col-${index}`}
                data-cy={`payroll-view-card-col-${index}`}
                key={index}
                xs={24}
                sm={24}
                md={24}
                lg={8}
                xl={8}
              >
                <Link
                  id={`payroll-view-card-link-${index}`}
                  data-cy={`payroll-view-card-link-${index}`}
                  href={`/incentives/payroll-detail/${items?.parentRecognitionTypeId}`}
                >
                  <Card
                    id={`payroll-view-card-${index}`}
                    data-cy={`payroll-view-card-${index}`}
                    className="bg-[#FAFAFA]"
                    bordered={false}
                  >
                    <div
                      id={`payroll-view-card-header-${index}`}
                      data-cy={`payroll-view-card-header-${index}`}
                      className="flex flex-wrap items-start justify-between mb-0"
                    >
                      <Title
                        id={`payroll-view-card-title-${index}`}
                        data-cy={`payroll-view-card-title-${index}`}
                        level={5}
                      >
                        {getCardInformation(items?.sessionId)?.name ??
                          'Unknown'}
                      </Title>
                      {items?.isPaid ? (
                        <div
                          id={`payroll-view-card-paid-badge-${index}`}
                          data-cy={`payroll-view-card-paid-badge-${index}`}
                          className="rounded-xl bg-[#55C79033] py-1 px-6"
                        >
                          <span
                            id={`payroll-view-card-paid-text-${index}`}
                            data-cy={`payroll-view-card-paid-text-${index}`}
                            className="text-[#0CAF60] font-semibold text-md"
                          >
                            Paid
                          </span>
                        </div>
                      ) : (
                        <div
                          id={`payroll-view-card-not-paid-badge-${index}`}
                          data-cy={`payroll-view-card-not-paid-badge-${index}`}
                          className="rounded-xl bg-[#FFEDEC] py-1 px-4"
                        >
                          <span
                            id={`payroll-view-card-not-paid-text-${index}`}
                            data-cy={`payroll-view-card-not-paid-text-${index}`}
                            className="text-[#E03137] font-semibold text-md"
                          >
                            Not Paid
                          </span>
                        </div>
                      )}
                    </div>
                    <Divider
                      data-cy={`payroll-view-card-divider-${index}`}
                      className="mt-0"
                    />
                    {Array.isArray(items?.criteria) &&
                    items?.criteria.length > 0 ? (
                      items?.criteria.map((cat: IncentiveItem, idx: number) => (
                        <div
                          id={`payroll-view-card-criterion-${index}-${idx}`}
                          data-cy={`payroll-view-card-criterion-${index}-${idx}`}
                          key={idx}
                          className="bg-[#D3E4F0] rounded-xl my-3 py-2 px-3 inline-block mx-1"
                        >
                          <span
                            id={`payroll-view-card-criterion-text-${index}-${idx}`}
                            data-cy={`payroll-view-card-criterion-text-${index}-${idx}`}
                            className="text-[#1D9BF0] text-sm font-semibold"
                          >
                            {cat?.name}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div
                        id={`payroll-view-card-fixed-amount-${index}`}
                        data-cy={`payroll-view-card-fixed-amount-${index}`}
                        className="bg-[#D3E4F0] rounded-xl my-3 py-2 px-3 inline-block mx-1"
                      >
                        <span
                          id={`payroll-view-card-fixed-amount-text-${index}`}
                          data-cy={`payroll-view-card-fixed-amount-text-${index}`}
                          className="text-[#1D9BF0] text-sm font-semibold"
                        >
                          Fixed Amount
                        </span>
                      </div>
                    )}

                    <div
                      id={`payroll-view-card-footer-${index}`}
                      data-cy={`payroll-view-card-footer-${index}`}
                      className="flex flex-wrap items-center justify-between mt-3"
                    >
                      <span
                        id={`payroll-view-card-amount-${index}`}
                        data-cy={`payroll-view-card-amount-${index}`}
                        className="text-[16px] font-semibold text-[#687588]"
                      >
                        {Number(items?.totalAmount || 0).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}{' '}
                        ETB
                      </span>
                      <span
                        id={`payroll-view-card-employees-${index}`}
                        data-cy={`payroll-view-card-employees-${index}`}
                        className="text-sm font-normal text-[#687588]"
                      >
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
        data-cy="payroll-view-pagination"
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
