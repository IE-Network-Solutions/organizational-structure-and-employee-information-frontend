import React, { useState } from 'react';
import { Spin, Table, Progress, Button } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import { useVariablePayStore } from '@/store/uistate/features/compensation/benefit';
import VariablePayModal from './VariablePayModal';
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
      <div
        className="flex min-h-[136px] w-full items-center justify-center"
        data-cy="expanded-vp-details-loading-wrapper"
      >
        <Spin data-cy="expanded-vp-details-loading-spinner" />
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

  // Show *all* criteria for this user.
  // The backend returns the full breakdown; previously we were slicing to 3.
  const displayCriteria = criteria;

  return (
    <div className="w-full" data-cy="expanded-vp-details-wrapper">
      <style data-cy="expanded-vp-details-style">
        {`
        @keyframes slideDownCards {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDownCards {
          animation: slideDownCards 0.3s ease-out forwards;
        }
      `}
      </style>
      {/* Scroll only the cards strip (Total + criteria) */}
      <div
        className="min-w-0 w-full max-w-[1100px] overflow-x-auto animate-slideDownCards"
        data-cy="expanded-vp-details-cards-grid"
      >
        <div
          className="flex flex-nowrap gap-4 lg:gap-6 w-max items-center"
          data-cy="expanded-vp-details-cards-strip"
        >
          {/* Card 1: Total VP */}
          <div
            className="bg-white border border-gray-200 shadow-sm flex flex-col justify-between p-4 w-[256px] flex-shrink-0"
            style={{ height: '136px', borderRadius: '8px' }}
            data-cy="expanded-vp-details-total-card"
          >
            <div
              className="flex justify-between items-center"
              data-cy="expanded-vp-details-total-card-header"
            >
              <span
                className="text-gray-500 text-[13px] font-medium"
                data-cy="expanded-vp-details-total-card-title"
              >
                Total VP
              </span>
              <span
                className="text-gray-500 text-[13px] font-medium"
                data-cy="expanded-vp-details-total-card-subtitle"
              >
                Out of {totalWeight}%
              </span>
            </div>

            <div
              className="flex items-center gap-10"
              data-cy="expanded-vp-details-total-card-score-row"
            >
              <span
                className="text-[28px] font-bold text-gray-800 leading-none"
                data-cy="expanded-vp-details-total-card-score"
              >
                {Number(totalScore).toFixed(2)}
              </span>
              <Progress
                percent={totalPercentage}
                showInfo={false}
                strokeColor="#1e3a8a"
                trailColor="#f3f4f6"
                className="flex-1 m-0 [&_.ant-progress-inner]:!bg-gray-100"
                data-cy="expanded-vp-details-total-card-progress"
                strokeWidth={8}
                strokeLinecap="round"
              />
            </div>

            <div
              className="flex justify-between items-center"
              data-cy="expanded-vp-details-total-card-change-row"
            >
              <span
                className={`text-[12px] font-medium ${!isNegative ? 'text-green-500' : 'text-red-500'}`}
                data-cy="expanded-vp-details-total-card-change"
              >
                {!isNegative ? '+' : ''}
                {change}{' '}
                <span
                  className="text-gray-400 font-normal"
                  data-cy="expanded-vp-details-total-card-change-subtext"
                >
                  vs last month
                </span>
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
                data-cy="expanded-vp-details-total-card-refresh-button"
              />
            </div>
          </div>

          {/* Criteria cards */}
          {displayCriteria.map((card: any, index: number) => {
            const score = Number(card?.score ?? 0);
            const weight = Number(card?.weight ?? 1);
            // Avoid divide-by-zero if weight is missing/invalid.
            const safeWeight = weight > 0 ? weight : 1;
            const curPercentage = Math.min((score / safeWeight) * 100, 100);

            return (
              <div
                key={index}
                className="bg-white border border-gray-200 shadow-sm flex flex-col justify-between p-4 w-[256px] flex-shrink-0"
                style={{ height: '108px', borderRadius: '8px' }}
                data-cy={`expanded-vp-details-metric-card-${index}`}
              >
                <div
                  className="flex justify-between items-center"
                  data-cy={`expanded-vp-details-metric-card-header-${index}`}
                >
                  <span
                    className="text-gray-500 text-[13px] font-medium truncate pr-2"
                    data-cy={`expanded-vp-details-metric-card-title-${index}`}
                  >
                    {card?.name || 'OKR'}
                  </span>
                  <span
                    className="text-gray-500 text-[13px] font-medium flex-shrink-0"
                    data-cy={`expanded-vp-details-metric-card-subtitle-${index}`}
                  >
                    Out of {safeWeight.toFixed(2)}%
                  </span>
                </div>

                <div
                  className="flex items-center gap-3"
                  data-cy={`expanded-vp-details-metric-card-progress-row-${index}`}
                >
                  <Progress
                    percent={curPercentage}
                    showInfo={false}
                    strokeColor="#1c3ca5"
                    trailColor="#f3f4f6"
                    className="flex-1 m-0 [&_.ant-progress-inner]:!bg-gray-100"
                    data-cy={`expanded-vp-details-metric-card-progress-${index}`}
                    strokeWidth={8}
                    strokeLinecap="round"
                  />
                  <span
                    className="text-gray-600 text-[13px] font-medium w-8 text-right"
                    data-cy={`expanded-vp-details-metric-card-progress-value-${index}`}
                  >
                    {curPercentage.toFixed(0)}%
                  </span>
                </div>

                <div
                  className="flex justify-between items-center"
                  data-cy={`expanded-vp-details-metric-card-footer-${index}`}
                >
                  <span
                    className="text-[12px] text-green-500 font-medium"
                    data-cy={`expanded-vp-details-metric-card-footer-text-${index}`}
                  >
                    +0.00{' '}
                    <span
                      className="text-gray-400 font-normal"
                      data-cy={`expanded-vp-details-metric-card-footer-subtext-${index}`}
                    >
                      vs last month
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
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
      render: (value: any, record: any) => {
        const isExpanded = expandedRowKeys.includes(record.key);
        return (
          <div
            className="flex justify-start"
            data-cy={`variable-pay-table-action-wrapper-${record.userId}`}
          >
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
              data-cy={`variable-pay-table-action-button-${record.userId}`}
            >
              <div
                className={`flex items-center justify-center transform transition-transform duration-300 ${isExpanded ? 'rotate-180 scale-110 text-gray-600' : 'rotate-0 scale-100 text-gray-400 hover:text-gray-600'}`}
                data-cy={`variable-pay-table-action-icon-${record.userId}`}
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
            className="overflow-x-hidden"
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
