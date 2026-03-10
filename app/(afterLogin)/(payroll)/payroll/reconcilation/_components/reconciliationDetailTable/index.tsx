'use client';

import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGetReconciliationDetails } from '@/store/server/features/payroll/reconcilation/queries';
import { useReconciliationState } from '@/store/uistate/features/payroll/reconcilation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { Select, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

type ComponentSummary = {
  label?: string;
  previous?: number | string;
  current?: number | string;
  variance?: number | string;
  variancePercentage?: string;
  impact?: string;
};

interface ReconciliationDetailTableProps {
  previousPayPeriodId: string;
  currentPayPeriodId: string;
  componentType: string;
  /** When false, show nothing (e.g. no matching component type) */
  enabled?: boolean;
  componentSummary?: ComponentSummary;
}

const ReconciliationDetailTable = ({
  previousPayPeriodId,
  currentPayPeriodId,
  componentType,
  enabled = true,
  componentSummary,
}: ReconciliationDetailTableProps) => {
  const router = useRouter();
  const { isMobile, isTablet } = useIsMobile();
  const {
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    search,
    setSearch,
  } = useReconciliationState();
  const { data: employeeData } = useGetAllUsers();

  const {
    data: reconcilationDetails,
    isLoading: isLoadingReconciliationDetails,
  } = useGetReconciliationDetails({
    previousPayPeriodId,
    currentPayPeriodId,
    componentType,
    pageSize,
    currentPage,
    search,
  });

  const onPageChange = (page: number, newPageSize?: number) => {
    setCurrentPage(page);
    if (newPageSize) {
      setPageSize(newPageSize);
    }
  };

  const onPageSizeChange = (current: number, size: number) => {
    setCurrentPage(current);
    setPageSize(size);
  };

  const handleEmployeeSelect = (value: string) => {
    setSearch(value || '');
    setCurrentPage(1);
  };

  const options =
    employeeData?.items?.map((emp: any) => ({
      value: emp.id,
      label:
        `${emp?.firstName || ''} ${emp?.middleName || ''} ${emp?.lastName || ''}`.trim(),
      employeeData: emp,
    })) || [];

  const columns = [
    {
      title: 'Employee ',
      dataIndex: 'employeeName',
      key: 'employeeName',
      minWidth: 200,
    },
    {
      title: 'Current',
      dataIndex: 'current',
      key: 'current',
      minWidth: 150,
    },
    {
      title: 'Previous',
      dataIndex: 'previous',
      key: 'previous',
      minWidth: 150,
    },
    {
      title: 'Difference',
      dataIndex: 'difference',
      key: 'difference',
      minWidth: 150,
      render: (key: string) => {
        if (key == null || key === '' || key === 'NaN' || key === '--') {
          return '--';
        }
        const differenceValue = Number(key);
        if (isNaN(differenceValue)) {
          return '--';
        }
        const className =
          differenceValue < 0
            ? 'text-green-500'
            : differenceValue === 0
              ? 'text-gray-500'
              : 'text-red-500';
        return (
          <span
            data-cy="reconcilation-detail-table-difference"
            className={className}
          >
            {key}
          </span>
        );
      },
    },
  ];

  const payrollVarianceData =
    reconcilationDetails?.employeeVariances?.items?.map((item: any) => ({
      employeeName: item.employeeName,
      previous: Number(item.previous).toLocaleString(),
      current: Number(item.current).toLocaleString(),
      difference:
        item.difference != null && !isNaN(Number(item.difference))
          ? Number(item.difference).toLocaleString()
          : '--',
      userId: item.userId || item.employeeId || item.id,
    }));

  if (!enabled || !componentType) {
    return (
      <div
        data-cy="reconciliation-detail-table-no-data-container"
        className="w-full overflow-x-auto text-[#74777F]"
      >
        No detail data for this category.
      </div>
    );
  }

  const formatMoneyLike = (value: number | string | undefined) => {
    if (value == null || value === '' || value === 'NaN' || value === '--')
      return '--';
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return num.toLocaleString();
  };

  const varianceNumber = (() => {
    const raw = componentSummary?.variance;
    if (raw == null || raw === '' || raw === '--') return null;
    const num = Number(raw);
    if (Number.isNaN(num)) return null;
    return num;
  })();

  const varianceClass =
    varianceNumber == null
      ? 'text-[#4d4d4d]'
      : varianceNumber < 0
        ? 'text-green-600'
        : varianceNumber === 0
          ? 'text-gray-600'
          : 'text-red-600';

  return (
    <div data-cy="reconciliation-detail-table-container" className="w-full">
      <div
        data-cy="reconciliation-detail-table-grid"
        className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6"
      >
        {/* Summary panel (left) */}
        <div
          data-cy="reconciliation-detail-table-summary-panel"
          className="rounded-xl border border-gray-200 bg-white p-4 h-fit"
        >
          <div
            data-cy="reconciliation-detail-table-summary-panel-content"
            className="space-y-3 text-sm text-[#4d4d4d]"
          >
            <div data-cy="reconciliation-detail-table-previous-container">
              <div
                data-cy="reconciliation-detail-table-previous-label"
                className="text-[#74777F]"
              >
                Total Previous
              </div>
              <div
                data-cy="reconciliation-detail-table-previous-container"
                className="font-semibold"
              >
                {formatMoneyLike(componentSummary?.previous)}
              </div>
            </div>
            <div data-cy="reconciliation-detail-table-current-container">
              <div
                data-cy="reconciliation-detail-table-current-label"
                className="text-[#74777F]"
              >
                Current
              </div>
              <div
                data-cy="reconciliation-detail-table-current-container"
                className="font-semibold"
              >
                {formatMoneyLike(componentSummary?.current)}
              </div>
            </div>
            <div
              data-cy="reconciliation-detail-table-variance-divider"
              className="h-px bg-gray-200"
            />
            <div data-cy="reconciliation-detail-table-variance-container">
              <div
                data-cy="reconciliation-detail-table-variance-label"
                className="text-[#74777F]"
              >
                Variance(ATM)
              </div>
              <div
                data-cy="reconciliation-detail-table-variance-container"
                className={`font-semibold ${varianceClass}`}
              >
                {formatMoneyLike(componentSummary?.variance)}
              </div>
            </div>
            <div data-cy="reconciliation-detail-table-variance-percentage-container">
              <div
                data-cy="reconciliation-detail-table-variance-percentage-label"
                className="text-[#74777F]"
              >
                Variance(%)
              </div>
              <div
                data-cy="reconciliation-detail-table-variance-percentage-container"
                className={`font-semibold ${varianceClass}`}
              >
                {componentSummary?.variancePercentage ?? '--'}
              </div>
            </div>
            <div
              data-cy="reconciliation-detail-table-impact-divider"
              className="h-px bg-gray-200"
            />
            <div data-cy="reconciliation-detail-table-impact-container">
              <div
                data-cy="reconciliation-detail-table-impact-label"
                className="text-[#74777F]"
              >
                Impact
              </div>
              <div
                data-cy="reconciliation-detail-table-impact-container"
                className="flex items-center gap-2 font-semibold"
              >
                <span
                  data-cy="reconciliation-detail-table-impact-icon"
                  className={`inline-block h-2 w-2 rounded-full ${
                    (componentSummary?.impact || '').toLowerCase() === 'high'
                      ? 'bg-red-500'
                      : (componentSummary?.impact || '').toLowerCase() ===
                          'medium'
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                  }`}
                />
                <span
                  data-cy="reconciliation-detail-table-impact"
                  className="capitalize"
                >
                  {componentSummary?.impact ?? '--'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Table panel (right) */}
        <div
          data-cy="reconciliation-detail-table-container"
          className="rounded-xl border border-gray-200 bg-white p-4"
        >
          <div
            data-cy="reconciliation-detail-table-select"
            className="mb-4 flex-shrink-0"
          >
            <Select
              showSearch
              allowClear
              suffixIcon={<SearchOutlined />}
              className="h-8 w-full max-w-md"
              placeholder="Search Employee"
              value={search || undefined}
              onChange={(value) => handleEmployeeSelect(value)}
              filterOption={(input, option) => {
                const label = option?.label;
                return (
                  typeof label === 'string' &&
                  label.toLowerCase().includes(input.toLowerCase())
                );
              }}
              options={options}
            />
          </div>

          <div
            data-cy="reconciliation-detail-table-wrap"
            className="w-full overflow-x-auto"
          >
            <Table
              loading={isLoadingReconciliationDetails}
              dataSource={payrollVarianceData}
              columns={columns}
              pagination={false}
              className="custom-payroll-table"
              rowClassName={(record: any) =>
                record?.userId ? 'cursor-pointer' : ''
              }
              onRow={(record: any) => ({
                onClick: () => {
                  if (record?.userId) {
                    router.push(`/employee-information/${record.userId}`);
                  }
                },
              })}
            />
          </div>

          {isMobile || isTablet ? (
            <CustomMobilePagination
              currentPage={currentPage}
              totalResults={
                reconcilationDetails?.employeeVariances?.meta?.totalItems ?? 0
              }
              pageSize={pageSize}
              onShowSizeChange={onPageSizeChange}
            />
          ) : (
            <CustomPagination
              current={currentPage}
              total={
                reconcilationDetails?.employeeVariances?.meta?.totalItems ?? 0
              }
              pageSize={pageSize}
              onChange={onPageChange}
              onShowSizeChange={(newPageSize) => {
                setPageSize(newPageSize);
                setCurrentPage(1);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReconciliationDetailTable;
