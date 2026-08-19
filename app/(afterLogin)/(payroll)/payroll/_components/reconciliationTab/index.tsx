'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Select, Table, Tag } from 'antd';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { FaEye } from 'react-icons/fa';
import { MdAttachMoney } from 'react-icons/md';
import dayjs from 'dayjs';
import { TableSkeleton } from '@/components/tableSkeleton';
import EmptyState from '@/components/empty';
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

const PAYROLL_SELECT_CLASS =
  'w-full min-h-[40px] [&_.ant-select-arrow]:!top-0 [&_.ant-select-arrow]:!bottom-0 [&_.ant-select-arrow]:!mt-0 [&_.ant-select-arrow]:!h-auto [&_.ant-select-arrow]:!flex [&_.ant-select-arrow]:!items-stretch [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!min-h-10 [&_.ant-select-selector]:!border-gray-200 [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector:hover]:!border-gray-300 [&_.ant-select-focused_.ant-select-selector]:!border-gray-300 [&_.ant-select-focused_.ant-select-selector]:!shadow-none';

const SUMMARY_CARDS_ROW_CLASS =
  'mb-6 flex flex-nowrap gap-4 overflow-x-auto overflow-y-visible pb-2 scroll-smooth snap-x snap-mandatory [-webkit-overflow-scrolling:touch] touch-pan-x lg:grid lg:grid-cols-3 lg:overflow-x-visible lg:snap-none';

