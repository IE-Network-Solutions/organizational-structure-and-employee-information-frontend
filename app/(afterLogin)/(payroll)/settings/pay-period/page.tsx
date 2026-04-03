'use client';
import React from 'react';
import { Button, Card, Spin, Tooltip } from 'antd';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import PayPeriodSideBar from './_components/payPeriodSideBar';
import usePayPeriodStore from '@/store/uistate/features/payroll/settings/payPeriod';
import { useFetchActiveFiscalYearPayPeriods } from '@/store/server/features/payroll/setting/tax-rule/queries';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
//import { useChangePayPeriodStatus } from '@/store/server/features/payroll/setting/tax-rule/mutation';
import dayjs from 'dayjs';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CustomDrawer from './_components/customDrawer';
import useEditDrawerStore from '@/store/uistate/features/payroll/settings/drawer';
import { FaPlus } from 'react-icons/fa';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';
import { useIsMobile } from '@/hooks/useIsMobile';

const payPeriodTagTextColor = 'rgba(0, 0, 0, 0.7)';
const payPeriodTagBackgroundColor = 'rgba(0, 0, 0, 0.02)';

/** Shared dimensions/typography so date-range pill and status chip match height */
const payPeriodChipLayoutStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  height: 22,
  minHeight: 22,
  padding: '1px 8px',
  borderRadius: 4,
  border: '1px solid #D9D9D9',
  fontSize: 12,
  lineHeight: '18px',
  fontWeight: 400,
};

const pillStyle: React.CSSProperties = {
  ...payPeriodChipLayoutStyle,
  background: payPeriodTagBackgroundColor,
  color: payPeriodTagTextColor,
  userSelect: 'none',
  whiteSpace: 'nowrap',
};

const statusTagStyle: React.CSSProperties = {
  ...payPeriodChipLayoutStyle,
  color: payPeriodTagTextColor,
  backgroundColor: payPeriodTagBackgroundColor,
};

const editButtonStyle: React.CSSProperties = {
  height: 24,
  width: 24,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
  border: '1px solid #D9D9D9',
  background: '#fff',
};

