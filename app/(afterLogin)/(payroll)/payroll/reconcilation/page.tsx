'use client';

import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Button, Card, Col, Row, Select, Table, Tag, Tabs } from 'antd';
import { PiExportLight } from 'react-icons/pi';
import { useState, useEffect } from 'react';

import {
  useGetPayPeriod,
  useGetActivePayroll,
} from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';
import {
  useGetReconciliation,
  useGetReconciliationDetails,
} from '@/store/server/features/payroll/reconcilation/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useReconciliationState } from '@/store/uistate/features/payroll/reconcilation';
import useEmployeeStore from '@/store/uistate/features/payroll/employeeInfoStore';
import { useRouter } from 'next/navigation';
import { MdKeyboardArrowLeft } from 'react-icons/md';

const { Option } = Select;
const impactColors = {
  High: 'red',
  Medium: 'orange',
  Low: 'green',
};

const reconciliationTabs = [
  { key: 'all', label: 'All Category' },
  { key: 'basic', label: 'Basic' },
  { key: 'allowance', label: 'Allowance' },
  { key: 'benefit', label: 'Benefit' },
  { key: 'vp', label: 'VP' },
  { key: 'incentive', label: 'Incentive' },
  { key: 'gross', label: 'Gross' },
  { key: 'tax', label: 'Tax' },
  { key: 'pension', label: 'Pension' },
  { key: 'cost-sharing', label: 'Cost sharing' },
  { key: 'deduction', label: 'Deduction' },
  { key: 'net-pay', label: 'Net Pay' },
];

const filterComponentByTab = (item: any, activeKey: string) => {
  const label = String(item.label || '').toLowerCase();
  const type = String(item.type || '').toLowerCase();

  switch (activeKey) {
    case 'basic':
      return (
        label.includes('basic') ||
        type.includes('basic_salary') ||
        type.includes('basic')
      );
    case 'allowance':
      return label.includes('allowance') || type.includes('allowance');
    case 'benefit':
      return label.includes('benefit') || type.includes('benefit');
    case 'vp':
      return (
        label.includes('vp') ||
        type.includes('vp') ||
        label.includes('variable') ||
        type.includes('variable')
      );
    case 'incentive':
      return label.includes('incentive') || type.includes('incentive');
    case 'gross':
      return label.includes('gross') || type.includes('gross');
    case 'tax':
      return label.includes('tax') || type.includes('tax');
    case 'pension':
      return label.includes('pension') || type.includes('pension');
    case 'cost-sharing':
      return (
        label.includes('cost sharing') ||
        label.includes('cost-sharing') ||
        type.includes('cost_sharing')
      );
    case 'deduction':
      return label.includes('deduction') || type.includes('deduction');
    case 'net-pay':
      return label.includes('net pay') || type.includes('net_pay');
    default:
      return true;
  }
};