const SUMMARY_CARD_SCROLL_ITEM_CLASS =
  'min-w-[228px] w-[min(88vw,304px)] shrink-0 snap-start lg:min-w-0 lg:h-full lg:w-full lg:shrink lg:max-w-none';

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
  const { componentType, setComponentType } = useReconciliationState();
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

  const data = isMockPeriod ? mockData : apiData;
  const isLoading = isMockPeriod ? false : isApiLoading;

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
    data?.summary?.netVariancePercentage || 0,
  );
  const netVarianceClass =
    netVariancePercentage > 0
      ? 'text-error'
      : netVariancePercentage < 0
        ? 'text-success'
        : 'text-gray-500';

  return (
    <div
      id="payroll-reconciliation-tab-view-container"
      data-cy="payroll-reconciliation-tab-view-container"
      className="w-full"
    >
      <div
        data-cy="payroll-reconciliation-tab-toolbar"
        className="mb-8 flex flex-wrap items-center justify-between gap-2 sm:gap-0"
      >
        <div
          data-cy="payroll-reconciliation-tab-period-filters"
          className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
        >
          <Select
            allowClear
            placeholder="Previous Pay Period"
            value={previousPayPeriodId || undefined}
            onChange={(value) => setPreviousPayPeriodId(value || '')}
            options={periodOptions}
            className={`max-w-xs min-w-[240px] sm:min-w-[280px] ${PAYROLL_SELECT_CLASS}`}
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
            className={`max-w-xs min-w-[240px] sm:min-w-[280px] ${PAYROLL_SELECT_CLASS}`}
            data-cy="payroll-reconciliation-tab-current-period-select"
          />
        </div>
        <Button
          type="default"
          size="large"
          className="flex items-center gap-2 h-10 border-gray-200 text-gray-600 rounded-[6px] px-3 md:px-4 font-medium"
          icon={<SaveAltIcon className="text-gray-600" fontSize="small" />}
          loading={isExporting}
          disabled={!previousPayPeriodId || !currentPayPeriodId}
          onClick={handleExport}
        >
          <span
            data-cy="payroll-reconciliation-tab-export-label"
            className="hidden sm:inline"
          >
            Export
          </span>
        </Button>
      </div>

      <div
        data-cy="payroll-reconciliation-summary-cards"
        className={SUMMARY_CARDS_ROW_CLASS}
      >
        <div
          className={SUMMARY_CARD_SCROLL_ITEM_CLASS}
          data-cy="payroll-reconciliation-card-total-cost-wrap"
        >
          <Card
            bordered={false}
            loading={isLoading}
            className="h-full shadow-sm"
            style={{ borderRadius: '10px', border: '2px solid #A8AEB9' }}
            styles={{ body: { padding: '16px' } }}
            data-cy="payroll-reconciliation-card-total-cost"
          >
            <div
              className="flex items-center gap-2 mb-2"
              data-cy="payroll-reconciliation-card-total-cost-title-row"
            >
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-sm text-lg bg-[#E6F4FF] text-[#1E40AF]"
                data-cy="payroll-reconciliation-card-total-cost-icon"
              >
                <MdAttachMoney />
              </span>
              <p
                data-cy="payroll-reconciliation-card-total-cost-title"
                className="text-gray-500 m-0 text-sm"
              >
                Total Payroll Cost
              </p>
            </div>
            <h3
              data-cy="payroll-reconciliation-card-total-cost-value"
              className="text-xl font-semibold mb-4 text-gray-800"
            >
              {data?.summary?.totalPayrollCost
                ? Number(data.summary.totalPayrollCost).toLocaleString(
                    'en-US',
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                  )
                : '--'}
            </h3>
            <p
              data-cy="payroll-reconciliation-card-total-cost-previous"
              className="text-sm text-gray-500 m-0"
            >
              Previous:{' '}
              {data?.summary?.previousPayrollCost
                ? Number(data.summary.previousPayrollCost).toLocaleString(
                    'en-US',
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                  )
                : '--'}
            </p>
          </Card>
        </div>
        <div
          className={SUMMARY_CARD_SCROLL_ITEM_CLASS}
          data-cy="payroll-reconciliation-card-net-variance-wrap"
        >
          <Card
            bordered={false}
            loading={isLoading}
            className="h-full shadow-sm"
            style={{ borderRadius: '10px', border: '2px solid #A8AEB9' }}
            styles={{ body: { padding: '16px' } }}
            data-cy="payroll-reconciliation-card-net-variance"
          >
            <div
              className="flex items-center gap-2 mb-2"
              data-cy="payroll-reconciliation-card-net-variance-title-row"
            >
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-sm text-lg bg-[#F9F0FF] text-[#722ED1]"
                data-cy="payroll-reconciliation-card-net-variance-icon"
              >
                <LocalAtmIcon className="w-5 h-5" />
              </span>
              <p
                data-cy="payroll-reconciliation-card-net-variance-title"
                className="text-gray-500 m-0 text-sm"
              >
                Net Variance
              </p>
            </div>
            <h3
              data-cy="payroll-reconciliation-card-net-variance-value"
              className="text-xl font-semibold mb-4 text-gray-800"
            >
              {data?.summary?.netVariance
                ? Number(data.summary.netVariance).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : '--'}
            </h3>
            <p
              className={`text-sm m-0 font-medium ${netVarianceClass}`}
              data-cy="payroll-reconciliation-card-net-variance-percent"
            >
              {isNaN(netVariancePercentage)
                ? '--'
                : `${netVariancePercentage > 0 ? '+' : ''}${netVariancePercentage}%`}
              <span className="text-gray-500 font-normal">
                {' '}
                Since last pay period
              </span>
            </p>
          </Card>
        </div>
        <div
          className={SUMMARY_CARD_SCROLL_ITEM_CLASS}
          data-cy="payroll-reconciliation-card-headcount-wrap"
        >
          <Card
            bordered={false}
            loading={isLoading}
            className="h-full shadow-sm"
            style={{ borderRadius: '10px', border: '2px solid #A8AEB9' }}
            styles={{ body: { padding: '16px' } }}
            data-cy="payroll-reconciliation-card-headcount"
          >
            <div
              className="flex items-center gap-2 mb-2"
              data-cy="payroll-reconciliation-card-headcount-title-row"
            >
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-sm text-lg bg-[#F6FFED] text-[#52C41A]"
                data-cy="payroll-reconciliation-card-headcount-icon"
              >
                <PeopleOutlineIcon className="w-5 h-5" />
              </span>
              <p
                data-cy="payroll-reconciliation-card-headcount-title"
                className="text-gray-500 m-0 text-sm"
              >
                Headcount Impact
              </p>
            </div>
            <h3
              data-cy="payroll-reconciliation-card-headcount-value"
              className="text-xl font-semibold mb-4 text-gray-800"
            >
              {data?.summary?.headcount != null
                ? `${data.summary.headcount} Employees`
                : '--'}
            </h3>
            <p
              data-cy="payroll-reconciliation-card-headcount-meta"
              className="text-sm text-gray-500 m-0"
            >
              Previous: {data?.summary?.previousHeadcount ?? '--'}
              <span className="mx-2">·</span>
              Terminations: {data?.summary?.terminations ?? 0}
            </p>
          </Card>
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
            rowClassName={(record: any, index: number) => {
              void record;
              return index % 2 === 1 ? 'payroll-zebra-row' : '';
            }}
            locale={{
              emptyText: (
                <div
                  className="payroll-table-empty-viewport-center py-10"
                  data-cy="payroll-reconciliation-empty-wrap"
                >
                  <EmptyState
                    minimal
                    description="No reconciliation data for this pay period"
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
