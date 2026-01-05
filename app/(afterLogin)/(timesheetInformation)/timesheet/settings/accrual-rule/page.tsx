'use client';
import React, { useEffect } from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useGetAccrualRules } from '@/store/server/features/timesheet/accrualRule/queries';
import { TableColumnsType } from '@/types/table/table';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { Button, Table } from 'antd';
import NewAccrualRuleSidebar from './_components/newAccrualRuleSidebar';
import usePagination from '@/utils/usePagination';
import { DefaultTablePagination } from '@/utils/defaultTablePagination';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';

const Page = () => {
  const {
    page,
    limit,
    orderBy,
    orderDirection,
    setPage,
    setLimit,
    setOrderBy,
    setOrderDirection,
  } = usePagination();
  const { setIsShowNewAccrualRuleSidebar, isShowNewAccrualRuleSidebar } =
    useTimesheetSettingsStore();
  const { data, isFetching, refetch } = useGetAccrualRules({
    page,
    limit,
    orderBy,
    orderDirection,
  });
  const columns: TableColumnsType<any> = [
    {
      title: 'Accrual Rule',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (text: string) => (
        <div
          id="time-attendance-settings-accrual-rule-table-row-title"
          data-cy="time-attendance-settings-accrual-rule-table-row-title"
        >
          {text}
        </div>
      ),
    },
    {
      title: 'Accrual Period',
      dataIndex: 'period',
      key: 'period',
      render: (text: string) => (
        <div
          id="time-attendance-settings-accrual-rule-table-row-title"
          data-cy="time-attendance-settings-accrual-rule-table-row-title"
        >
          {text}
        </div>
      ),
    },
    {
      title: 'Submitted Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => (
        <div
          id="time-attendance-settings-accrual-rule-table-row-created-at"
          data-cy="time-attendance-settings-accrual-rule-table-row-created-at"
        >
          {dayjs(text).format(DATE_FORMAT)}
        </div>
      ),
    },
  ];

  const tableData = () => {
    return data
      ? data.items.map((item) => ({
          key: item.id,
          title: item.title,
          period: item.period,
          createdAt: item.createdAt,
        }))
      : [];
  };

  useEffect(() => {
    if (!isShowNewAccrualRuleSidebar) {
      refetch();
    }
  }, [isShowNewAccrualRuleSidebar]);

  return (
    <div
      className="p-5 rounded-2xl bg-white w-full h-full"
      id="time-attendance-settings-accrual-rule-container"
      data-cy="time-attendance-settings-accrual-rule-container"
    >
      <div
        className="flex items-center justify-between mb-4"
        id="time-attendance-settings-accrual-rule-header"
        data-cy="time-attendance-settings-accrual-rule-header"
      >
        <h1
          className="text-lg text-bold"
          id="time-attendance-settings-accrual-rule-title"
          data-cy="time-attendance-settings-accrual-rule-title"
        >
          Accrual Rule
        </h1>
        <AccessGuard
          permissions={[Permissions.CreateLeaveAccrual]}
          data-cy="time-attendance-settings-accrual-rule-add-button-access-guard"
        >
          <Button
            size="large"
            type="primary"
            id="time-attendance-settings-accrual-rule-add-button"
            data-cy="time-attendance-settings-accrual-rule-add-button"
            icon={
              <FaPlus data-cy="time-attendance-settings-accrual-rule-add-button-icon" />
            }
            className="h-10 w-10 sm:w-auto"
            onClick={() => setIsShowNewAccrualRuleSidebar(true)}
          >
            <span
              id="time-attendance-settings-accrual-rule-add-button-label"
              data-cy="time-attendance-settings-accrual-rule-add-button-label"
              className="hidden md:inline"
            >
              {' '}
              New Accrual Rule
            </span>
          </Button>
        </AccessGuard>
      </div>
      <div
        className="overflow-x-auto scrollbar-none w-full"
        id="time-attendance-settings-accrual-rule-table-container"
        data-cy="time-attendance-settings-accrual-rule-table-container"
      >
        <Table
          columns={columns}
          className=""
          loading={isFetching}
          dataSource={tableData()}
          pagination={DefaultTablePagination(data?.meta?.totalItems)}
          onChange={(pagination, filters, sorter: any) => {
            setPage(pagination.current ?? 1);
            setLimit(pagination.pageSize ?? 10);
            setOrderDirection(sorter['order']);
            setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
          }}
          id="time-attendance-settings-accrual-rule-table"
          data-cy="time-attendance-settings-accrual-rule-table"
        />
      </div>

      <NewAccrualRuleSidebar data-cy="time-attendance-settings-accrual-rule-sidebar" />
    </div>
  );
};

export default Page;
