'use client';

import { useMemo, useState } from 'react';
import { Button, Tag } from 'antd';
import dayjs from 'dayjs';
import * as ExcelJS from 'exceljs';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PaymentsIcon from '@mui/icons-material/Payments';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { MdAttachMoney, MdCardGiftcard } from 'react-icons/md';
import PayrollCard from '../cards';
import PayrollSummaryCardsSkeleton from '../PayrollSummaryCardsSkeleton';
import ActivityLogTab from '../activityLogTab';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { PayPeriod } from '@/store/server/features/payroll/payroll/interface';
import { usePayrollActivityLogStore } from '@/store/uistate/features/payroll/activityLog';
import { formatPayPeriodLabel } from '../payPeriodSelect';
import {
  MOCK_PAYROLL_APPROVERS,
  getMockPayrollBundle,
  isMockPayPeriodId,
  MOCK_PAY_PERIODS,
} from '../payPeriodSelect/mockPayPeriods';
import {
  overallStatusIcon,
  resolvePayrollApprovalWorkflow,
} from '../approvalWorkflow';
import Image from 'next/image';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

const PAYROLL_SUMMARY_CARDS_ROW_CLASS =
  'mb-0 flex flex-nowrap gap-4 overflow-x-auto overflow-y-visible pb-2 scroll-smooth snap-x snap-mandatory [-webkit-overflow-scrolling:touch] touch-pan-x lg:grid lg:grid-cols-5 lg:overflow-x-visible lg:snap-none';

const PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS =
  'min-w-[228px] w-[min(88vw,304px)] shrink-0 snap-start lg:min-w-0 lg:h-full lg:w-full lg:shrink lg:max-w-none';

type PayrollOverviewItem = {
  totalAllowance?: number | string;
  totalMerit?: number | string;
  grossSalary?: number | string;
  totalDeductions?: number | string;
  netPay?: number | string;
};

type PayrollOverviewBundle = {
  items?: PayrollOverviewItem[];
  meta?: { totalItems?: number };
  totalGrossPaymentAmount?: string | number;
  totalNetPayAmount?: string | number;
  totalAllowanceAmount?: string | number;
  totalMeritAmount?: string | number;
  totalDeductionsAmount?: string | number;
  differenceFromLastPayPeriod?: {
    totalGrossPaymentAmount?: number;
    totalNetPayAmount?: number;
    totalAllowanceAmount?: number;
    totalMeritAmount?: number;
    totalDeductionsAmount?: number;
  };
};

interface OverviewTabProps {
  payPeriodId: string;
  payrollForExport?: PayrollOverviewBundle;
  loading?: boolean;
  payPeriod?: PayPeriod;
  hasPendingApprovals?: boolean;
  isApproved?: boolean;
  payrollApproval?: unknown;
  pendingApprovals?: unknown;
}

type OverviewTotals = {
  headcount: number;
  allowance: number;
  benefit: number;
  deductions: number;
  gross: number;
  net: number;
};

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatPercent = (value: number): string => `${value.toFixed(2)}%`;

const percentChange = (
  current: number,
  previous: number,
): string | undefined => {
  if (previous === 0) {
    return current === 0 ? '0.00%' : undefined;
  }
  return formatPercent(((current - previous) / previous) * 100);
};

const apiPercent = (value?: number): string | undefined => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return undefined;
  }
  return formatPercent(Number(value));
};

const computeOverviewTotals = (
  bundle?: PayrollOverviewBundle,
): OverviewTotals => {
  const items = bundle?.items ?? [];
  const sums = items.reduce(
    (acc, item) => {
      acc.allowance += toNumber(item.totalAllowance);
      acc.benefit += toNumber(item.totalMerit);
      acc.deductions += toNumber(item.totalDeductions);
      acc.gross += toNumber(item.grossSalary);
      acc.net += toNumber(item.netPay);
      return acc;
    },
    {
      allowance: 0,
      benefit: 0,
      deductions: 0,
      gross: 0,
      net: 0,
    },
  );

  return {
    headcount: bundle?.meta?.totalItems ?? items.length,
    allowance: items.length
      ? sums.allowance
      : toNumber(bundle?.totalAllowanceAmount),
    benefit: items.length ? sums.benefit : toNumber(bundle?.totalMeritAmount),
    deductions: items.length
      ? sums.deductions
      : toNumber(bundle?.totalDeductionsAmount),
    gross: items.length
      ? sums.gross
      : toNumber(bundle?.totalGrossPaymentAmount),
    net: items.length ? sums.net : toNumber(bundle?.totalNetPayAmount),
  };
};

