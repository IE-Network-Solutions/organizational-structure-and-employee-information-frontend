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

/** Parse API / locale strings (e.g. "1,234.56") so Number() is not NaN. */
function parseNumericLike(value: unknown): number | null {
  if (value == null || value === '') return null;
  const s = String(value)
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .trim();
  if (s === '' || s === 'NaN') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
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
      title: (
        <span
          id="reconciliation-detail-table-employee-name-title"
          data-cy="reconciliation-detail-table-employee-name-title"
          className="text-sm font-bold text-[#4b4b4b]"
        >
          Employee
        </span>
      ),
      dataIndex: 'employeeName',
      key: 'employeeName',
      minWidth: 200,
    },
    {
      title: (
        <span
          id="reconciliation-detail-table-current-title"
          data-cy="reconciliation-detail-table-current-title"
          className="text-sm font-bold text-[#4b4b4b]"
        >
          Current
        </span>
      ),
      dataIndex: 'current',
      key: 'current',
      minWidth: 150,
    },
    {
      title: (
        <span
          id="reconciliation-detail-table-previous-title"
          data-cy="reconciliation-detail-table-previous-title"
          className="text-sm font-bold text-[#4b4b4b]"
        >
          Previous
        </span>
      ),
      dataIndex: 'previous',
      key: 'previous',
      minWidth: 150,
    },
    {
      title: (
        <span
          id="reconciliation-detail-table-difference-title"
          data-cy="reconciliation-detail-table-difference-title"
          className="text-sm font-bold text-[#4b4b4b]"
        >
          Difference
        </span>
      ),
      dataIndex: 'difference',
      key: 'difference',
      minWidth: 150,
      render: (key: string | number) => {
        if (key == null || key === '' || key === 'NaN' || key === '--') {
          return '--';
        }
        const differenceValue = parseNumericLike(key);
        if (differenceValue == null) {
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
            {differenceValue.toLocaleString()}
          </span>
        );
      },
    },
  ];

  const payrollVarianceData =
    reconcilationDetails?.employeeVariances?.items?.map((item: any) => ({
      employeeName: (
        <span
          id="reconciliation-detail-table-employee-name"
          data-cy="reconciliation-detail-table-employee-name"
          className="text-sm font-normal text-[#4d4d4d]"
        >
          {item.employeeName}
        </span>
      ),
      previous: (
        <span
          id="reconciliation-detail-table-previous"
          data-cy="reconciliation-detail-table-previous"
          className="text-sm font-normal text-[#4d4d4d]"
        >
          {Number(item.previous).toLocaleString()}
        </span>
      ),
      current: (
        <span
          id="reconciliation-detail-table-current"
          data-cy="reconciliation-detail-table-current"
          className="text-sm font-normal text-[#4d4d4d]"
        >
          {Number(item.current).toLocaleString()}
        </span>
      ),
      difference: (() => {
        const n = parseNumericLike(item.difference);
        return n !== null ? n : '--';
      })(),
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
        ? 'text-[#86d65f]'
        : varianceNumber === 0
          ? 'text-gray-600'
          : 'text-[#ff8384]';

  return (
    <div data-cy="reconciliation-detail-table-container" className="w-full">
      <div
        data-cy="reconciliation-detail-table-grid"
        className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6"
      >
        {/* Summary panel (left) */}
        <div
          data-cy="reconciliation-detail-table-summary-panel"
          className="rounded-lg border-[1px] border-[#d9d9d9] bg-white p-4 h-fit"
        >
          <div
            data-cy="reconciliation-detail-table-summary-panel-content"
            className="space-y-3 text-sm text-[#4d4d4d]"
          >
            <div data-cy="reconciliation-detail-table-previous-container">
              <div
                data-cy="reconciliation-detail-table-previous-label"
                className="text-[#4d4d4d] text-sm font-normal"
              >
                Total Previous
              </div>
              <div
                data-cy="reconciliation-detail-table-previous-container"
                className="text-base font-medium text-[#4d4d4d]"
              >
                {formatMoneyLike(componentSummary?.previous)}
              </div>
            </div>
            <div data-cy="reconciliation-detail-table-current-container">
              <div
                data-cy="reconciliation-detail-table-current-label"
                className="text-[#4d4d4d] text-sm font-normal"
              >
                Current
              </div>
              <div
                data-cy="reconciliation-detail-table-current-container"
                className="text-base font-medium text-[#4d4d4d]"
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
                className="text-[#4d4d4d] text-sm font-normal"
              >
                Variance(ATM)
              </div>
              <div
                data-cy="reconciliation-detail-table-variance-container"
                className={`text-base font-medium ${varianceClass}`}
              >
                {formatMoneyLike(componentSummary?.variance)}
              </div>
            </div>
            <div data-cy="reconciliation-detail-table-variance-percentage-container">
              <div
                data-cy="reconciliation-detail-table-variance-percentage-label"
                className="text-[#4d4d4d] text-sm font-normal"
              >
                Variance(%)
              </div>
              <div
                data-cy="reconciliation-detail-table-variance-percentage-container"
                className={`text-base font-medium ${varianceClass}`}
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
                className="text-[#4d4d4d] text-sm font-normal"
              >
                Impact
              </div>
              <div
                data-cy="reconciliation-detail-table-impact-container"
                className="flex items-center gap-2 text-base font-normal text-[#4d4d4d]"
              >
                <span
                  data-cy="reconciliation-detail-table-impact-icon"
                  className={`inline-block h-2 w-2 rounded-full ${
                    (componentSummary?.impact || '').toLowerCase() === 'high'
                      ? 'bg-[#ff4d4f]'
                      : (componentSummary?.impact || '').toLowerCase() ===
                          'medium'
                        ? 'bg-[#faad14]'
                        : 'bg-[#52c41a]'
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
          className="rounded-lg border-[1px] border-[#d9d9d9] bg-white p-4"
        >
          <div
            data-cy="reconciliation-detail-table-select"
            className="mb-4 flex-shrink-0"
          >
            <Select
              showSearch
              allowClear
              className="h-8 w-full max-w-[300px]"
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
              suffixIcon={
                <div
                  className="text-gray-400 border-l border-gray-300 p-2"
                  data-cy="transfer-search-icon-container"
                >
                  <SearchOutlined data-cy="transfer-search-icon" />
                </div>
              }
            />
          </div>

          <div
            data-cy="reconciliation-detail-table-wrap"
            className="w-full overflow-x-auto scrollbar-none"
          >
            <Table
              loading={isLoadingReconciliationDetails}
              dataSource={payrollVarianceData}
              columns={columns}
              pagination={false}
              rowHoverable={false}
              onRow={(record: any) => ({
                onClick: () => {
                  if (record?.userId) {
                    router.push(`/employee-information/${record.userId}`);
                  }
                },
              })}
              rowClassName={(notUsed, index) =>
                index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
              }
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