const payPeriodCardShellStyle: React.CSSProperties = {
  width: '100%',
  minWidth: 0,
  borderRadius: 8,
  border: '1px solid #D9D9D9',
  boxShadow: 'none',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const payPeriodCardBodyStyle: React.CSSProperties = {
  padding: '10px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  flex: 1,
  minHeight: 0,
  boxSizing: 'border-box',
  overflow: 'hidden',
};

interface DataSource {
  key: string;
  id: string;
  startDate: string;
  endDate: string;
  range: string;
  month: string;
  status: string;
}
const PayPeriod = () => {
  const {
    setIsPayPeriodSidebarVisible,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
  } = usePayPeriodStore();
  const {
    setId,
    setStartDate,
    setEndDate,
    setStatus,
    setVisible,
    visible,
    reset,
  } = useEditDrawerStore();

  const { data: activeFiscalYear } = useGetActiveFiscalYears();
  //const { mutate: changePayPeriodStatus } = useChangePayPeriodStatus();
  const { data: payPeriods, isLoading } = useFetchActiveFiscalYearPayPeriods(
    activeFiscalYear?.id,
  );
  const { isMobile, isTablet } = useIsMobile();

  const handleAddPayPeriod = () => {
    setIsPayPeriodSidebarVisible(true);
  };
  // const handleDeletePayPeriod = (payPeriodId: string) => {
  //   deletePayPeriod(payPeriodId);
  // };

  const handleEdit = (record: any) => {
    setId(record.id);
    setStartDate(record.startDate);
    setEndDate(record.endDate);
    setStatus(record.status);
    setVisible(true);
  };

  // const onStatusChange = (record: any) => {
  //   changePayPeriodStatus({
  //     payPeriodId: record.id,
  //   });
  // };

  const dataSource: DataSource[] = Array.isArray(payPeriods)
    ? payPeriods.reverse().map((payPeriod: DataSource) => ({
        key: payPeriod.id,
        id: payPeriod.id,
        startDate: payPeriod.startDate,
        endDate: payPeriod.endDate,
        range: `${dayjs(payPeriod.startDate).format('MMMM D, YYYY')} - ${dayjs(payPeriod.endDate).format('MMMM D, YYYY')}`,
        month: dayjs(payPeriod.startDate).format('MMMM'),
        status: payPeriod.status,
      }))
    : [];
  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  const onPageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
    setCurrentPage(1);
  };

  const paginatedData = dataSource.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <BlockWrapper className="h-auto w-full bg-white px-3 pb-6 pt-3">
      <div
        id="payroll-payperiod-page-view-container"
        data-cy="payroll-payperiod-page-view-container"
        className="overflow-hidden"
      >
        <div
          id="payroll-payperiod-hidden-primary-action-target"
          data-cy="payroll-payperiod-hidden-primary-action-target"
          className="hidden"
        >
          <AccessGuard
            data-cy="payroll-payperiod-add-click-button-access-guard"
            permissions={[Permissions.CreatePayPeriod]}
          >
            <Button
              id="payroll-payperiod-add-click-button"
              data-cy="payroll-payperiod-add-click-button"
              type="primary"
              icon={<FaPlus />}
              onClick={handleAddPayPeriod}
            >
              <span
                id="payroll-payperiod-add-click-button-text"
                data-cy="payroll-payperiod-add-click-button-text"
              >
                Pay Period
              </span>
            </Button>
          </AccessGuard>
        </div>
        <Spin data-cy="payroll-payperiod-table-spinner" spinning={isLoading}>
          <div
            id="payroll-payperiod-grid-wrapper-view-container"
            data-cy="payroll-payperiod-grid-wrapper-view-container"
          >
            <div
              id="payroll-payperiod-grid-view-container"
              data-cy="payroll-payperiod-grid-view-container"
              className="mt-0 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {paginatedData.map((period) => {
                const isOpen = period.status === 'OPEN';
                return (
                  <Card
                    key={period.id}
                    id={`payroll-payperiod-card-${period.id}`}
                    data-cy={`payroll-payperiod-card-${period.id}`}
                    style={payPeriodCardShellStyle}
                    bodyStyle={payPeriodCardBodyStyle}
                  >
                    <div
                      id={`payroll-payperiod-card-header-${period.id}`}
                      data-cy={`payroll-payperiod-card-header-${period.id}`}
                      className="flex shrink-0 items-start justify-between"
                      style={{ gap: 8 }}
                    >
                      <h3
                        id={`payroll-payperiod-card-title-${period.id}`}
                        data-cy={`payroll-payperiod-card-title-${period.id}`}
                        className="m-0 min-w-0 flex-1 truncate text-base font-normal leading-tight"
                        style={{ color: '#000000' }}
                      >
                        {period.month}
                      </h3>
                      <AccessGuard
                        data-cy={`payroll-payperiod-card-actions-guard-${period.id}`}
                        permissions={[Permissions.UpdatePayPeriod]}
                      >
                        <Tooltip
                          data-cy={`payroll-payperiod-card-edit-tooltip-${period.id}`}
                          title="Edit"
                        >
                          <span
                            className="inline-flex shrink-0"
                            data-cy={`payroll-payperiod-card-edit-button-span-${period.id}`}
                          >
                            <button
                              id={`payroll-payperiod-card-edit-button-${period.id}`}
                              data-cy={`payroll-payperiod-card-edit-button-${period.id}`}
                              type="button"
                              style={editButtonStyle}
                              aria-label={`Edit ${period.month} pay period`}
                              onClick={() => handleEdit(period)}
                            >
                              <EditOutlinedIcon
                                style={{ fontSize: 14, color: '#595959' }}
                                data-cy={`payroll-payperiod-card-edit-icon-${period.id}`}
                              />
                            </button>
                          </span>
                        </Tooltip>
                      </AccessGuard>
                    </div>

                    <div
                      id={`payroll-payperiod-card-details-${period.id}`}
                      data-cy={`payroll-payperiod-card-details-${period.id}`}
                      className="flex min-h-0 shrink flex-wrap items-center"
                      style={{ gap: 6 }}
                    >
                      <span
                        id={`payroll-payperiod-card-range-${period.id}`}
                        data-cy={`payroll-payperiod-card-range-${period.id}`}
                        style={{
                          ...pillStyle,
                          whiteSpace: 'normal',
                          height: 'auto',
                          minHeight: 22,
                        }}
                        title={period.range}
                      >
                        {period.range}
                      </span>
                      <span
                        id={`payroll-payperiod-card-status-${period.id}`}
                        data-cy={`payroll-payperiod-card-status-${period.id}`}
                        className="shrink-0"
                        style={statusTagStyle}
                      >
                        {isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div
              id="payroll-payperiod-pagination-view-container"
              data-cy="payroll-payperiod-pagination-view-container"
              className="mt-4 pt-4"
            >
              {isMobile || isTablet ? (
                <CustomMobilePagination
                  data-cy="payroll-payperiod-mobile-pagination-view-component"
                  totalResults={dataSource?.length || 0}
                  pageSize={pageSize}
                  onChange={onPageChange}
                  onShowSizeChange={onPageSizeChange}
                />
              ) : (
                <CustomPagination
                  data-cy="payroll-payperiod-desktop-pagination-view-component"
                  current={currentPage}
                  total={dataSource?.length || 0}
                  pageSize={pageSize}
                  onChange={onPageChange}
                  onShowSizeChange={onPageSizeChange}
                />
              )}
            </div>
          </div>
        </Spin>
        <PayPeriodSideBar data-cy="payroll-payperiod-sidebar-view-component" />
        <CustomDrawer
          data-cy="payroll-payperiod-edit-drawer-view-component"
          visible={visible}
          onClose={() => {
            setVisible(false);
            reset();
          }}
        />
      </div>
    </BlockWrapper>
  );
};

export default PayPeriod;
