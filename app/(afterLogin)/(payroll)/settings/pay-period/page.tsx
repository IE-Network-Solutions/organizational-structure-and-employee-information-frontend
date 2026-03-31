'use client';
import React from 'react';
import { Button, Spin, Tooltip } from 'antd';
import { EditOutlined } from '@ant-design/icons';
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
    <div
      id="payroll-payperiod-page-view-container"
      data-cy="payroll-payperiod-page-view-container"
      className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden"
    >
      <div
        id="payroll-payperiod-header-view-container"
        data-cy="payroll-payperiod-header-view-container"
        className="flex justify-between items-center px-6 py-5"
      >
        <h1
          id="payroll-payperiod-title-view-text"
          data-cy="payroll-payperiod-title-view-text"
          className="text-lg font-semibold text-gray-900"
        >
          Pay Period
        </h1>
        <div
          id="payroll-payperiod-header-action-spacer"
          data-cy="payroll-payperiod-header-action-spacer"
          className="hidden sm:block"
        />
      </div>
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
          className="px-6 pb-5"
        >
          <div
            id="payroll-payperiod-grid-view-container"
            data-cy="payroll-payperiod-grid-view-container"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {paginatedData.map((period) => {
              const isOpen = period.status === 'OPEN';
              return (
                <div
                  key={period.id}
                  id={`payroll-payperiod-card-${period.id}`}
                  data-cy={`payroll-payperiod-card-${period.id}`}
                  className="relative rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div
                    id={`payroll-payperiod-card-header-${period.id}`}
                    data-cy={`payroll-payperiod-card-header-${period.id}`}
                    className="mb-4 flex items-start justify-between"
                  >
                    <h3
                      id={`payroll-payperiod-card-title-${period.id}`}
                      data-cy={`payroll-payperiod-card-title-${period.id}`}
                      className="text-base font-medium text-gray-900"
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
                        <button
                          id={`payroll-payperiod-card-edit-button-${period.id}`}
                          data-cy={`payroll-payperiod-card-edit-button-${period.id}`}
                          className="rounded border border-gray-200 p-1 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
                          type="button"
                          aria-label={`Edit ${period.month} pay period`}
                          onClick={() => handleEdit(period)}
                        >
                          <EditOutlined
                            data-cy={`payroll-payperiod-card-edit-icon-${period.id}`}
                          />
                        </button>
                      </Tooltip>
                    </AccessGuard>
                  </div>

                  <div
                    id={`payroll-payperiod-card-details-${period.id}`}
                    data-cy={`payroll-payperiod-card-details-${period.id}`}
                    className="flex flex-wrap items-center gap-3"
                  >
                    <span
                      id={`payroll-payperiod-card-range-${period.id}`}
                      data-cy={`payroll-payperiod-card-range-${period.id}`}
                      className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600"
                    >
                      {period.range}
                    </span>
                    <span
                      id={`payroll-payperiod-card-status-${period.id}`}
                      data-cy={`payroll-payperiod-card-status-${period.id}`}
                      className={`inline-flex items-center rounded border px-2.5 py-1 text-[11px] font-medium ${
                        isOpen
                          ? 'border-green-200 bg-green-50 text-green-600'
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                      }`}
                    >
                      {isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            id="payroll-payperiod-pagination-view-container"
            data-cy="payroll-payperiod-pagination-view-container"
            className="border-t border-gray-100 mt-6 pt-4"
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
          (setVisible(false), reset());
        }}
      />
    </div>
  );
};

export default PayPeriod;
