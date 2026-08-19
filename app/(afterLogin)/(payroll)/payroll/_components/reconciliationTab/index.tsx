'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Select, Table, Tag } from 'antd';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import { FaEye } from 'react-icons/fa';
import dayjs from 'dayjs';
import { TableSkeleton } from '@/components/tableSkeleton';
import EmptyState from '@/components/empty';
import StatChip from '@/components/common/statChip';
import PayrollReconcilationModal from '../../reconcilation/_components/modal';
import {
  useExportReconciliation,
  useGetReconciliation,
} from '@/store/server/features/payroll/reconcilation/queries';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import { useReconciliationState } from '@/store/uistate/features/payroll/reconcilation';
import {
  getMockReconciliation,
  isMockPayPeriodId,
  MOCK_PAY_PERIODS,
} from '../payPeriodSelect/mockPayPeriods';
import { usePayrollActivityLogStore } from '@/store/uistate/features/payroll/activityLog';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { PAYROLL_SELECT_COMPACT_CLASS } from '../selectClass';

const impactColors = {
  High: 'red',
  Medium: 'orange',
  Low: 'green',
};

interface ReconciliationTabProps {
  payPeriodId: string;
}

const ReconciliationTab = ({ payPeriodId }: ReconciliationTabProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previousPayPeriodId, setPreviousPayPeriodId] = useState('');
  const [currentPayPeriodId, setCurrentPayPeriodId] = useState(payPeriodId);
  const { componentType, setComponentType, markReconciled, isPairReconciled } =
    useReconciliationState();
  const addActivityLog = usePayrollActivityLogStore((state) => state.addLog);
  const { data: apiPayPeriodData } = useGetPayPeriod();
  const { mutate: exportReconciliation, isLoading: isExporting } =
    useExportReconciliation();

  const isMockPeriod = isMockPayPeriodId(currentPayPeriodId);
  const payPeriodData = useMemo(() => {
    const apiPeriods = Array.isArray(apiPayPeriodData) ? apiPayPeriodData : [];
    if (isMockPeriod) {
      const apiIds = new Set(
        apiPeriods.map((period: { id: string }) => period.id),
      );
      return [
        ...MOCK_PAY_PERIODS.filter((period) => !apiIds.has(period.id)),
        ...apiPeriods,
      ];
    }
    return apiPeriods.length ? apiPeriods : MOCK_PAY_PERIODS;
  }, [apiPayPeriodData, isMockPeriod]);

  const { data: apiData, isLoading: isApiLoading } = useGetReconciliation({
    previousPayPeriodId: isMockPeriod ? undefined : previousPayPeriodId,
    currentPayPeriodId: isMockPeriod ? undefined : currentPayPeriodId,
  });

  const mockData = useMemo(
    () =>
      isMockPeriod
        ? getMockReconciliation(currentPayPeriodId, previousPayPeriodId)
        : null,
    [isMockPeriod, currentPayPeriodId, previousPayPeriodId],
  );

  const hasReconciled = isPairReconciled(
    previousPayPeriodId,
    currentPayPeriodId,
  );
  const data =
    isMockPeriod && !hasReconciled
      ? undefined
      : isMockPeriod
        ? mockData
        : apiData;
  const isLoading = isMockPeriod || !hasReconciled ? false : isApiLoading;

  useEffect(() => {
    setCurrentPayPeriodId(payPeriodId);
    setPreviousPayPeriodId('');
  }, [payPeriodId]);

  useEffect(() => {
    if (!currentPayPeriodId || previousPayPeriodId || !payPeriodData.length) {
      return;
    }
    const sortedPayPeriods = [...payPeriodData].sort(
      (a: any, b: any) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
    const currentIndex = sortedPayPeriods.findIndex(
      (period: any) => period.id === currentPayPeriodId,
    );
    if (currentIndex > 0) {
      setPreviousPayPeriodId(sortedPayPeriods[currentIndex - 1].id);
    }
  }, [payPeriodData, currentPayPeriodId, previousPayPeriodId]);

  useEffect(() => {
    if (!isModalOpen && componentType) {
      setComponentType('');
    }
  }, [isModalOpen, componentType, setComponentType]);

  const handleViewDetails = (type: string) => {
    setComponentType(type);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    if (!previousPayPeriodId || !currentPayPeriodId) return;
    if (isMockPeriod && !hasReconciled) return;
    if (isMockPeriod) {
      NotificationMessage.success({
        message: 'Export completed',
        description: 'Payroll reconciliation has been exported successfully.',
      });
      addActivityLog(currentPayPeriodId, {
        action: 'Exported',
        remarks: 'Payroll reconciliation exported for this pay period.',
      });
      return;
    }
    exportReconciliation({
      previousPayPeriodId,
      currentPayPeriodId,
    });
  };

  const handleReconcile = () => {
    if (!previousPayPeriodId || !currentPayPeriodId) return;
    markReconciled(previousPayPeriodId, currentPayPeriodId);
    NotificationMessage.success({
      message: 'Reconciliation completed',
      description: 'Payroll has been reconciled for the selected pay periods.',
    });
    addActivityLog(currentPayPeriodId, {
      action: 'Reconciled',
      remarks: 'Payroll reconciled against the previous pay period.',
    });
  };

  const periodOptions = payPeriodData.map((period: any) => ({
    value: period.id,
    label: `${dayjs(period.startDate).format('MMM DD, YYYY')} -- ${dayjs(period.endDate).format('MMM DD, YYYY')}`,
  }));

  const columns = [
    {
      title: 'Types',
      dataIndex: 'types',
      key: 'types',
      minWidth: 200,
      render: (notused: any, record: any) => (
        <span data-cy="payroll-reconciliation-tab-type-label">
          {record.types}
        </span>
      ),
    },
    {
      title: 'Previous',
      dataIndex: 'previous',
      key: 'previous',
      minWidth: 150,
      render: (notused: any, record: any) => (
        <span data-cy="payroll-reconciliation-tab-previous-value">
          {record.previous || '--'}
        </span>
      ),
    },
    {
      title: 'Current',
      dataIndex: 'current',
      key: 'current',
      minWidth: 150,
      render: (nonused: any, record: any) => (
        <span data-cy="payroll-reconciliation-tab-current-value">
          {record.current || '--'}
        </span>
      ),
    },
    {
      title: 'Variance(AMT)',
      dataIndex: 'variance',
      key: 'variance',
      minWidth: 150,
      render: (key: string) => {
        if (key == null || key === '' || key === 'NaN' || key === '--') {
          return '--';
        }
        const varianceValue = Number(String(key).replace(/,/g, ''));
        if (isNaN(varianceValue)) {
          return '--';
        }
        const className =
          varianceValue < 0
            ? 'text-green-500'
            : varianceValue === 0
              ? 'text-gray-500'
              : 'text-red-500';
        return (
          <span
            data-cy="payroll-reconciliation-tab-variance-amount"
            className={className}
          >
            {key}
          </span>
        );
      },
    },
    {
      title: 'Variance(%)',
      dataIndex: 'variancePercentage',
      key: 'variancePercentage',
      minWidth: 150,
      render: (key: string) => {
        if (key == null || key === '' || key === 'NaN' || key === '--') {
          return '--';
        }
        const numericString = String(key).replace(/[^\d.-]/g, '');
        const varianceValue = Number(numericString);
        if (isNaN(varianceValue)) {
          return '--';
        }
        const className =
          varianceValue < 0
            ? 'text-green-500'
            : varianceValue === 0
              ? 'text-gray-500'
              : 'text-red-500';
        return (
          <span
            data-cy="payroll-reconciliation-tab-variance-percent"
            className={className}
          >
            {key}
          </span>
        );
      },
    },
    {
      title: 'Impact',
      dataIndex: 'impact',
      key: 'impact',
      minWidth: 150,
      render: (notused: any, record: any) => record.impact || '--',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      minWidth: 80,
      render: (notused: any, record: any) => (
        <span data-cy="payroll-reconciliation-tab-action-value">
          {record.action}
        </span>
      ),
    },
  ];

  const payrollVarianceData = data?.components?.map((item: any) => ({
    key: item.type || item.label,
    types: item.label,
    previous: Number(item.previous).toLocaleString(),
    current: Number(item.current).toLocaleString(),
    variance:
      item.variance != null && !isNaN(Number(item.variance))
        ? Number(item.variance).toLocaleString()
        : '--',
    variancePercentage:
      item?.variancePercentage != null && item?.variancePercentage !== ''
        ? item.variancePercentage
        : '--',
    impact: (
      <Tag
        color={impactColors[item.impact as keyof typeof impactColors]}
        className="capitalize text-sm"
        style={{ border: 'none' }}
        data-cy={`payroll-reconciliation-impact-tag-${item.impact}`}
      >
        {item.impact}
      </Tag>
    ),
    action: (
      <Button
        type="primary"
        className="flex items-center justify-center !h-10 !w-10 !min-w-10 !p-0 shadow-none"
        onClick={() => handleViewDetails(item.type)}
        disabled={
          item.type === 'BASIC_SALARY' &&
          (item.current == '0' ||
            item.previous == '0' ||
            Number(item.current) === 0 ||
            Number(item.previous) === 0)
        }
        aria-label={`View ${item.label} details`}
      >
        <FaEye />
      </Button>
    ),
  }));

  const netVariancePercentage = Number(
    data?.summary?.netVariancePercentage,
  );

  const formatMoney = (value?: number | string | null) => {
    if (value == null || value === '' || Number.isNaN(Number(value))) {
      return '--';
    }
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const totalPayrollCost = formatMoney(data?.summary?.totalPayrollCost);
  const previousPayrollCost = formatMoney(data?.summary?.previousPayrollCost);
  const netVarianceAmount = formatMoney(data?.summary?.netVariance);
  const netVarianceLabel =
    data?.summary == null || isNaN(netVariancePercentage)
      ? undefined
      : `${netVariancePercentage > 0 ? '+' : ''}${netVariancePercentage}%`;
  const headcountValue =
    data?.summary?.headcount != null
      ? `${data.summary.headcount} employee${
          Number(data.summary.headcount) === 1 ? '' : 's'
        }`
      : '--';
  const previousHeadcount = data?.summary?.previousHeadcount;
  const terminations = data?.summary?.terminations;
  const currentHeadcount = Number(data?.summary?.headcount);
  const previousHeadcountNum = Number(previousHeadcount);
  const headcountGrowth =
    data?.summary == null
      ? undefined
      : Number.isFinite(currentHeadcount) &&
          Number.isFinite(previousHeadcountNum) &&
          previousHeadcountNum !== 0
        ? `${(((currentHeadcount - previousHeadcountNum) / previousHeadcountNum) * 100).toFixed(2)}%`
        : undefined;

  const netVarianceValueClass =
    netVariancePercentage > 0
      ? 'text-error'
      : netVariancePercentage < 0
        ? 'text-success'
        : 'text-gray-900';

  return (
    <div
      id="payroll-reconciliation-tab-view-container"
      data-cy="payroll-reconciliation-tab-view-container"
      className="w-full"
    >
      <div
        data-cy="payroll-reconciliation-tab-toolbar"
        className="mb-8 flex flex-wrap items-center gap-2"
      >
        <div
          data-cy="payroll-reconciliation-kpi-tags"
          className="flex min-w-0 flex-1 items-stretch gap-2"
        >
          <StatChip
            label="Payroll cost"
            value={totalPayrollCost}
            growth={netVarianceLabel}
            growthLabel={`Prev ${previousPayrollCost}`}
            meta={`Prev ${previousPayrollCost}`}
            growthUpIsGood={false}
            expanded
            valueClassName="text-primary"
            data-cy="payroll-reconciliation-cost-tag"
          />
          <StatChip
            label="Variance"
            value={netVarianceAmount}
            growth={netVarianceLabel}
            growthLabel="vs last period"
            meta="vs last period"
            growthUpIsGood={false}
            expanded
            valueClassName={netVarianceValueClass}
            data-cy="payroll-reconciliation-variance-tag"
          />
          <StatChip
            label="Headcount"
            value={headcountValue}
            growth={headcountGrowth}
            growthLabel={`Prev ${previousHeadcount ?? '--'} · Term ${terminations ?? '--'}`}
            meta={`Prev ${previousHeadcount ?? '--'} · Term ${terminations ?? '--'}`}
            expanded
            data-cy="payroll-reconciliation-headcount-tag"
          />
        </div>
        <div
          data-cy="payroll-reconciliation-tab-period-filters"
          className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center"
        >
          <Select
            allowClear
            placeholder="Previous Pay Period"
            value={previousPayPeriodId || undefined}
            onChange={(value) => setPreviousPayPeriodId(value || '')}
            options={periodOptions}
            className={PAYROLL_SELECT_COMPACT_CLASS}
            data-cy="payroll-reconciliation-tab-previous-period-select"
          />
          <Select
            allowClear
            placeholder="Current Pay Period"
            value={currentPayPeriodId || undefined}
            onChange={(value) => {
              setCurrentPayPeriodId(value || payPeriodId);
              setPreviousPayPeriodId('');
            }}
            options={periodOptions}
            className={PAYROLL_SELECT_COMPACT_CLASS}
            data-cy="payroll-reconciliation-tab-current-period-select"
          />
        </div>
        <div
          data-cy="payroll-reconciliation-tab-toolbar-actions"
          className="flex shrink-0 items-center gap-2"
        >
          <Button
            type="default"
            size="large"
            className="flex items-center gap-2 h-10 border-gray-200 text-gray-600 rounded-[6px] px-3 md:px-4 font-medium"
            icon={<RefreshIcon className="text-gray-600" fontSize="small" />}
            disabled={!previousPayPeriodId || !currentPayPeriodId}
            onClick={handleReconcile}
            data-cy="payroll-reconciliation-tab-reconcile-click-button"
          >
            <span
              data-cy="payroll-reconciliation-tab-reconcile-label"
              className="hidden sm:inline"
            >
              Reconcile
            </span>
          </Button>
          <Button
            type="default"
            size="large"
            className="flex items-center gap-2 h-10 border-gray-200 text-gray-600 rounded-[6px] px-3 md:px-4 font-medium"
            icon={<SaveAltIcon className="text-gray-600" fontSize="small" />}
            loading={isExporting}
            disabled={
              !previousPayPeriodId ||
              !currentPayPeriodId ||
              (isMockPeriod && !hasReconciled)
            }
            onClick={handleExport}
            data-cy="payroll-reconciliation-tab-export-click-button"
          >
            <span
              data-cy="payroll-reconciliation-tab-export-label"
              className="hidden sm:inline"
            >
              Export
            </span>
          </Button>
        </div>
      </div>

      <div
        data-cy="payroll-reconciliation-table-wrapper"
        className="payroll-table-scroll-host overflow-x-auto scrollbar-none rounded-lg overflow-hidden"
      >
        {isLoading ? (
          <TableSkeleton columns={columns} />
        ) : (
          <Table
            id="payroll-reconciliation-table"
            data-cy="payroll-reconciliation-table"
            className="payroll-table"
            dataSource={payrollVarianceData}
            columns={columns}
            pagination={false}
            rowKey="key"
            locale={{
              emptyText: (
                <div
                  className="payroll-table-empty-viewport-center py-10"
                  data-cy="payroll-reconciliation-empty-wrap"
                >
                  <EmptyState
                    minimal
                    description={
                      isMockPeriod && !hasReconciled
                        ? 'Run Reconcile to compare this pay period with the previous period.'
                        : 'No reconciliation data for this pay period'
                    }
                    data-cy="payroll-reconciliation-empty"
                    className="!py-2"
                  />
                </div>
              ),
            }}
          />
        )}
      </div>

      <PayrollReconcilationModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        previousPayPeriodId={previousPayPeriodId}
        currentPayPeriodId={currentPayPeriodId}
        componentType={componentType}
      />
    </div>
  );
};

export default ReconciliationTab;