const PayrollReconcilation = () => {
  const [activeTabKey, setActiveTabKey] = useState<string>('all');
  const { isMobile, isTablet } = useIsMobile();
  const router = useRouter();
  const {
    previousPayPeriodId,
    currentPayPeriodId,
    componentType,
    currentPage,
    pageSize,
    search,
    setPreviousPayPeriodId,
    setCurrentPayPeriodId,
    setComponentType,
    setCurrentPage,
    setPageSize,
    setSearch,
  } = useReconciliationState();

  const { data, isLoading } = useGetReconciliation({
    previousPayPeriodId,
    currentPayPeriodId,
  });
  const { data: payPeriodData } = useGetPayPeriod();
  const { pageSize: employeePageSize, currentPage: employeeCurrentPage } =
    useEmployeeStore();
  const { data: payroll } = useGetActivePayroll(
    '',
    employeePageSize || 10,
    employeeCurrentPage || 1,
  );

  const { data: reconciliationDetails, isLoading: isLoadingDetails } =
    useGetReconciliationDetails({
      previousPayPeriodId,
      currentPayPeriodId,
      componentType,
      pageSize,
      currentPage,
      search,
    });

  const { data: employeeData } = useGetAllUsers();

  const employeeOptions =
    employeeData?.items?.map((emp: any) => ({
      value: emp.id,
      label:
        `${emp?.firstName || ''} ${emp?.middleName || ''} ${emp?.lastName || ''}`.trim(),
    })) || [];

  useEffect(() => {
    if (payroll?.items?.length > 0 && payPeriodData?.length > 0) {
      // Set current pay period if not already set
      if (!currentPayPeriodId) {
        const defaultPayPeriodId = payroll.items[0]?.payPeriodId;
        const defaultPayPeriod = payPeriodData?.find(
          (period: any) => period.id === defaultPayPeriodId,
        );

        if (defaultPayPeriod) {
          setCurrentPayPeriodId(defaultPayPeriodId);
        }
      }
    }
  }, [
    payroll?.items,
    payPeriodData,
    currentPayPeriodId,
    setCurrentPayPeriodId,
  ]);

  useEffect(() => {
    // Set previous pay period based on current pay period
    if (
      payPeriodData?.length > 0 &&
      currentPayPeriodId &&
      !previousPayPeriodId
    ) {
      // Sort pay periods by start date to find the previous one
      const sortedPayPeriods = [...payPeriodData].sort(
        (a: any, b: any) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );

      const currentIndex = sortedPayPeriods.findIndex(
        (period: any) => period.id === currentPayPeriodId,
      );

      if (currentIndex > 0) {
        const previousPayPeriod = sortedPayPeriods[currentIndex - 1];
        setPreviousPayPeriodId(previousPayPeriod.id);
      }
    }
  }, [
    payPeriodData,
    currentPayPeriodId,
    previousPayPeriodId,
    setPreviousPayPeriodId,
  ]);

  // Keep componentType in sync with active tab and available components
  useEffect(() => {
    if (activeTabKey === 'all') {
      if (componentType) {
        setComponentType('');
      }
      return;
    }

    const componentsForTab =
      data?.components?.filter((item: any) =>
        filterComponentByTab(item, activeTabKey),
      ) || [];

    if (componentsForTab.length > 0) {
      const firstType = componentsForTab[0]?.type;
      if (firstType && firstType !== componentType) {
        setComponentType(firstType);
      }
    }
  }, [activeTabKey, data?.components, componentType, setComponentType]);

  const handleGoBack = () => {
    router.back();
  };

  const columns = [
    {
      title: 'Types',
      dataIndex: 'types',
      key: 'types',
      minWidth: 200,
      render: (notused: any, record: any) => (
        <div
          data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-122"
          className="flex items-center gap-2"
        >
          <span data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-123">
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
          <span data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-134">
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
          <span data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-144">
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
        const varianceValue = Number(key);
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
            data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-167"
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
        // Extract numeric value from string (handles percentage signs, etc.)
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
            data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-191"
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
  ];

  const filteredComponents =
    data?.components?.filter((item: any) =>
      filterComponentByTab(item, activeTabKey),
    ) || [];

  const payrollVarianceData = filteredComponents.map((item: any) => ({
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
  }));
  return (
    <div
      className="min-h-screen w-full px-3 sm:px-6 "
      id="manage-employees-page"
      data-cy="manage-employees-page"
    >
      <BlockWrapper className="h-auto w-full bg-white">
        {/* Header */}
        <div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6"
          id="manage-employees-header"
          data-cy="manage-employees-header"
        >
          <div
            className="flex items-start gap-3"
            data-cy="payroll-reconciliation-header-left"
          >
            <Button
              value={'back'}
              name="back"
              onClick={handleGoBack}
              className="border-none bg-transparent p-0 mr-2 flex items-center justify-center"
              id="payroll-reconciliation-back-btn"
              data-cy="payroll-reconciliation-back-btn"
            >
              <MdKeyboardArrowLeft className="text-xl" />
            </Button>
            <div data-cy="payroll-reconciliation-title-wrapper">
              <CustomBreadcrumb
                title="Payroll Reconciliation"
                subtitle="Employee Payroll Reconciliation"
              />
            </div>
          </div>

          <div
            data-cy="payroll-reconciliation-header-actions"
            className="flex flex-wrap items-center gap-3"
          >
            <Button
              type="default"
              size="large"
              className="flex items-center gap-2 border-gray-300 text-gray-700"
              icon={<PiExportLight />}
            >
              <span data-cy="payroll-reconciliation-export-text">Export</span>
            </Button>
            <Button
              type="primary"
              size="large"
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 border-none"
              data-cy="payroll-reconciliation-approve-btn"
            >
              <span data-cy="payroll-reconciliation-approve-text">
                Approve Payroll
              </span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Row
          gutter={[16, 16]}
          align="middle"
          className="mb-6 justify-end"
          data-cy="payroll-reconciliation-filters-row"
        >
          <Col xs={24} sm={12} md={6} lg={5} xl={4}>
            <div data-cy="payroll-reconciliation-previous-period-select">
              <Select
                placeholder="Previous Pay Period"
                allowClear
                style={{ width: '100%', height: '48px' }}
                value={previousPayPeriodId}
                onChange={(value) => setPreviousPayPeriodId(value)}
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
          <Col xs={24} sm={12} md={6} lg={5} xl={4}>
            <div data-cy="payroll-reconciliation-current-period-select">
              <Select
                allowClear
                className="min-h-12 w-full"
                placeholder="Current Pay Period"
                value={currentPayPeriodId}
                onChange={(value) => setCurrentPayPeriodId(value)}
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
        </Row>

        {/* Summary cards */}
        <div
          data-cy="payroll-reconciliation-summary-cards"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Total Payroll Cost */}
          <Card className="rounded-xl shadow-sm border" loading={isLoading}>
            <p
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-329"
              className="text-black text-sm mb-2 font-semibold"
            >
              Total Payroll Cost
            </p>
            <p
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-332"
              className="text-2xl font-bold text-black"
            >
              {data?.summary?.totalPayrollCost
                ? Number(data?.summary?.totalPayrollCost).toLocaleString()
                : 0}
            </p>

            <p
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-338"
              className="text-sm text-black mt-3 font-semibold"
            >
              Previous:{' '}
              <span
                data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-340"
                className="font-semibold"
              >
                {data?.summary?.previousPayrollCost
                  ? Number(data?.summary?.previousPayrollCost).toLocaleString()
                  : 0}
              </span>
            </p>
          </Card>
          {/* Net Variance */}
          <Card className="rounded-xl shadow-sm border" loading={isLoading}>
            <p
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-349"
              className="text-black text-sm mb-2 font-semibold"
            >
              Net Variance
            </p>
            <p
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-352"
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
              data-cy="payroll-payroll-reconcilation-page-tsx-p-419"
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
          {/* Headcount Impact */}
          <Card className="rounded-xl shadow-sm border" loading={isLoading}>
            <p
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-381"
              className="text-black text-sm mb-2 font-semibold"
            >
              Headcount Impact
            </p>
            <p
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-384"
              className="text-2xl font-bold text-black"
            >
              {data?.summary?.headcount} Employees
            </p>

            <div
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-388"
              className="flex gap-4 text-sm mt-3 text-black"
            >
              <p data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-389">
                Previous:{' '}
                <span
                  data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-391"
                  className="font-semibold"
                >
                  {data?.summary?.previousHeadcount}
                </span>
              </p>
              <p data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-395">
                Terminations:{' '}
                <span
                  data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-397"
                  className="font-semibold"
                >
                  {data?.summary?.terminations}
                </span>
              </p>
            </div>
          </Card>
        </div>

        <div
          data-cy="payroll-reconciliation-tabs"
          className="w-full mt-8 overflow-x-auto"
        >
          <Tabs
            activeKey={activeTabKey}
            onChange={(key) => setActiveTabKey(key)}
            items={reconciliationTabs}
            className="mb-2"
          />
        </div>

        {activeTabKey === 'all' && payrollVarianceData.length > 0 && (
          <div
            data-cy="payroll-reconciliation-all-category-table"
            className="w-full mt-4 overflow-x-auto"
          >
            <Table
              loading={isLoading}
              dataSource={payrollVarianceData}
              columns={columns}
              pagination={false}
            />
          </div>
        )}

        {activeTabKey !== 'all' && payrollVarianceData.length > 0 && (
          <div
            data-cy="payroll-reconciliation-detail-section"
            className="mt-8 flex flex-col md:flex-row gap-6 items-start"
          >
            {/* Left summary panel for selected component */}
            <div
              data-cy="payroll-reconciliation-detail-summary-card"
              className="w-full md:w-[260px] border border-[#f0f0f0] rounded-lg p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] bg-white shrink-0"
            >
              {(() => {
                const selected = payrollVarianceData[0] as any;
                const impactLabel = selected?.impact?.props?.children || '';
                const impactKey =
                  typeof impactLabel === 'string'
                    ? (impactLabel as keyof typeof impactColors)
                    : 'Low';

                return (
                  <>
                    <div
                      className="mb-4"
                      data-cy="payroll-reconciliation-detail-summary-previous"
                    >
                      <div
                        className="text-[#00000073] mb-1 text-[13px]"
                        data-cy="payroll-reconciliation-detail-summary-previous-label"
                      >
                        Total Previous
                      </div>
                      <div
                        className="text-[15px]"
                        data-cy="payroll-reconciliation-detail-summary-previous-value"
                      >
                        {selected?.previous ?? '--'}
                      </div>
                    </div>

                    <div
                      className="mb-5"
                      data-cy="payroll-reconciliation-detail-summary-current"
                    >
                      <div
                        className="text-[#00000073] mb-1 text-[13px]"
                        data-cy="payroll-reconciliation-detail-summary-current-label"
                      >
                        Current
                      </div>
                      <div
                        className="text-[15px]"
                        data-cy="payroll-reconciliation-detail-summary-current-value"
                      >
                        {selected?.current ?? '--'}
                      </div>
                    </div>

                    <div
                      className="border-t border-[#f0f0f0] pt-4 mb-4"
                      data-cy="payroll-reconciliation-detail-summary-variance-amt"
                    >
                      <div
                        className="text-[#00000073] mb-1 text-[13px]"
                        data-cy="payroll-reconciliation-detail-summary-variance-amt-label"
                      >
                        Variance(AMT)
                      </div>
                      <div
                        className="text-[#ff4d4f]"
                        data-cy="payroll-reconciliation-detail-summary-variance-amt-value"
                      >
                        {selected?.variance ?? '--'}
                      </div>
                    </div>

                    <div
                      className="mb-5"
                      data-cy="payroll-reconciliation-detail-summary-variance-pct"
                    >
                      <div
                        className="text-[#00000073] mb-1 text-[13px]"
                        data-cy="payroll-reconciliation-detail-summary-variance-pct-label"
                      >
                        Variance(%)
                      </div>
                      <div
                        className="text-[#52c41a]"
                        data-cy="payroll-reconciliation-detail-summary-variance-pct-value"
                      >
                        {selected?.variancePercentage ?? '--'}
                      </div>
                    </div>

                    <div
                      className="border-t border-[#f0f0f0] pt-4"
                      data-cy="payroll-reconciliation-detail-summary-impact"
                    >
                      <div
                        className="text-[#00000073] mb-2 text-[13px]"
                        data-cy="payroll-reconciliation-detail-summary-impact-label"
                      >
                        Impact
                      </div>
                      <div
                        className="flex items-center gap-2"
                        data-cy="payroll-reconciliation-detail-summary-impact-value"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              impactColors[impactKey] || impactColors.Low,
                          }}
                        />
                        <span
                          className="text-[13px]"
                          data-cy="payroll-reconciliation-detail-summary-impact-text"
                        >
                          {impactLabel || '--'}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Right panel: employees table for selected component */}
            <div
              data-cy="payroll-reconciliation-detail-table-panel"
              className="flex-1 w-full bg-[#fafafa] border border-[#f0f0f0] rounded-lg p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            >
              {/* Search / employee select */}
              <div
                data-cy="payroll-reconciliation-detail-search-wrap"
                className="w-full max-w-xs mb-5"
              >
                <Select
                  showSearch
                  allowClear
                  className="h-11 w-full rounded-lg border-[#d9d9d9] bg-white text-[14px]"
                  placeholder="Search Employee"
                  value={search || undefined}
                  onChange={(value) => {
                    setSearch(value || '');
                    setCurrentPage(1);
                  }}
                  filterOption={(input, option) => {
                    const label = option?.label as string | undefined;
                    return (
                      typeof label === 'string' &&
                      label.toLowerCase().includes(input.toLowerCase())
                    );
                  }}
                  options={employeeOptions}
                />
              </div>

              <div
                data-cy="payroll-reconciliation-detail-table-wrapper"
                className="bg-white rounded-lg overflow-hidden border-b border-[#f0f0f0]"
              >
                <table
                  className="w-full text-left border-collapse"
                  data-cy="payroll-reconciliation-detail-table"
                >
                  <thead
                    className="bg-[#fafafa]"
                    data-cy="payroll-reconciliation-detail-table-head"
                  >
                    <tr data-cy="payroll-reconciliation-detail-table-head-row">
                      <th
                        className="py-3.5 px-4 font-medium text-[#000000d9] border-b border-[#f0f0f0]"
                        data-cy="payroll-reconciliation-detail-table-head-employee"
                      >
                        Employee
                      </th>
                      <th
                        className="py-3.5 px-4 font-medium text-[#000000d9] border-b border-[#f0f0f0]"
                        data-cy="payroll-reconciliation-detail-table-head-current"
                      >
                        Current
                      </th>
                      <th
                        className="py-3.5 px-4 font-medium text-[#000000d9] border-b border-[#f0f0f0]"
                        data-cy="payroll-reconciliation-detail-table-head-previous"
                      >
                        Previous
                      </th>
                      <th
                        className="py-3.5 px-4 font-medium text-[#000000d9] border-b border-[#f0f0f0]"
                        data-cy="payroll-reconciliation-detail-table-head-diff"
                      >
                        Difference
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y divide-[#f0f0f0]"
                    data-cy="payroll-reconciliation-detail-table-body"
                  >
                    {isLoadingDetails && (
                      <tr data-cy="payroll-reconciliation-detail-table-loading-row">
                        <td
                          colSpan={4}
                          className="py-8 text-center text-[#00000073]"
                          data-cy="payroll-reconciliation-detail-table-loading-cell"
                        >
                          Loading...
                        </td>
                      </tr>
                    )}
                    {!isLoadingDetails &&
                      reconciliationDetails?.employeeVariances?.items?.map(
                        (item: any) => {
                          const employeeName = item.employeeName || '--';
                          const current = Number(item.current).toFixed(2);
                          const previous = Number(item.previous).toFixed(2);
                          const rawDiff =
                            item.difference != null &&
                            !isNaN(Number(item.difference))
                              ? Number(item.difference).toFixed(2)
                              : '--';
                          const diffNum = Number(rawDiff);
                          const diffClass =
                            rawDiff === '--'
                              ? 'text-[#000000d9]'
                              : diffNum > 0
                                ? 'text-[#ff4d4f]'
                                : diffNum < 0
                                  ? 'text-[#52c41a]'
                                  : 'text-[#000000d9]';

                          return (
                            <tr
                              data-cy="payroll-reconciliation-detail-table-body-row"
                              key={
                                item.userId ||
                                item.employeeId ||
                                item.id ||
                                employeeName
                              }
                              className="hover:bg-[#fafafa] transition-colors"
                            >
                              <td
                                className="py-4 px-4 text-[#000000d9]"
                                data-cy="payroll-reconciliation-detail-table-body-employee"
                              >
                                {employeeName}
                              </td>
                              <td
                                className="py-4 px-4 text-[#000000d9]"
                                data-cy="payroll-reconciliation-detail-table-body-current"
                              >
                                {current}
                              </td>
                              <td
                                className="py-4 px-4 text-[#000000d9]"
                                data-cy="payroll-reconciliation-detail-table-body-previous"
                              >
                                {previous}
                              </td>
                              <td
                                className={`py-4 px-4 ${diffClass}`}
                                data-cy="payroll-reconciliation-detail-table-body-diff"
                              >
                                {rawDiff}
                              </td>
                            </tr>
                          );
                        },
                      )}
                    {!isLoadingDetails &&
                      !reconciliationDetails?.employeeVariances?.items
                        ?.length && (
                        <tr data-cy="payroll-reconciliation-detail-table-empty-row">
                          <td
                            colSpan={4}
                            className="py-8 text-center text-[#00000073]"
                            data-cy="payroll-reconciliation-detail-table-empty-cell"
                          >
                            No employee found
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div
                data-cy="payroll-reconciliation-detail-pagination"
                className="mt-4 flex justify-end"
              >
                {isMobile || isTablet ? (
                  <CustomMobilePagination
                    currentPage={currentPage}
                    totalResults={
                      reconciliationDetails?.employeeVariances?.meta
                        ?.totalItems ?? 0
                    }
                    pageSize={pageSize}
                    onShowSizeChange={(current, size) => {
                      setCurrentPage(current);
                      setPageSize(size);
                    }}
                  />
                ) : (
                  <CustomPagination
                    current={currentPage}
                    total={
                      reconciliationDetails?.employeeVariances?.meta
                        ?.totalItems ?? 0
                    }
                    pageSize={pageSize}
                    onChange={(page, size) => {
                      setCurrentPage(page);
                      if (size) {
                        setPageSize(size);
                      }
                    }}
                    onShowSizeChange={(newPageSize) => {
                      setPageSize(newPageSize);
                      setCurrentPage(1);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </BlockWrapper>
    </div>
  );
};

export default PayrollReconcilation;
