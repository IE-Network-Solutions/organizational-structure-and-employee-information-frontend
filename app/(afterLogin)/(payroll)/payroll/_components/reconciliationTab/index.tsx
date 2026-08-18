'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Row, Select, Table, Tag } from 'antd';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { FaEye } from 'react-icons/fa';
import dayjs from 'dayjs';
import { TableSkeleton } from '@/components/tableSkeleton';
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

const { Option } = Select;

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

  const columns = [
    {
      title: 'Types',
      dataIndex: 'types',
      key: 'types',
      minWidth: 200,
      render: (notused: any, record: any) => (
        <div
          data-cy="payroll-reconciliation-tab-type-cell"
          className="flex items-center gap-2"
        >
          <span data-cy="payroll-reconciliation-tab-type-label">
            {record.types}
          </span>
        </div>
      ),
    },
    {
      title: 'Previous',
      dataIndex: 'previous',
      key: 'previous',
      minWidth: 150,
      render: (notused: any, record: any) => {
        const previous = record.previous || '--';
        return (
          <span data-cy="payroll-reconciliation-tab-previous-value">
            {previous}
          </span>
        );
      },
    },
    {
      title: 'Current',
      dataIndex: 'current',
      key: 'current',
      minWidth: 150,
      render: (nonused: any, record: any) => {
        const current = record.current || '--';
        return (
          <span data-cy="payroll-reconciliation-tab-current-value">
            {current}
          </span>
        );
      },
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
      minWidth: 150,
      render: (notused: any, record: any) => (
        <div
          data-cy="payroll-reconciliation-tab-action-cell"
          className="flex items-center gap-2"
        >
          <span data-cy="payroll-reconciliation-tab-action-value">
            {record.action}
          </span>
        </div>
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
      <Tag color={impactColors[item.impact as keyof typeof impactColors]}>
        {item.impact}
      </Tag>
    ),
    action: (
      <Button
        className="bg-primary px-[10px]  text-white disabled:bg-gray-400  border-none "
        onClick={() => handleViewDetails(item.type)}
        disabled={
          item.type === 'BASIC_SALARY' &&
          (item.current == '0' ||
            item.previous == '0' ||
            Number(item.current) === 0 ||
            Number(item.previous) === 0)
        }
      >
        <FaEye />
      </Button>
    ),
  }));

  return (
    <div
      id="payroll-reconciliation-tab-view-container"
      data-cy="payroll-reconciliation-tab-view-container"
      className="w-full"
    >
      <div
        data-cy="payroll-reconciliation-tab-toolbar"
        className="mb-6 flex flex-wrap items-center justify-between gap-4"
      >
        <Row gutter={[16, 16]} align="middle" className="flex-1">
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <div data-cy="payroll-reconciliation-tab-previous-period">
              <Select
                placeholder="Previous Pay Period"
                allowClear
                style={{ width: '100%', height: '48px' }}
                value={previousPayPeriodId || undefined}
                onChange={(value) => setPreviousPayPeriodId(value || '')}
              >
                {payPeriodData?.map((period: any) => (
                  <Option key={period.id} value={period.id}>
                    {dayjs(period.startDate).format('MMM DD, YYYY')} --
                    {dayjs(period.endDate).format('MMM DD, YYYY')}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Select
              allowClear
              className="min-h-12 w-full"
              placeholder="Current Pay Period"
              value={currentPayPeriodId || undefined}
              onChange={(value) => {
                setCurrentPayPeriodId(value || payPeriodId);
                setPreviousPayPeriodId('');
              }}
            >
              {payPeriodData?.map((period: any) => (
                <Option key={period.id} value={period.id}>
                  {dayjs(period.startDate).format('MMM DD, YYYY')} --
                  {dayjs(period.endDate).format('MMM DD, YYYY')}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Button
          type="default"
          size="small"
          className="h-8 w-8 sm:w-auto sm:px-4 text-[#3A3A3A] border-[#D9D9D9] pl-3 rounded-md"
          icon={<SaveAltIcon className="text-sm" />}
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
        className="grid grid-cols-1 lg:grid lg:grid-cols-3 xl:grid-cols-3 md:grid-cols-1 gap-12"
      >
        <Card className="rounded-xl shadow-sm border" loading={isLoading}>
          <p
            data-cy="payroll-reconciliation-card-total-cost-title"
            className="text-black text-sm mb-2 font-semibold"
          >
            Total Payroll Cost
          </p>
          <p
            data-cy="payroll-reconciliation-card-total-cost-value"
            className="text-2xl font-bold text-black"
          >
            {data?.summary?.totalPayrollCost
              ? Number(data?.summary?.totalPayrollCost).toLocaleString()
              : 0}
          </p>
          <p
            data-cy="payroll-reconciliation-card-total-cost-previous"
            className="text-sm text-black mt-3 font-semibold"
          >
            Previous:{' '}
            <span
              data-cy="payroll-reconciliation-card-total-cost-previous-value"
              className="font-semibold"
            >
              {data?.summary?.previousPayrollCost
                ? Number(data?.summary?.previousPayrollCost).toLocaleString()
                : 0}
            </span>
          </p>
        </Card>
        <Card className="rounded-xl shadow-sm border" loading={isLoading}>
          <p
            data-cy="payroll-reconciliation-card-net-variance-title"
            className="text-black text-sm mb-2 font-semibold"
          >
            Net Variance
          </p>
          <p
            data-cy="payroll-reconciliation-card-net-variance-value"
            className="text-2xl font-bold text-black"
          >
            {data?.summary?.netVariance
              ? Number(data?.summary?.netVariance).toLocaleString()
              : 0}
          </p>
          <p
            className={`text-sm mt-3 font-semibold ${(() => {
              const varianceValue = Number(
                data?.summary?.netVariancePercentage || 0,
              );
              if (varianceValue > 0) return 'text-red-500';
              if (varianceValue < 0) return 'text-green-500';
              return '';
            })()}`}
            data-cy="payroll-reconciliation-card-net-variance-percent"
          >
            {(() => {
              const varianceValue = Number(
                data?.summary?.netVariancePercentage || 0,
              );
              if (isNaN(varianceValue)) {
                return '--';
              }
              return varianceValue;
            })()}
          </p>
        </Card>
        <Card className="rounded-xl shadow-sm border" loading={isLoading}>
          <p
            data-cy="payroll-reconciliation-card-headcount-title"
            className="text-black text-sm mb-2 font-semibold"
          >
            Headcount Impact
          </p>
          <p
            data-cy="payroll-reconciliation-card-headcount-value"
            className="text-2xl font-bold text-black"
          >
            {data?.summary?.headcount} Employees
          </p>
          <div
            data-cy="payroll-reconciliation-card-headcount-meta"
            className="flex gap-4 text-sm mt-3 text-black"
          >
            <p data-cy="payroll-reconciliation-card-headcount-previous">
              Previous:{' '}
              <span
                data-cy="payroll-reconciliation-card-headcount-previous-value"
                className="font-semibold"
              >
                {data?.summary?.previousHeadcount}
              </span>
            </p>
            <p data-cy="payroll-reconciliation-card-headcount-terminations">
              Terminations:{' '}
              <span
                data-cy="payroll-reconciliation-card-headcount-terminations-value"
                className="font-semibold"
              >
                {data?.summary?.terminations ?? 0}
              </span>
            </p>
          </div>
        </Card>
      </div>

      <div
        data-cy="payroll-reconciliation-table-wrapper"
        className="w-full mt-6 overflow-x-auto"
      >
        {isLoading ? (
          <TableSkeleton columns={columns} />
        ) : (
          <Table
            dataSource={payrollVarianceData}
            columns={columns}
            pagination={false}
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
