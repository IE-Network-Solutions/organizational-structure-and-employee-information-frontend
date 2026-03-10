'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import {
  Button,
  Card,
  Col,
  Modal,
  notification,
  Row,
  Select,
  Table,
  Tabs,
  Tag,
} from 'antd';
import { PiExportLight } from 'react-icons/pi';
import ReconciliationDetailTable from './_components/reconciliationDetailTable';
import { useState, useEffect } from 'react';

import {
  useGetPayPeriod,
  useGetActivePayroll,
} from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';
import { useGetReconciliation } from '@/store/server/features/payroll/reconcilation/queries';
import { useReconciliationState } from '@/store/uistate/features/payroll/reconcilation';
import useEmployeeStore from '@/store/uistate/features/payroll/employeeInfoStore';
import { useRouter } from 'next/navigation';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import {
  useGetPayrollApprovalByPayPeriodId,
  useGetPendingPayrollApprovals,
} from '@/store/server/features/payroll/payrollApproval/queries';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  useApprovePayrollApproval,
  useLastApprovingPayroll,
} from '@/store/server/features/payroll/payrollApproval/mutation';
import { TbFileExport } from 'react-icons/tb';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const { Option } = Select;
const impactColors = {
  High: 'red',
  Medium: 'orange',
  Low: 'green',
};

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
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

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
  const {
    refetch: refetchPayrollApprovalByPayPeriod,
  } = useGetPayrollApprovalByPayPeriodId(currentPayPeriodId);
  const { data: payroll, refetch } = useGetActivePayroll(
    '',
    employeePageSize || 10,
    employeeCurrentPage || 1,
  );

  const hasPendingApprovals = pendingApprovals?.items?.length > 0;
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

  const payrollVarianceData = data?.components?.map((item: any) => ({
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
          className="w-full overflow-x-auto"
        >
          <Table
            loading={isLoading}
            dataSource={payrollVarianceData}
            columns={columns}
            pagination={false}
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

  const items: any = [
    { key: '1', label: 'All Category', children: renderTabContent('1') },
    { key: '2', label: 'Basic', children: renderTabContent('2') },
    { key: '3', label: 'Allowance', children: renderTabContent('3') },
    { key: '4', label: 'Benefit', children: renderTabContent('4') },
    { key: '5', label: 'VP', children: renderTabContent('5') },
    { key: '6', label: 'Incentive', children: renderTabContent('6') },
    { key: '7', label: 'Gross', children: renderTabContent('7') },
    { key: '8', label: 'Tax', children: renderTabContent('8') },
    { key: '9', label: 'Pension', children: renderTabContent('9') },
    { key: '10', label: 'Cost Sharing', children: renderTabContent('10') },
    { key: '11', label: 'Deduction', children: renderTabContent('11') },
    { key: '12', label: 'Net Pay', children: renderTabContent('12') },
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
      setIsApproveModalOpen(false);
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

  return (
    <div
      className="min-h-screen w-full px-3 sm:px-6 "
      id="manage-employees-page"
      data-cy="manage-employees-page"
    >
      <div
        className="flex flex-wrap justify-between items-center"
        id="manage-employees-header"
        data-cy="manage-employees-header"
      >
        <Button
          value={'back'}
          name="back"
          onClick={handleGoBack}
          className="border-none bg-transparent p-0 mr-2"
          id="payroll-reconciliation-back-btn"
          data-cy="payroll-reconciliation-back-btn"
        >
          <MdKeyboardArrowLeft className="text-lg sm:text-2xl" />
        </Button>
        <CustomBreadcrumb
          title="Payroll Reconciliation"
          subtitle="Employee Payroll Reconciliation"
        />

        <div
          data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-278"
          className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8"
        >
          <Button
            type="primary"
            size="large"
            className="h-10 w-10 sm:w-auto"
            icon={<PiExportLight />}
          >
            <span
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-285"
              className="hidden sm:inline"
            >
              Export
            </span>
          </Button>
          {hasPendingApprovals && (
            <Button
              id="payroll-approve-button"
              data-cy="payroll-approve-button"
              type="primary"
              className={`p-5 mr-2 ${isMobile ? 'flex items-center justify-center' : ''}`}
              onClick={() => setIsApproveModalOpen(true)}
              loading={isApproving || isLastApproving}
            >
              {isMobile ? (
                <TbFileExport data-cy="payroll-approve-icon" size={24} />
              ) : (
                'Approve Payroll'
              )}
            </Button>
          )}
        </div>
      </div>
      <Row gutter={[16, 16]} align="middle" className="mb-6">
        <Col xs={24} sm={24} md={4} lg={4} xl={4}>
          <div data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-291">
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
        <Col xs={24} sm={24} md={4} lg={4} xl={4}>
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
        </Col>
      </Row>

      <div
        data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-326"
        className="grid grid-cols-1 lg:grid lg:grid-cols-3 xl:grid-cols-3 md:grid-cols-1 gap-12 mb-3"
      >
        {/* Total Payroll Cost */}
        <Card className="rounded-lg shadow-sm border" loading={isLoading}>
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
            {data?.summary?.totalPayrollCost
              ? Number(data?.summary?.totalPayrollCost).toLocaleString()
              : 0}
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
              {data?.summary?.previousPayrollCost
                ? Number(data?.summary?.previousPayrollCost).toLocaleString()
                : 0}
            </span>
          </p>
        </Card>
        {/* Net Variance */}
        <Card className="rounded-lg shadow-sm border" loading={isLoading}>
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
            {data?.summary?.netVariance
              ? Number(data?.summary?.netVariance).toLocaleString()
              : 0}
          </p>
          <p
            data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-355"
            className="text-sm text-[#4d4d4d] mt-3 font-normal"
          >
            Previous:{' '}
            <span
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-357"
              className="font-normal text-[#4d4d4d]"
            >
              {data?.summary?.previousNetVariance
                ? Number(data?.summary?.previousNetVariance).toLocaleString()
                : 0}
            </span>
          </p>
        </Card>
        {/* Headcount Impact */}
        <Card className="rounded-lg shadow-sm border" loading={isLoading}>
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
            {data?.summary?.headcount} Employees
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
                {data?.summary?.previousHeadcount}
              </span>
            </p>
            <p
              className="font-normal text-[#4d4d4d]"
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-395"
            >
              Terminations:{' '}
              <span
                data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-397"
                className="font-normal text-[#4d4d4d]"
              >
                {data?.summary?.terminations}
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
      <Modal
        data-cy="payroll-approve-modal"
        open={isApproveModalOpen}
        onCancel={() => setIsApproveModalOpen(false)}
        footer={null}
        centered
        width={600}
        className="p-6"
      >
        <div
          id="payroll-approve-modal-content"
          data-cy="payroll-approve-modal-content"
          className="flex flex-col items-center justify-center gap-4"
        >
          <h2
            id="payroll-approve-modal-title"
            data-cy="payroll-approve-modal-title"
            className="text-2xl font-bold"
          >
            Approve Payroll
          </h2>
          <p
            id="payroll-approve-modal-description"
            data-cy="payroll-approve-modal-description"
            className="text-lg text-gray-600"
          >
            Do you wish to Approve this payroll
          </p>
          <div
            id="payroll-approve-modal-footer"
            data-cy="payroll-approve-modal-footer"
            className="flex gap-4 w-full justify-center mt-4"
          >
            <Button
              id="payroll-approve-modal-cancel"
              data-cy="payroll-approve-modal-cancel"
              className="w-full h-12 text-lg font-semibold"
              onClick={() => setIsApproveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              id="payroll-approve-modal-approve"
              data-cy="payroll-approve-modal-approve"
              type="primary"
              className="w-full h-12 text-lg font-semibold bg-primary"
              onClick={handleApprovePayroll}
              loading={isApproving || isLastApproving}
            >
              Approve
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PayrollReconcilation;
