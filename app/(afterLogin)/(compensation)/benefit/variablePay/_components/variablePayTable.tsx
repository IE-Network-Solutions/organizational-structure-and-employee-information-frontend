import React, { useState } from 'react';
import { Spin, Table, Progress, Button } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import { useVariablePayStore } from '@/store/uistate/features/compensation/benefit';
import VariablePayModal from './VariablePayModal';
import Link from 'next/link';
import { FaRegEye, FaEyeSlash } from 'react-icons/fa';
import { AiOutlineReload } from 'react-icons/ai';
import {
  useGetActiveMonth,
  useGetVariablePay,
} from '@/store/server/features/payroll/payroll/queries';
import {
  useGetAllCalculatedVpScore,
  useGetVPScore,
  useGetVpScoreCalculate,
} from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import CustomPagination from '@/components/customPagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';

const ExpandedVPDetails = ({ userId }: { userId: string }) => {
  const { data: vpScore, isLoading } = useGetVPScore(userId);
  const {
    isLoading: isRefreshLoading,
    refetch,
    isRefetching,
  } = useGetVpScoreCalculate(userId, false);

  if (isLoading) {
    return (
      <div className="flex min-h-[136px] w-full items-center justify-center">
        <Spin />
      </div>
    );
  }

  const totalScore = vpScore?.score ?? 0;
  const previousScore = vpScore?.previousScore ?? 0;
  const change = (totalScore - previousScore).toFixed(2);
  const isNegative = totalScore - previousScore < 0;
  const criteria = vpScore?.criteria || [];

  const totalWeight =
    criteria.reduce((acc: number, c: any) => acc + Number(c.weight || 0), 0) ||
    40;
  const totalPercentage = Math.min((totalScore / totalWeight) * 100, 100);

  // We ensure we only map exactly 3 criteria to match the 4-card layout (1 Total + 3 Criteria)
  const displayCriteria = criteria.slice(0, 3);
  // Pad if less than 3 criteria are returned to maintain the layout visually (optional, but robust)
  while (displayCriteria.length < 3) {
    displayCriteria.push({ name: 'N/A', score: 0, weight: 1 });
  }

  return (
    <div className="w-full">
      <style>{`
        @keyframes slideDownCards {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDownCards {
          animation: slideDownCards 0.3s ease-out forwards;
        }
      `}</style>
      <div className="grid grid-cols-4 gap-4 lg:gap-6 w-full items-center animate-slideDownCards">
        {/* Card 1: Total VP */}
        <div
          className="bg-white border border-gray-200 shadow-sm flex flex-col justify-between p-4 w-full max-w-[256px]"
          style={{ height: '136px', borderRadius: '8px' }}
        >
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-[13px] font-medium">
              Total VP
            </span>
            <span className="text-gray-500 text-[13px] font-medium">
              Out of {totalWeight}%
            </span>
          </div>

          <div className="flex items-center gap-10">
            <span className="text-[28px] font-bold text-gray-800 leading-none">
              {Number(totalScore).toFixed(2)}
            </span>
            <Progress
              percent={totalPercentage}
              showInfo={false}
              strokeColor="#1e3a8a"
              trailColor="#f3f4f6"
              className="flex-1 m-0 [&_.ant-progress-inner]:!bg-gray-100"
              strokeWidth={8}
              strokeLinecap="round"
            />
          </div>

          <div className="flex justify-between items-center">
            <span
              className={`text-[12px] font-medium ${!isNegative ? 'text-green-500' : 'text-red-500'}`}
            >
              {!isNegative ? '+' : ''}
              {change}{' '}
              <span className="text-gray-400 font-normal">vs last month</span>
            </span>
            <Button
              type="text"
              icon={
                <AiOutlineReload
                  className={
                    isRefreshLoading || isRefetching ? 'animate-spin' : ''
                  }
                  size={14}
                />
              }
              onClick={() => refetch()}
              disabled={isRefreshLoading || isRefetching}
              className="text-gray-500 hover:text-gray-700 border border-gray-200 flex items-center justify-center p-0 w-7 h-7 rounded bg-transparent shadow-none"
            />
          </div>
        </div>

        {/* Three Metric Cards */}
        {displayCriteria.map((card: any, index: number) => {
          const score = Number(card?.score ?? 0);
          const weight = Number(card?.weight ?? 1);
          const curPercentage = Math.min((score / weight) * 100, 100);

          return (
            <div
              key={index}
              className="bg-white border border-gray-200 shadow-sm flex flex-col justify-between p-4 w-full max-w-[256px]"
              style={{ height: '108px', borderRadius: '8px' }}
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-[13px] font-medium truncate pr-2">
                  {card?.name || 'OKR'}
                </span>
                <span className="text-gray-500 text-[13px] font-medium flex-shrink-0">
                  Out of {weight.toFixed(2)}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Progress
                  percent={curPercentage}
                  showInfo={false}
                  strokeColor="#1c3ca5"
                  trailColor="#f3f4f6"
                  className="flex-1 m-0 [&_.ant-progress-inner]:!bg-gray-100"
                  strokeWidth={8}
                  strokeLinecap="round"
                />
                <span className="text-gray-600 text-[13px] font-medium w-8 text-right">
                  {curPercentage.toFixed(0)}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[12px] text-green-500 font-medium">
                  +0.00{' '}
                  <span className="text-gray-400 font-normal">
                    vs last month
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const VariablePayTable = () => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const { currentPage, pageSize, searchParams, setCurrentPage, setPageSize } =
    useVariablePayStore();
  const { isMobile, isTablet } = useIsMobile();
  const { data: activeMonth } = useGetActiveMonth();

  const selectedMonthIds =
    typeof searchParams?.selectedMonth === 'string'
      ? (searchParams.selectedMonth as string).split(',')
      : Array.isArray(searchParams?.selectedMonth) &&
          searchParams?.selectedMonth.length > 0
        ? searchParams?.selectedMonth
        : [activeMonth?.id];

  const selectedMonthIdsObject = { monthIds: selectedMonthIds };

  const { data: allUsersVariablePay, isLoading } = useGetVariablePay(
    selectedMonthIdsObject,
  );

  const tableData: any[] =
    allUsersVariablePay?.items?.map((variablePay: any) => ({
      id: variablePay?.id,
      key: variablePay?.id,
      name: variablePay?.userId,
      userId: variablePay?.userId,
      VpInPercentile: variablePay?.vpScoring?.totalPercentage,
      VpScore: variablePay?.vpScore,
      Benefit: 'Benefits',
    })) || [];

  const columns: TableColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      align: 'left', // User explicitly wanted all values right aligned
      width: '25%',
      render: (text: string) => (
        <div
          className="flex justify-start"
          data-testid={`variable-pay-employee-${text}`}
          id={`compensation-benefit-variable-pay-employee-${text}`}
          data-cy={`compensation-benefit-variable-pay-employee-${text}`}
        >
          <EmployeeDetails
            data-cy={`compensation-benefit-variable-pay-employee-details-${text}`}
            empId={text}
          />
        </div>
      ),
    },
    {
      title: 'VP in %',
      dataIndex: 'VpInPercentile',
      key: 'VpInPercentile',
      sorter: true,
      align: 'left',
      render: (text: string) => (
        <div
          className="text-left"
          data-testid="variable-pay-percentage"
          id="compensation-benefit-variable-pay-percentage"
          data-cy="compensation-benefit-variable-pay-percentage"
        >
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'VP Score',
      dataIndex: 'VpScore',
      key: 'VpScore',
      sorter: (a, b) => (a.VpScore || 0) - (b.VpScore || 0),
      align: 'left',
      render: (text: string) => (
        <div
          className="text-left"
          data-testid="variable-pay-score"
          id="compensation-benefit-variable-pay-score"
          data-cy="compensation-benefit-variable-pay-score"
        >
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'Benefit',
      dataIndex: 'Benefit',
      key: 'Benefit',
      sorter: true,
      align: 'left',
      render: (text: string) => (
        <div
          className="text-left"
          data-testid="variable-pay-benefit"
          id="compensation-benefit-variable-pay-benefit"
          data-cy="compensation-benefit-variable-pay-benefit"
        >
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'Action',
      align: 'left',
      render: (_: any, record: any) => {
        const isExpanded = expandedRowKeys.includes(record.key);
        return (
          <div className="flex justify-start">
            <div
              onClick={() => {
                if (isExpanded) {
                  setExpandedRowKeys(
                    expandedRowKeys.filter((k) => k !== record.key),
                  );
                } else {
                  setExpandedRowKeys([...expandedRowKeys, record.key]);
                }
              }}
              className={`flex items-center justify-center p-2 rounded-md border w-8 h-8 cursor-pointer transition-all duration-300 transform active:scale-75 ${
                isExpanded
                  ? 'border-gray-300 bg-gray-100 shadow-inner'
                  : 'border-gray-200 hover:bg-gray-50 hover:shadow-sm'
              }`}
            >
              <div
                className={`flex items-center justify-center transform transition-transform duration-300 ${isExpanded ? 'rotate-180 scale-110 text-gray-600' : 'rotate-0 scale-100 text-gray-400 hover:text-gray-600'}`}
              >
                {isExpanded ? (
                  <FaEyeSlash
                    size={16}
                    data-testid={`view-vp-button-${record?.userId}-close`}
                    data-cy={`view-vp-button-${record?.userId}-close`}
                  />
                ) : (
                  <FaRegEye
                    size={16}
                    data-testid={`view-vp-button-${record?.userId}`}
                    data-cy={`view-vp-button-${record?.userId}`}
                  />
                )}
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  const filteredDataSource = searchParams?.employeeName
    ? tableData.filter(
        (employee: any) => employee?.name === searchParams?.employeeName,
      )
    : tableData;

  const allEmployeesIds: string[] = tableData.map(
    (employee: any) => employee.name,
  );
  const { isLoading: refreshLoading, isFetching } = useGetAllCalculatedVpScore(
    allEmployeesIds,
    false,
  );

  const paginatedData = filteredDataSource.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div
      className="bg-white rounded-xl mt-6"
      data-testid="variable-pay-table-container"
      id="compensation-benefit-variable-pay-table-container"
      data-cy="compensation-benefit-variable-pay-table-container"
    >
      <div
        id="compensation-benefit-variable-pay-table-wrapper"
        data-cy="compensation-benefit-variable-pay-table-wrapper"
        data-testid="variable-pay-table-wrapper"
      >
        <Spin
          spinning={isLoading || isFetching || refreshLoading}
          data-testid="variable-pay-table-loading"
          data-cy="compensation-benefit-variable-pay-table-loading"
        >
          <div
            className="overflow-x-auto"
            id="compensation-benefit-variable-pay-scroll-container"
            data-cy="compensation-benefit-variable-pay-scroll-container"
          >
            <Table
              rowClassName={(record, index) =>
                index % 2 !== 0 ? 'bg-gray-50' : 'bg-white'
              }
              columns={columns}
              dataSource={paginatedData}
              pagination={false}
              scroll={{ x: 'max-content' }}
              expandable={{
                expandedRowRender: (record) => (
                  <ExpandedVPDetails userId={record.userId} />
                ),
                expandIcon: () => null,
                expandIconColumnIndex: -1,
                expandedRowKeys: expandedRowKeys,
                onExpand: (expanded, record) => {
                  if (expanded) {
                    setExpandedRowKeys([...expandedRowKeys, record.key]);
                  } else {
                    setExpandedRowKeys(
                      expandedRowKeys.filter((k) => k !== record.key),
                    );
                  }
                },
              }}
              data-testid="variable-pay-table"
              id="compensation-benefit-variable-pay-table"
              data-cy="compensation-benefit-variable-pay-table"
            />
          </div>

          {isMobile || isTablet ? (
            <CustomMobilePagination
              data-cy="compensation-benefit-variable-pay-mobile-pagination"
              totalResults={filteredDataSource.length}
              pageSize={pageSize}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              onShowSizeChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
            />
          ) : (
            <CustomPagination
              data-cy="compensation-benefit-variable-pay-pagination"
              current={currentPage}
              total={filteredDataSource.length}
              pageSize={pageSize}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              onShowSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              data-testid="variable-pay-pagination"
            />
          )}

          <VariablePayModal
            data-cy="compensation-benefit-variable-pay-modal"
            data={filteredDataSource}
          />
        </Spin>
      </div>
    </div>
  );
};

export default VariablePayTable;
