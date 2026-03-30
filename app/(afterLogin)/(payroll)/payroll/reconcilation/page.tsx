'use client';
import {
  Breadcrumb,
  Button,
  Card,
  Divider,
  Dropdown,
  notification,
  Select,
  Table,
  Tabs,
} from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import ReconciliationDetailTable from './_components/reconciliationDetailTable';
import { useState, useEffect } from 'react';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

import {
  useGetPayPeriod,
  useGetActivePayroll,
} from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';
import { useGetReconciliation } from '@/store/server/features/payroll/reconcilation/queries';
import { useReconciliationState } from '@/store/uistate/features/payroll/reconcilation';
import useEmployeeStore from '@/store/uistate/features/payroll/employeeInfoStore';
import { useRouter } from 'next/navigation';
import {
  useGetPayrollApprovalByPayPeriodId,
  useGetPendingPayrollApprovals,
} from '@/store/server/features/payroll/payrollApproval/queries';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  useApprovePayrollApproval,
  useLastApprovingPayroll,
} from '@/store/server/features/payroll/payrollApproval/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';

const { Option } = Select;

const PayrollReconcilation = () => {
  const router = useRouter();
  const {
    previousPayPeriodId,
    currentPayPeriodId,
    setPreviousPayPeriodId,
    setCurrentPayPeriodId,
  } = useReconciliationState();

  const { data, isLoading } = useGetReconciliation({
    previousPayPeriodId,
    currentPayPeriodId,
  });

  const { data: payPeriodData } = useGetPayPeriod();
  const { pageSize: employeePageSize, currentPage: employeeCurrentPage } =
    useEmployeeStore();
  const [activeTab, setActiveTab] = useState('1');
  const [isApproveDropdownOpen, setIsApproveDropdownOpen] = useState(false);
  const [isShowMobileFilters, setIsShowMobileFilters] = useState(false);

  const authStore = useAuthenticationStore.getState();
  const { userId } = useAuthenticationStore();
  const tenantId = authStore.tenantId;
  const userRollId = authStore.userData?.roleId;

  // Fetch pending approvals with payPeriodId
  const { data: pendingApprovals, refetch: refetchPendingApprovals } =
    useGetPendingPayrollApprovals(currentPayPeriodId, 1, 10);
  const { mutate: approvePayroll, isLoading: isApproving } =
    useApprovePayrollApproval();
  const { mutate: lastApproving, isLoading: isLastApproving } =
    useLastApprovingPayroll();
  // Fetch payroll approval by payPeriodId
  const { refetch: refetchPayrollApprovalByPayPeriod } =
    useGetPayrollApprovalByPayPeriodId(currentPayPeriodId);
  const { data: payroll, refetch } = useGetActivePayroll(
    '',
    employeePageSize || 10,
    employeeCurrentPage || 1,
  );

  const pendingApproval = pendingApprovals?.items?.[0] || null;
  const { isMobile } = useIsMobile();

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

  const handleGoBack = () => {
    router.back();
  };

  const columns = [
    {
      title: (
        <span
          id="payroll-reconciliation-types-title"
          data-cy="payroll-reconciliation-types-title"
          className="text-sm font-bold text-[#4b4b4b]"
        >
          Types
        </span>
      ),
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
      title: (
        <span
          id="payroll-reconciliation-previous-title"
          data-cy="payroll-reconciliation-previous-title"
          className="text-sm font-bold text-[#4b4b4b]"
        >
          Previous
        </span>
      ),
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
      title: (
        <span
          id="payroll-reconciliation-current-title"
          data-cy="payroll-reconciliation-current-title"
          className="text-sm font-bold text-[#4b4b4b]"
        >
          Current
        </span>
      ),
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
      title: (
        <span
          id="payroll-reconciliation-variance-title"
          data-cy="payroll-reconciliation-variance-title"
          className="text-sm font-bold text-[#4b4b4b]"
        >
          Variance(AMT)
        </span>
      ),
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
      title: (
        <span
          id="payroll-reconciliation-variance-percentage-title"
          data-cy="payroll-reconciliation-variance-percentage-title"
          className="text-sm font-bold text-[#4b4b4b]"
        >
          Variance(%)
        </span>
      ),
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
      title: (
        <span
          id="payroll-reconciliation-impact-title"
          data-cy="payroll-reconciliation-impact-title"
          className="text-sm font-bold text-[#4b4b4b]"
        >
          Impact
        </span>
      ),
      dataIndex: 'impact',
      key: 'impact',
      minWidth: 150,
      render: (notused: any, record: any) => record.impact || '--',
    },
  ];

  const payrollVarianceData = data?.components?.map((item: any) => ({
    types: (
      <span
        id="payroll-reconciliation-types"
        data-cy="payroll-reconciliation-types"
        className="text-sm font-normal text-[#4d4d4d]"
      >
        {item.label}
      </span>
    ),
    previous: (
      <span
        id="payroll-reconciliation-previous"
        data-cy="payroll-reconciliation-previous"
        className="text-sm font-normal text-[#4d4d4d]"
      >
        {Number(item.previous).toLocaleString()}
      </span>
    ),
    current: (
      <span
        id="payroll-reconciliation-current"
        data-cy="payroll-reconciliation-current"
        className="text-sm font-normal text-[#4d4d4d]"
      >
        {Number(item.current).toLocaleString()}
      </span>
    ),
    variance:
      item.variance != null && !isNaN(Number(item.variance))
        ? Number(item.variance).toLocaleString()
        : '--',
    variancePercentage:
      item?.variancePercentage != null && item?.variancePercentage !== ''
        ? item.variancePercentage
        : '--',
    impact: (
      <div
        data-cy="reconciliation-detail-table-impact-container"
        className="flex items-center gap-2"
      >
        <span
          data-cy="reconciliation-detail-table-impact-icon"
          className={`inline-block h-[6px] w-[6px] rounded-full ${
            (item.impact || '').toLowerCase() === 'high'
              ? 'bg-[#ff4d4f]'
              : (item.impact || '').toLowerCase() === 'medium'
                ? 'bg-[#faad14]'
                : 'bg-[#52c41a]'
          }`}
        />
        <span
          data-cy="reconciliation-detail-table-impact"
          className="capitalize"
        >
          {item.impact}
        </span>
      </div>
    ),
  }));

  // Tab key -> category label (used to find component type from data?.components)
  const TAB_KEY_TO_LABEL: Record<string, string> = {
    '2': 'Basic',
    '3': 'Allowance',
    '4': 'Benefit',
    '5': 'VP',
    '6': 'Incentive',
    '7': 'Gross',
    '8': 'Tax',
    '9': 'Pension',
    '10': 'Cost Sharing',
    '11': 'Deduction',
    '12': 'Net Pay',
  };

  /** Resolve API componentType for a tab (e.g. BASIC_SALARY for Basic) from reconciliation components */
  const getComponentForTabKey = (tabKey: string): any | undefined => {
    if (!data?.components?.length) return undefined;

    const label = TAB_KEY_TO_LABEL[tabKey];
    let matched = label
      ? data.components.find((c: any) =>
          c.label?.toLowerCase().includes(label.toLowerCase()),
        )
      : undefined;

    // Special handling for VP tab: fall back to VARIABLE_PAY type
    if (!matched && tabKey === '5') {
      matched = data.components.find(
        (c: any) => c.type === 'VARIABLE_PAY' || c.label === 'Variable Pay',
      );
    }

    return matched;
  };

  /** Tab 1: summary table (All Category). Tabs 2–12: detail table (same as modal). */
  const renderTabContent = (tabKey: string) => {
    if (tabKey === '1') {
      return (
        <div
          data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-405"
          className="w-full overflow-x-auto scrollbar-hide"
        >
          <Table
            loading={isLoading}
            dataSource={payrollVarianceData}
            columns={columns}
            pagination={false}
            rowHoverable={false}
            rowClassName={(notUsed, index) =>
              index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
            }
          />
        </div>
      );
    }
    const component = getComponentForTabKey(tabKey);
    const componentType = component?.type;
    return (
      <ReconciliationDetailTable
        previousPayPeriodId={previousPayPeriodId ?? ''}
        currentPayPeriodId={currentPayPeriodId ?? ''}
        componentType={componentType ?? ''}
        enabled={Boolean(componentType)}
        componentSummary={component}
      />
    );
  };

  const getTabLabel = (key: string, text: string) => (
    <span
      data-cy="payroll-reconciliation-tab-label"
      className={activeTab === key ? 'font-bold' : 'font-normal'}
    >
      {text}
    </span>
  );

  const items: any = [
    {
      key: '1',
      label: getTabLabel('1', 'All Category'),
      children: renderTabContent('1'),
    },
    {
      key: '2',
      label: getTabLabel('2', 'Basic'),
      children: renderTabContent('2'),
    },
    {
      key: '3',
      label: getTabLabel('3', 'Allowance'),
      children: renderTabContent('3'),
    },
    {
      key: '4',
      label: getTabLabel('4', 'Benefit'),
      children: renderTabContent('4'),
    },
    {
      key: '5',
      label: getTabLabel('5', 'VP'),
      children: renderTabContent('5'),
    },
    {
      key: '6',
      label: getTabLabel('6', 'Incentive'),
      children: renderTabContent('6'),
    },
    {
      key: '7',
      label: getTabLabel('7', 'Gross'),
      children: renderTabContent('7'),
    },
    {
      key: '8',
      label: getTabLabel('8', 'Tax'),
      children: renderTabContent('8'),
    },
    {
      key: '9',
      label: getTabLabel('9', 'Pension'),
      children: renderTabContent('9'),
    },
    {
      key: '10',
      label: getTabLabel('10', 'Cost Sharing'),
      children: renderTabContent('10'),
    },
    {
      key: '11',
      label: getTabLabel('11', 'Deduction'),
      children: renderTabContent('11'),
    },
    {
      key: '12',
      label: getTabLabel('12', 'Net Pay'),
      children: renderTabContent('12'),
    },
  ];

  const handleApprovePayroll = () => {
    if (!pendingApproval) return;

    const approvalWorkflowId = String(pendingApproval.approvalWorkflowId || '');
    const stepOrder = Number(pendingApproval.nextApprover?.[0]?.stepOrder || 0);

    if (!approvalWorkflowId || stepOrder === 0) {
      notification.error({
        message: 'Invalid Approval Data',
        description: 'Missing required approval information. Please try again.',
      });
      return;
    }

    const approvalData = {
      approvalWorkflowId,
      stepOrder,
      requestId: pendingApproval.id,
      approvedUserId: userId,
      approverRoleId: userRollId,
      action: 'Approved',
      tenantId,
    };

    const handleSuccess = () => {
      setIsApproveDropdownOpen(false);
      refetchPendingApprovals();
      refetchPayrollApprovalByPayPeriod();
      refetch();
    };

    approvePayroll(approvalData, {
      onSuccess: (data) => {
        if (data?.last === true) {
          lastApproving(undefined, { onSuccess: handleSuccess });
        } else {
          handleSuccess();
        }
      },
    });
  };

  const MobileFilters = () => (
    <div
      data-cy="reconciliation-detail-table-mobile-filters-container"
      className="flex flex-col gap-4 bg-white border border-[#D9D9D9] rounded-lg p-4"
    >
      <Select
        placeholder="Select date"
        allowClear
        suffixIcon={<CalendarOutlined />}
        className="max-w-[215px] h-10"
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
      <Select
        allowClear
        placeholder="Select date"
        suffixIcon={<CalendarOutlined />}
        className="max-w-[215px] h-10"
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
  );

  const formatNumber = (value: number | string | null | undefined) =>
    Number(value ?? 0).toLocaleString();

  const formatETB = (value: number | string | null | undefined) =>
    `ETB ${formatNumber(value)}`;

  return (
    <div id="payroll-reconciliation-page" data-cy="payroll-reconciliation-page">
      <style data-cy="payroll-reconciliation-page-styles">{`
        @media (min-width: 640px) {
        .full-bleed-header-divider {
          width: calc(100% + 48px) !important;
          margin-left: -24px !important;
          margin-right: -24px !important;
          min-width: calc(100% + 48px) !important;
        }
      }
      `}</style>
      <div
        className="mt-6"
        id="payroll-reconciliation-header"
        data-cy="payroll-reconciliation-header"
      >
        <div
          id="payroll-reconciliation-header-container"
          className="flex justify-between gap-4"
          data-cy="payroll-reconciliation-header-container"
        >
          <div
            data-cy="payroll-reconciliation-header-content"
            id="payroll-reconciliation-header-content"
            className="flex items-start gap-2"
          >
            <div
              data-cy="payroll-reconciliation-back-btn-container"
              className="py-3"
            >
              <Button
                type="default"
                value={'back'}
                name="back"
                onClick={handleGoBack}
                className="border-[1px] border-[#D9D9D9] h-8 w-8 p-0 m-0"
                id="payroll-reconciliation-back-btn"
                data-cy="payroll-reconciliation-back-btn"
              >
                <ArrowBackIosIcon className="text-[8px]" />
              </Button>
            </div>
            <div data-cy="org-settings-header-container">
              <h3
                className="text-gray-900 text-2xl font-bold mb-0 text-nowrap"
                data-cy="org-settings-page-header-title"
                id="org-settings-page-header-title"
              >
                Payroll Reconciliation
              </h3>
              <Breadcrumb
                className="mt-2 mb-0 whitespace-nowrap"
                style={{ whiteSpace: 'nowrap' }}
                items={[
                  {
                    title: (
                      <a
                        href="/payroll/payroll"
                        onClick={(e) => {
                          e.preventDefault();
                          router.push('/payroll/payroll');
                        }}
                        data-cy="payroll-reconciliation-breadcrumb-payroll-link"
                        className="text-xs sm:text-sm"
                      >
                        Payroll
                      </a>
                    ),
                  },
                  {
                    title: (
                      <span
                        data-cy="payroll-reconciliation-breadcrumb-employee-reconciliation"
                        className="text-xs sm:text-sm"
                      >
                        Employee’s Payroll Reconciliation
                      </span>
                    ),
                  },
                ]}
                data-cy="payroll-reconciliation-breadcrumb"
              />
            </div>
          </div>

          <div
            data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-278"
            className="flex items-center justify-end gap-3 pt-3"
          >
            <Button
              type="default"
              size="small"
              className="h-8 w-8 sm:w-auto sm:px-4 text-[#3A3A3A] border-[#D9D9D9] pl-3 rounded-md"
              icon={<SaveAltIcon className="text-sm" />}
            >
              <span data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-285">
                {!isMobile && 'Export'}
              </span>
            </Button>
            
            {true && (
              <Dropdown
                trigger={['click']}
                open={isApproveDropdownOpen}
                onOpenChange={setIsApproveDropdownOpen}
                placement="bottomRight"
                getPopupContainer={(triggerNode) =>
                  triggerNode.parentElement || document.body
                }
                dropdownRender={() => (
                  <div
                    data-cy="payroll-approve-dropdown"
                    className="w-[260px] rounded-lg border border-[#f0f0f0] bg-white p-3 shadow-lg"
                  >
                    <div
                      data-cy="payroll-approve-dropdown-title"
                      className="text-base font-semibold text-[#262626]"
                    >
                      Approve Payroll
                    </div>
                    <div
                      data-cy="payroll-approve-dropdown-description"
                      className="mt-1 text-xs text-[#595959]"
                    >
                      Do you wish to approve this payroll?
                    </div>
                    <div
                      data-cy="payroll-approve-dropdown-actions"
                      className="mt-3 flex justify-end gap-2"
                    >
                      <Button
                        id="payroll-approve-dropdown-cancel"
                        data-cy="payroll-approve-dropdown-cancel"
                        size="small"
                        onClick={() => setIsApproveDropdownOpen(false)}
                        className="h-8 border-[1px] border-[#d9d9d9] font-normal"
                      >
                        Cancel
                      </Button>
                      <Button
                        id="payroll-approve-dropdown-approve"
                        data-cy="payroll-approve-dropdown-approve"
                        type="primary"
                        size="small"
                        onClick={handleApprovePayroll}
                        loading={isApproving || isLastApproving}
                        className="h-8 font-normal"
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                )}
              >
                <Button
                  id="payroll-approve-button"
                  data-cy="payroll-approve-button"
                  type="primary"
                  icon={<DoneOutlineIcon className="text-[10px]" />}
                  className="h-8 w-8 sm:w-auto sm:px-4"
                  loading={isApproving || isLastApproving}
                  size="small"
                >
                  {!isMobile && 'Approve Payroll'}
                </Button>
              </Dropdown>
            )}
          </div>
        </div>
        <Divider
          className="full-bleed-header-divider"
          style={{ margin: '24px 0 24px 0', borderColor: '#f0f0f0' }}
        />
      </div>
      <div
        data-cy="payroll-reconciliation-mobile-filters-container"
        className="sm:hidden flex justify-end"
      >
        <Dropdown
          overlay={<MobileFilters />}
          trigger={['click']}
          open={isShowMobileFilters}
          onOpenChange={setIsShowMobileFilters}
          data-cy="time-attendance-employee-attendance-mobile-filter-dropdown"
          className="sm:hidden"
        >
          <Button
            className={`h-8 rounded-md flex items-center justify-center border border-[#d9d9d9] text-base font-normal text-[#4d4d4d]`}
            id="time-attendance-employee-attendance-mobile-filter-toggle-button"
            data-cy="time-attendance-employee-attendance-mobile-filter-toggle-button"
            icon={
              <FilterAltOutlinedIcon className="text-[#374151] text-base" />
            }
          >
            Filter
          </Button>
        </Dropdown>
      </div>
      <div
        data-cy="payroll-reconciliation-filters-container"
        className="justify-end gap-4 my-4 hidden sm:flex"
      >
        <Select
          placeholder="Select date"
          allowClear
          suffixIcon={<CalendarOutlined />}
          className="max-w-[215px] h-10"
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
        <Select
          allowClear
          placeholder="Select date"
          suffixIcon={<CalendarOutlined />}
          className="max-w-[215px] h-10"
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

      <div
        data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-326"
        className="grid w-full grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-[80px] mb-6 mt-3"
      >
        {/* Total Payroll Cost */}
        <Card
          className="w-full rounded-lg border border-[#D0D7E2] shadow-none"
          loading={isLoading}
        >
          <p
            data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-329"
            className="text-[#707070] text-base mb-2 font-normal"
          >
            Total Payroll Cost
          </p>
          <p
            data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-332"
            className="text-3xl font-bold text-black"
          >
            {formatETB(data?.summary?.totalPayrollCost)}
          </p>

          <p
            data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-338"
            className="text-sm text-[#4d4d4d] mt-3 font-normal"
          >
            Previous:{' '}
            <span
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-340"
              className="font-normal text-[#4d4d4d]"
            >
              {formatNumber(data?.summary?.previousPayrollCost)}
            </span>
          </p>
        </Card>
        {/* Net Variance */}
        <Card
          className="w-full rounded-lg border border-[#D0D7E2] shadow-none"
          loading={isLoading}
        >
          <p
            data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-349"
            className="text-[#707070] text-base mb-2 font-normal"
          >
            Net Variance
          </p>
          <p
            data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-352"
            className="text-3xl font-bold text-black"
          >
            {formatETB(data?.summary?.netVariance)}
          </p>
          <p
            data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-355"
            className="text-sm text-[#4d4d4d] mt-3 font-normal"
          >
            <span
              data-cy="reconciliation-detail-table-net-variance-negative-container"
              className="text-[#F04438]"
            >
              -4
            </span>{' '}
            <span
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-357"
              className="font-normal text-[#4d4d4d]"
            >
              Since Last pay period
            </span>
          </p>
        </Card>
        {/* Headcount Impact */}
        <Card
          className="w-full rounded-lg border border-[#D0D7E2] shadow-none"
          loading={isLoading}
        >
          <p
            data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-381"
            className="text-[#707070] text-base mb-2 font-normal"
          >
            Headcount Impact
          </p>
          <p
            data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-384"
            className="text-3xl font-bold text-black"
          >
            {formatNumber(data?.summary?.headcount)} Employees
          </p>

          <div
            data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-388"
            className="flex gap-4 text-sm mt-3 text-black"
          >
            <p
              className="font-normal text-[#4d4d4d]"
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-389"
            >
              Previous:{' '}
              <span
                data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-391"
                className="font-normal text-[#4d4d4d]"
              >
                {formatNumber(data?.summary?.previousHeadcount)}
              </span>
            </p>
            <p
              className="font-normal text-[#4d4d4d]"
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-395"
            >
              Termination:{' '}
              <span
                data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-397"
                className="font-normal text-[#4d4d4d]"
              >
                {formatNumber(data?.summary?.terminations)}
              </span>
            </p>
          </div>
        </Card>
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        tabBarGutter={24}
        size="large"
        tabBarStyle={{ textAlign: 'center' }}
        data-cy="employee-detail-tabs"
      />
    </div>
  );
};

export default PayrollReconcilation;