const getApprovalLabel = (
  hasPayroll: boolean,
  hasPendingApprovals?: boolean,
  isApproved?: boolean,
): string => {
  if (!hasPayroll) return 'Not generated';
  if (isApproved) return 'Approved';
  if (hasPendingApprovals) return 'Pending approval';
  return 'Generated';
};

const OverviewTab = ({
  payPeriodId,
  payrollForExport,
  loading,
  payPeriod,
  hasPendingApprovals,
  isApproved,
  payrollApproval,
  pendingApprovals,
}: OverviewTabProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const addActivityLog = usePayrollActivityLogStore((state) => state.addLog);
  const getLogs = usePayrollActivityLogStore((state) => state.getLogs);
  const { data: employeeData } = useGetAllUsers();

  const totals = useMemo(
    () => computeOverviewTotals(payrollForExport),
    [payrollForExport],
  );

  const previousTotals = useMemo(() => {
    if (!isMockPayPeriodId(payPeriodId)) return null;
    const currentIndex = MOCK_PAY_PERIODS.findIndex(
      (period) => period.id === payPeriodId,
    );
    const previousPeriod =
      currentIndex >= 0 ? MOCK_PAY_PERIODS[currentIndex + 1] : undefined;
    if (!previousPeriod) return null;
    return computeOverviewTotals(
      getMockPayrollBundle(previousPeriod.id, 100, 1).all,
    );
  }, [payPeriodId]);

  const lastPeriodDiff = payrollForExport?.differenceFromLastPayPeriod;
  const growth = {
    gross:
      previousTotals != null
        ? percentChange(totals.gross, previousTotals.gross)
        : apiPercent(lastPeriodDiff?.totalGrossPaymentAmount),
    net:
      previousTotals != null
        ? percentChange(totals.net, previousTotals.net)
        : apiPercent(lastPeriodDiff?.totalNetPayAmount),
    allowance:
      previousTotals != null
        ? percentChange(totals.allowance, previousTotals.allowance)
        : apiPercent(lastPeriodDiff?.totalAllowanceAmount),
    benefit:
      previousTotals != null
        ? percentChange(totals.benefit, previousTotals.benefit)
        : apiPercent(lastPeriodDiff?.totalMeritAmount),
    deductions:
      previousTotals != null
        ? percentChange(totals.deductions, previousTotals.deductions)
        : apiPercent(lastPeriodDiff?.totalDeductionsAmount),
  };

  const hasPayroll = totals.headcount > 0 || totals.gross > 0;
  const workflow = useMemo(
    () =>
      resolvePayrollApprovalWorkflow(
        payPeriodId,
        payrollApproval,
        pendingApprovals,
      ),
    [payPeriodId, payrollApproval, pendingApprovals],
  );
  const approvalLabel =
    workflow.overall !== 'Not generated'
      ? workflow.overall === 'Pending'
        ? 'Pending approval'
        : workflow.overall
      : getApprovalLabel(hasPayroll, hasPendingApprovals, isApproved);
  const approvalIcon = overallStatusIcon(workflow.overall);
  const periodLabel = payPeriod
    ? formatPayPeriodLabel(payPeriod)
    : 'Pay period';
  const isOpen = payPeriod?.status === 'OPEN';

  const userName = (userId: string) => {
    const mockUser = MOCK_PAYROLL_APPROVERS[userId];
    if (mockUser) {
      return `${mockUser.firstName} ${mockUser.lastName}`.trim();
    }
    const user = employeeData?.items?.find((item: any) => item.id === userId);
    return `${user?.firstName || ''} ${user?.middleName || ''} ${user?.lastName || ''}`.trim();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const summarySheet = workbook.addWorksheet('Overview');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 24 },
        { header: 'Value', key: 'value', width: 28 },
        { header: 'Change vs last period', key: 'change', width: 24 },
      ];
      summarySheet.addRows([
        {
          metric: 'Pay Period',
          value: periodLabel,
          change: isOpen ? 'Open' : 'Closed',
        },
        {
          metric: 'Employees',
          value: totals.headcount,
          change: approvalLabel,
        },
        {
          metric: 'Total Amount',
          value: totals.gross,
          change: growth.gross ?? '--',
        },
        {
          metric: 'Net Paid Amount',
          value: totals.net,
          change: growth.net ?? '--',
        },
        {
          metric: 'Total Allowance',
          value: totals.allowance,
          change: growth.allowance ?? '--',
        },
        {
          metric: 'Total Benefit',
          value: totals.benefit,
          change: growth.benefit ?? '--',
        },
        {
          metric: 'Total Deduction',
          value: totals.deductions,
          change: growth.deductions ?? '--',
        },
      ]);
      summarySheet.getRow(1).font = { bold: true };

      const logs = getLogs(payPeriodId);
      const logSheet = workbook.addWorksheet('Activity Log');
      logSheet.columns = [
        { header: 'Action', key: 'action', width: 18 },
        { header: 'Performed By', key: 'performedBy', width: 24 },
        { header: 'Performed At', key: 'performedAt', width: 22 },
        { header: 'Remarks', key: 'remarks', width: 50 },
      ];
      logs.forEach((log) => {
        logSheet.addRow({
          action: log.action,
          performedBy:
            `${log.performedBy.firstName || ''} ${log.performedBy.lastName || ''}`.trim() ||
            'Unknown User',
          performedAt: dayjs(log.performedAt).format('MMM DD, YYYY HH:mm'),
          remarks: log.remarks || '--',
        });
      });
      logSheet.getRow(1).font = { bold: true };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Payroll-Overview.xlsx';
      link.click();
      URL.revokeObjectURL(link.href);

      addActivityLog(payPeriodId, {
        action: 'Exported',
        remarks: 'Payroll overview exported for this pay period.',
      });
      NotificationMessage.success({
        message: 'Export completed',
        description: 'Payroll overview has been exported successfully.',
      });
    } catch {
      NotificationMessage.error({
        message: 'Export Failed',
        description: 'Unable to export payroll overview.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      id="payroll-overview-tab-view-container"
      data-cy="payroll-overview-tab-view-container"
      className="w-full"
    >
      <div
        data-cy="payroll-overview-tab-toolbar"
        className="mb-6 flex flex-wrap items-center justify-between gap-2"
      >
        <div
          id="payroll-overview-period-chips"
          data-cy="payroll-overview-period-chips"
          className="flex flex-wrap items-center gap-2"
        >
          <Tag
            data-cy="payroll-overview-period-label-tag"
            className="m-0 text-sm"
            style={{ border: 'none' }}
          >
            {periodLabel}
          </Tag>
          <Tag
            color={isOpen ? 'green' : 'default'}
            data-cy="payroll-overview-period-status-tag"
            className="m-0 text-sm"
            style={{ border: 'none' }}
          >
            {isOpen ? 'Open' : 'Closed'}
          </Tag>
          <Tag
            data-cy="payroll-overview-headcount-tag"
            className="m-0 text-sm"
            style={{ border: 'none' }}
          >
            {totals.headcount} employee{totals.headcount === 1 ? '' : 's'}
          </Tag>
        </div>
        <div
          data-cy="payroll-overview-tab-toolbar-actions"
          className="flex flex-wrap items-center gap-3"
        >
          <div
            id="payroll-overview-approval-flow"
            data-cy="payroll-overview-approval-flow"
            className="flex flex-wrap items-center gap-3"
          >
            <span
              data-cy="payroll-overview-approval-flow-overall"
              className="inline-flex items-center gap-1.5"
            >
              {approvalIcon ? (
                <Image
                  unoptimized
                  width={20}
                  height={20}
                  src={approvalIcon}
                  alt={workflow.overall}
                  data-cy="payroll-overview-approval-flow-overall-icon"
                />
              ) : null}
              <span
                data-cy="payroll-overview-approval-status-tag"
                className="text-sm font-medium text-gray-900"
              >
                {approvalLabel}
              </span>
            </span>
            {workflow.steps.map((step) => {
              const displayUserId = String(
                step.displayUserId || step.approvedUserId || step.userId || '',
              );
              const stepIcon = overallStatusIcon(step.status);
              return (
                <span
                  key={`payroll-overview-approval-step-${step.stepOrder}`}
                  data-cy={`payroll-overview-approval-step-${step.stepOrder}`}
                  className="inline-flex items-center gap-1.5"
                >
                  <span
                    data-cy={`payroll-overview-approval-step-level-${step.stepOrder}`}
                    className="text-sm text-gray-500"
                  >
                    Level {step.stepOrder}
                  </span>
                  {stepIcon ? (
                    <Image
                      unoptimized
                      width={20}
                      height={20}
                      src={stepIcon}
                      alt={step.status}
                      data-cy={`payroll-overview-approval-step-icon-${step.stepOrder}`}
                    />
                  ) : null}
                  <span
                    data-cy={`payroll-overview-approval-step-person-${step.stepOrder}`}
                    className="text-sm text-gray-900"
                  >
                    {userName(displayUserId) || '--'}
                  </span>
                </span>
              );
            })}
          </div>
          <Button
            type="default"
            size="large"
            className="flex items-center gap-2 h-10 border-gray-200 text-gray-600 rounded-[6px] px-3 md:px-4 font-medium"
            icon={<SaveAltIcon className="text-gray-600" fontSize="small" />}
            loading={isExporting}
            onClick={handleExport}
            data-cy="payroll-overview-tab-export-click-button"
          >
            <span
              data-cy="payroll-overview-tab-export-label"
              className="hidden sm:inline"
            >
              Export
            </span>
          </Button>
        </div>
      </div>

      {loading ? (
        <PayrollSummaryCardsSkeleton />
      ) : (
        <div
          id="payroll-summary-cards-view-row"
          data-cy="payroll-summary-cards-view-row"
          className={PAYROLL_SUMMARY_CARDS_ROW_CLASS}
        >
          <div
            className={PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS}
            data-cy="payroll-summary-cards-scroll-item-total-amount"
          >
            <PayrollCard
              title="Total Amount"
              data-cy="payroll-summary-card-total-amount-view-component"
              value={totals.gross}
              growth={growth.gross}
              icon={
                <MdAttachMoney data-cy="payroll-summary-card-total-amount-icon" />
              }
              iconBg="bg-[#E6F4FF]"
              iconText="text-[#1E40AF]"
            />
          </div>
          <div
            className={PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS}
            data-cy="payroll-summary-cards-scroll-item-net-paid"
          >
            <PayrollCard
              title="Net Paid Amount"
              data-cy="payroll-summary-card-net-paid-view-component"
              value={totals.net}
              growth={growth.net}
              icon={
                <LocalAtmIcon
                  data-cy="payroll-summary-card-net-paid-amount-icon"
                  className="w-5 h-5"
                />
              }
              iconBg="bg-[#F9F0FF]"
              iconText="text-[#722ED1]"
            />
          </div>
          <div
            className={PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS}
            data-cy="payroll-summary-cards-scroll-item-total-allowance"
          >
            <PayrollCard
              title="Total Allowance"
              data-cy="payroll-summary-card-total-allowance-view-component"
              value={totals.allowance}
              growth={growth.allowance}
              icon={
                <PaymentsIcon
                  data-cy="payroll-summary-card-total-allowance-icon"
                  className="w-5 h-5"
                />
              }
              iconBg="bg-[#F6FFED]"
              iconText="text-[#52C41A]"
            />
          </div>
          <div
            className={PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS}
            data-cy="payroll-summary-cards-scroll-item-total-benefit"
          >
            <PayrollCard
              title="Total Benefit"
              data-cy="payroll-summary-card-total-benefit-view-component"
              value={totals.benefit}
              growth={growth.benefit}
              icon={
                <MdCardGiftcard
                  data-cy="payroll-summary-card-total-benefit-icon"
                  className="w-5 h-5"
                />
              }
              iconBg="bg-[#FFFBE6]"
              iconText="text-[#FBB221]"
            />
          </div>
          <div
            className={PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS}
            data-cy="payroll-summary-cards-scroll-item-total-deduction"
          >
            <PayrollCard
              title="Total Deduction"
              data-cy="payroll-summary-card-total-deduction-view-component"
              value={totals.deductions}
              growth={growth.deductions}
              icon={
                <MoneyOffIcon
                  data-cy="payroll-summary-card-total-deduction-icon"
                  className="w-5 h-5"
                />
              }
              iconBg="bg-[#FFF2F0]"
              iconText="text-[#FF4D4F]"
            />
          </div>
        </div>
      )}

      <div
        id="payroll-overview-activity-log-section"
        data-cy="payroll-overview-activity-log-section"
        className="mt-8"
      >
        <h3
          id="payroll-overview-activity-log-title"
          data-cy="payroll-overview-activity-log-title"
          className="m-0 mb-4 text-base font-medium text-gray-900"
        >
          Activity Log
        </h3>
        <div
          data-cy="payroll-overview-activity-log-table-wrap"
        >
          <ActivityLogTab payPeriodId={payPeriodId} />
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
