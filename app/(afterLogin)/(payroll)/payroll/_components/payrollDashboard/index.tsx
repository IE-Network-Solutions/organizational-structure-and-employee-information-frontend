'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';

function mergePayrollFilterState(
  prev: { [key: string]: string },
  partial: { [key: string]: string | undefined | null },
): { [key: string]: string } {
  const merged = { ...prev };
  for (const [key, val] of Object.entries(partial)) {
    if (
      val === undefined ||
      val === null ||
      (typeof val === 'string' && val.trim() === '')
    ) {
      delete merged[key];
    } else {
      merged[key] = val;
    }
  }
  return merged;
}

import {
  Table,
  Button,
  notification,
  Popconfirm,
  Modal,
  Switch,
  Select,
  Tooltip,
  Avatar,
  Breadcrumb,
  Dropdown,
  Typography,
} from 'antd';

const { Text } = Typography;
import { SearchOutlined, FileSyncOutlined } from '@ant-design/icons';

import { Workbook } from 'exceljs';

import FilterPopover from '../filters/FilterPopover';
import {
  useGetActivePayroll,
  useGetActivePayrollsForExport,
  useGetAllActiveBasicSalary,
  useGetEmployeeInfo,
  useGetPayPeriod,
} from '@/store/server/features/payroll/payroll/queries';
import {
  useCreatePayroll,
  useDeletePayroll,
  useSendingPayrollPayslip,
} from '@/store/server/features/payroll/payroll/mutation';
import PayrollCard from '../cards';
import { useGenerateBankLetter } from '../Latter';
import { saveAs } from 'file-saver';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useGetAllUsersData } from '@/store/server/features/employees/employeeManagment/queries';
import {
  PayPeriod,
  PaySlipData,
} from '@/store/server/features/payroll/payroll/interface';
import { useExportData } from '../excel';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';

import useEmployeeStore from '@/store/uistate/features/payroll/employeeInfoStore';
import { TbFileExport } from 'react-icons/tb';
import GeneratePayrollModal, { Incentive } from '../modal';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';
import PayrollTableLoadingSkeleton from '../PayrollTableLoadingSkeleton';
import EmptyState from '@/components/empty';
import PayrollSummaryCardsSkeleton from '../PayrollSummaryCardsSkeleton';
import { usePayrollStore } from '@/store/uistate/features/payroll/payroll';
import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { FiscalYear } from '@/store/server/features/organizationStructure/fiscalYear/interface';
import { useFetchAllowanceTypes } from '@/store/server/features/compensation/settings/queries';
import {
  useGetPendingPayrollApprovals,
  useGetPayrollApprovalByPayPeriodId,
} from '@/store/server/features/payroll/payrollApproval/queries';
import {
  useApprovePayrollApproval,
  useLastApprovingPayroll,
} from '@/store/server/features/payroll/payrollApproval/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatPayPeriodLabel } from '../payPeriodSelect';
import {
  findMockPayPeriod,
  getMockEmployeeOptions,
  getMockPayrollBundle,
  isMockPayPeriodId,
} from '../payPeriodSelect/mockPayPeriods';
import { usePayrollActivityLogStore } from '@/store/uistate/features/payroll/activityLog';
import ReconciliationTab from '../reconciliationTab';
import ActivityLogTab from '../activityLogTab';
import CustomBreadcrumb from '@/components/common/breadCramp';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PaymentsIcon from '@mui/icons-material/Payments';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { MdAttachMoney, MdCardGiftcard } from 'react-icons/md';

/** Summary cards: horizontal scroll on phone & tablet; 5-col grid from `lg` up. */
const PAYROLL_SUMMARY_CARDS_ROW_CLASS =
  'mb-8 flex flex-nowrap gap-4 overflow-x-auto overflow-y-visible pb-2 scroll-smooth snap-x snap-mandatory [-webkit-overflow-scrolling:touch] touch-pan-x lg:grid lg:grid-cols-5 lg:overflow-x-visible lg:snap-none';

const PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS =
  'min-w-[228px] w-[min(88vw,304px)] shrink-0 snap-start lg:min-w-0 lg:h-full lg:w-full lg:shrink lg:max-w-none';

const Payroll = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportBank, setExportBank] = useState(true);
  const [bankLetter, setBankLetter] = useState(true);
  const [paySlip, setPaySlip] = useState(false);
  const { data: allowanceTypesData } = useFetchAllowanceTypes();
  const [exportPayrollData, setExportPayrollData] = useState(true);
  const { data: getAllFiscalYears } = useGetAllFiscalYears();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'payroll' | 'reconciliation' | 'activity-log'
  >('payroll');
  const addActivityLog = usePayrollActivityLogStore((state) => state.addLog);

  const authStore = useAuthenticationStore.getState();
  const { userId } = useAuthenticationStore();
  const tenantId = authStore.tenantId;
  const userRollId = authStore.userData?.roleId;

  const { mutate: approvePayroll, isLoading: isApproving } =
    useApprovePayrollApproval();
  const { mutate: lastApproving, isLoading: isLastApproving } =
    useLastApprovingPayroll();

  const {
    searchQuery,
    setSearchQuery,

    isPayrollModalOpen,
    setIsPayrollModalOpen,
  } = useEmployeeStore();

  const { pageSize, currentPage, setCurrentPage, setPageSize } =
    usePayrollStore();

  const router = useRouter();
  const params = useParams();
  const selectedPayPeriodId = String(params?.payPeriodId || '');
  const isMockPeriod = isMockPayPeriodId(selectedPayPeriodId);
  const { data: payPeriodData } = useGetPayPeriod();

  const [payPeriodQuery, setPayPeriodQuery] = useState('');
  const [payPeriodId, setPayPeriodId] = useState('');
  const [searchValue, setSearchValue] = useState<{ [key: string]: string }>({});
  const searchValueRef = useRef(searchValue);
  searchValueRef.current = searchValue;
  const payrollQueryEnabled = Boolean(selectedPayPeriodId) && !isMockPeriod;
  const payrollSearchQuery = typeof searchQuery === 'string' ? searchQuery : '';
  const resolvedSearchQuery = selectedPayPeriodId
    ? payrollSearchQuery.includes('payPeriodId=')
      ? payrollSearchQuery
      : `&payPeriodId=${selectedPayPeriodId}`
    : '';
  const {
    data: apiPayroll,
    refetch,
    isLoading: apiPayrollTableLoading,
  } = useGetActivePayroll(resolvedSearchQuery, pageSize, currentPage, {
    enabled: payrollQueryEnabled,
  });
  const {
    data: apiPayrollForExport,
    refetch: refetchExportData,
    isLoading: apiPayrollForExportLoading,
  } = useGetActivePayrollsForExport(resolvedSearchQuery, {
    enabled: payrollQueryEnabled,
  });
  const mockPayrollBundle = useMemo(
    () =>
      isMockPeriod
        ? getMockPayrollBundle(
            selectedPayPeriodId,
            pageSize,
            currentPage,
            searchValue?.employeeId,
          )
        : null,
    [
      isMockPeriod,
      selectedPayPeriodId,
      pageSize,
      currentPage,
      searchValue?.employeeId,
    ],
  );
  const payroll = isMockPeriod ? mockPayrollBundle?.paged : apiPayroll;
  const payrollForExport = isMockPeriod
    ? mockPayrollBundle?.all
    : apiPayrollForExport;
  const payrollTableLoading = isMockPeriod ? false : apiPayrollTableLoading;
  const payrollForExportLoading = isMockPeriod
    ? false
    : apiPayrollForExportLoading;
  const { data: employeeInfo } = useGetEmployeeInfo();
  const { data: allActiveSalary } = useGetAllActiveBasicSalary();
  const { data: allEmployees } = useGetAllUsersData();

  // Selected period is the source of truth; never fall back to current-month payroll
  const currentPayPeriodId = selectedPayPeriodId || payPeriodId;

  const selectedPayPeriod =
    findMockPayPeriod(currentPayPeriodId) ||
    (Array.isArray(payPeriodData)
      ? payPeriodData
      : payPeriodData?.items || []
    ).find((period: PayPeriod) => period.id === currentPayPeriodId);

  // Fetch pending approvals with payPeriodId
  const { data: pendingApprovals, refetch: refetchPendingApprovals } =
    useGetPendingPayrollApprovals(currentPayPeriodId, 1, 10);

  // Fetch payroll approval by payPeriodId
  const {
    data: payrollApprovalByPayPeriod,
    refetch: refetchPayrollApprovalByPayPeriod,
  } = useGetPayrollApprovalByPayPeriodId(currentPayPeriodId);

  const hasPendingApprovals = pendingApprovals?.items?.length > 0;
  const pendingApproval = pendingApprovals?.items?.[0] || null;
  const canGenerateOrRegenerate =
    !payrollApprovalByPayPeriod ||
    payrollApprovalByPayPeriod?.approved === false;
  const { mutate: createPayroll, isLoading: isCreatingPayroll } =
    useCreatePayroll();

  const { mutate: sendPaySlip } = useSendingPayrollPayslip();
  const { generateBankLetter } = useGenerateBankLetter();
  const { exportToExcel } = useExportData();

  const [loading, setLoading] = useState(false);
  const [mergedPayroll, setMergedPayroll] = useState<any>([]);
  const [mergedPayrollForExport, setMergedPayrollForExport] = useState<any>([]);
  const [open, setOpen] = useState(false);
  const { mutate: deletePayroll, isLoading: deleteLoading } =
    useDeletePayroll();
  const activeAllowanceTypes = Array.isArray(allowanceTypesData)
    ? allowanceTypesData.filter(
        (item: any) => item.type === 'ALLOWANCE' && item.isActive,
      )
    : [];

  useEffect(() => {
    // Check if division filter is applied
    const hasDivisionFilter = searchValue?.divisionId;

    if (isMockPeriod) {
      setMergedPayroll(payroll?.items || []);
      setMergedPayrollForExport(payrollForExport?.items || []);
      return;
    }

    // Handle paginated payroll data for display
    if (payroll?.items) {
      if (payroll.items.length === 0) {
        setMergedPayroll([]);
        setSelectedRowKeys([]);
      } else {
        let mergedData;

        if (hasDivisionFilter && payroll?.divisionUsers) {
          // Use division users from backend when division filter is applied
          mergedData = payroll?.items.map((pay: any) => {
            const employee = payroll.divisionUsers.find(
              (emp: any) => emp.id === pay.employeeId,
            );
            return {
              ...pay,
              employeeInfo: employee || null,
            };
          });
        } else if (allEmployees?.items) {
          // Use all employees when no division filter is applied
          mergedData = payroll?.items.map((pay: any) => {
            const employee = allEmployees.items.find(
              (emp: any) => emp.id === pay.employeeId,
            );
            return {
              ...pay,
              employeeInfo: employee || null,
            };
          });
        }

        if (mergedData) {
          setMergedPayroll(mergedData);
        }
      }
    }

    // Handle non-paginated payroll data for export
    if (payrollForExport?.items) {
      if (payrollForExport.items.length === 0) {
        setMergedPayrollForExport([]);
      } else {
        let mergedExportData;

        if (hasDivisionFilter && payrollForExport?.divisionUsers) {
          // Use division users from backend when division filter is applied
          mergedExportData = payrollForExport?.items.map((pay: any) => {
            const employee = payrollForExport.divisionUsers.find(
              (emp: any) => emp.id === pay.employeeId,
            );
            return {
              ...pay,
              employeeInfo: employee || null,
            };
          });
        } else if (allEmployees?.items) {
          // Use all employees when no division filter is applied
          mergedExportData = payrollForExport?.items.map((pay: any) => {
            const employee = allEmployees.items.find(
              (emp: any) => emp.id === pay.employeeId,
            );
            return {
              ...pay,
              employeeInfo: employee || null,
            };
          });
        }

        if (mergedExportData) {
          setMergedPayrollForExport(mergedExportData);
        }
      }
    }
  }, [
    payroll,
    payrollForExport,
    allEmployees,
    searchValue?.divisionId,
    isMockPeriod,
  ]);

  useEffect(() => {
    if (!selectedPayPeriodId) {
      setPayPeriodId('');
      setSearchQuery('');
      setSearchValue({});
      setSelectedRowKeys([]);
      setCurrentPage(1);
      return;
    }

    setPayPeriodId((prev) =>
      prev === selectedPayPeriodId ? prev : selectedPayPeriodId,
    );
    setSearchValue((prev) => {
      if (prev.payPeriodId === selectedPayPeriodId) return prev;
      return { payPeriodId: selectedPayPeriodId };
    });
    const nextSearchQuery =
      typeof searchQuery === 'string' &&
      searchQuery.includes(`payPeriodId=${selectedPayPeriodId}`)
        ? searchQuery
        : `&payPeriodId=${selectedPayPeriodId}`;
    setSearchQuery(nextSearchQuery);
    setCurrentPage(1);
    setSelectedRowKeys([]);
  }, [selectedPayPeriodId, setSearchQuery, setCurrentPage]);

  // Get selected payroll data or all data if nothing is selected
  const getSelectedPayrollData = () => {
    if (selectedRowKeys.length === 0) {
      return mergedPayrollForExport;
    }
    return mergedPayrollForExport.filter((item: any) =>
      selectedRowKeys.includes(item.id || item.employeeId),
    );
  };

  const handleExportAll = async () => {
    const exportTasks: Promise<any>[] = []; // Ensure array contains promises
    const selectedData = getSelectedPayrollData();

    // Check if there's any data available to export
    if (!selectedData || selectedData.length === 0) {
      notification.error({
        message: 'No Data Available',
        description:
          selectedRowKeys.length > 0
            ? 'The selected employees have no payroll data to export. Please adjust your selection or filters.'
            : 'There is no payroll data available to export. Please check your filters or generate payroll first.',
      });
      return;
    }

    if (paySlip)
      exportTasks.push(Promise.resolve(sendingPaySlipHandler(selectedData)));

    if (exportPayrollData)
      exportTasks.push(
        Promise.resolve(handleDeductionExportPayroll(selectedData)),
      );

    if (exportBank) exportTasks.push(handleExportBank(selectedData));

    if (bankLetter) {
      // Calculate total net pay for selected items
      const totalNetPay = selectedData.reduce(
        (sum: number, item: any) => sum + Number(item.netPay || 0),
        0,
      );
      exportTasks.push(Promise.resolve(handleBankLetter(totalNetPay)));
    }

    if (exportTasks?.length === 0) {
      notification.error({
        message: 'No Export Option Selected',
        description: 'Please select at least one option to export.',
      });
      return;
    }

    setLoading(true);
    try {
      await Promise.all(exportTasks); // Await all promises
      notification.success({
        message: 'Export Successful',
        description: `Selected export operations completed successfully for ${selectedData.length} employee(s).`,
      });
      addActivityLog(selectedPayPeriodId, {
        action: 'Exported',
        remarks: `Exported payroll files for ${selectedData.length} employee(s).`,
      });
      if (paySlip) {
        addActivityLog(selectedPayPeriodId, {
          action: 'Payslip Sent',
          remarks: `Payslips emailed to ${selectedData.length} employee(s).`,
        });
      }
    } catch (error) {
      notification.error({
        message: 'Export Failed',
        description: 'An error occurred while exporting.',
      });
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  type Payroll = {
    employeeId: string;
    netPay: number;
  };

  const fiscalYearMonths =
    getAllFiscalYears?.items
      ?.flatMap((item: FiscalYear) => item.sessions || [])
      ?.flatMap((session) => session?.months || []) || [];

  const handleSearch = (partial: {
    [key: string]: string | undefined | null;
  }) => {
    const merged = mergePayrollFilterState(searchValueRef.current, partial);
    searchValueRef.current = merged;
    setSearchValue(merged);

    const queryParams = new URLSearchParams();

    if (merged.employeeId) {
      queryParams.append('employeeId', merged.employeeId);
    }
    if (merged.monthId) {
      queryParams.append('monthId', merged.monthId);

      const month = fiscalYearMonths.find((m) => m?.id === merged.monthId);

      if (month?.startDate) {
        const startDate = new Date(month.startDate);
        const formattedStartDate = startDate.toISOString().split('T')[0];
        queryParams.append('startDate', formattedStartDate);
      }
      if (month?.endDate) {
        const endDate = new Date(month.endDate);
        const formattedEndDate = endDate.toISOString().split('T')[0];
        queryParams.append('endDate', formattedEndDate);
      }
    }
    if (merged.divisionId) {
      queryParams.append('divisionId', merged.divisionId);
    }
    const nextPayPeriodId = merged.payPeriodId || selectedPayPeriodId;
    if (nextPayPeriodId) {
      queryParams.append('payPeriodId', nextPayPeriodId);
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      setPayPeriodQuery(query);
      setPayPeriodId(nextPayPeriodId);
      if (nextPayPeriodId !== selectedPayPeriodId) {
        router.push(`/payroll/${nextPayPeriodId}`);
      }
    }
    if (merged.departmentId) {
      queryParams.append('departmentId', merged.departmentId);
    }

    const searchParams = queryParams.toString()
      ? `&${queryParams.toString()}`
      : '';
    setSearchQuery(searchParams);
    setSelectedRowKeys([]);
    refetch();
    refetchExportData();
  };

  const handleGeneratePayroll = async (data: Incentive) => {
    if (isMockPeriod) {
      const isRegenerate = Boolean(payroll?.items?.length);
      addActivityLog(selectedPayPeriodId, {
        action: isRegenerate ? 'Regenerated' : 'Generated',
        remarks: isRegenerate
          ? `Payroll regenerated for this pay period${
              data.includeIncentive ? ' including incentives' : ''
            }.`
          : `Payroll generated for this pay period${
              data.includeIncentive ? ' including incentives' : ''
            }.`,
      });
      setIsPayrollModalOpen(false);
      notification.success({
        message: isRegenerate ? 'Payroll Regenerated' : 'Payroll Generated',
        description: 'This action was recorded in the Activity Log.',
      });
      return;
    }

    if (!allActiveSalary || allActiveSalary?.length === 0) {
      notification.error({
        message: 'No Active Salaries',
        description:
          'There is no active salary data available to generate payroll.',
      });
      return;
    }

    setLoading(true);

    try {
      const payRollData = {
        payrollItems: allActiveSalary.map((item: any) => ({
          ...item,
          basicSalary: parseInt(item.basicSalary, 10),
        })),
        includeIncentive: data.includeIncentive,
      };

      createPayroll(
        { values: payRollData },
        {
          onSuccess: () => {
            setIsPayrollModalOpen(false);
            refetchPayrollApprovalByPayPeriod();
            addActivityLog(selectedPayPeriodId, {
              action: payroll?.items?.length ? 'Regenerated' : 'Generated',
              remarks: payroll?.items?.length
                ? 'Payroll regenerated for this pay period.'
                : 'Payroll generated for this pay period.',
            });
            setTimeout(() => {
              setOpen(true);
            }, 500);
          },
        },
      );
    } catch (error) {
      notification.error({
        message: 'Error Generating Payroll',
        description: 'An error occurred while generating payroll.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayroll = () => {
    setLoading(true);
    try {
      deletePayroll(payPeriodId);
    } catch (error) {
      notification.error({
        message: 'Error Deleting Payroll',
        description: 'An error occurred while deleting payroll.',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendingPaySlipHandler = (payrollData: any) => {
    const values: PaySlipData[] = payrollData.map((item: any) => ({
      payrollId: item.id,
      payPeriodId: item.payPeriodId,
      employeeId: item.employeeInfo.id,
    }));
    sendPaySlip({ values });
  };
  const handleDeductionExportPayroll = async (dataToExport?: any[]) => {
    const payrollDataToExport = dataToExport || mergedPayrollForExport;
    if (!payrollDataToExport || payrollDataToExport?.length === 0) {
      NotificationMessage.error({
        message: 'No Data Available',
        description: 'There is no data available to export.',
      });
      return;
    }

    setLoading(true);
    try {
      const uniqueAllowanceTypes = new Set<string>();
      const uniqueMeritTypes = new Set<string>();
      const uniqueDeductionTypes = new Set<string>();
      const uniquePayrollColumns = new Set<string>();

      const deductionData: any[] = [];
      const payrollData: any[] = [];
      const allowanceData: any[] = [];
      const meritData: any[] = [];

      const formatAmount = (amount: number | undefined | null) => {
        return Number(amount || 0).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };

      const exportColumns = [
        { type: 'TIN Number', key: 'tinNumber' },
        { type: 'Basic Salary', key: 'basicSalary' },
        { type: 'Transport Allowance', key: 'transportAllowance' },
        { type: 'Taxable Transport', key: 'taxableTransport' },
        { type: 'Position Allowance', key: 'positionAllowance' },
        { type: 'Total Benefits', key: 'totalBenefits' },
        { type: 'Variable Pay', key: 'variablePay' },
        { type: 'Gross Salary', key: 'grossIncome' },
        { type: 'Employee Pension', key: 'employeePension' },
        { type: 'Tax', key: 'tax' },
        { type: 'Company Pension', key: 'companyPesnion' },
        { type: 'Total Deduction', key: 'totalDeduction' },
        { type: 'Total Incentive', key: 'totalIncentive' },
        { type: 'Taxable Income', key: 'taxableIncome' },
        { type: 'Net Income', key: 'netIncome' },
      ];
      const columnHeaderMap = new Map<string, string>(
        exportColumns.map((col) => [col.key, col.type]),
      );
      exportColumns.forEach((col) => uniquePayrollColumns.add(col.key));
      payrollDataToExport.forEach((item: any) => {
        item.breakdown?.allowances?.forEach((a: any) =>
          uniqueAllowanceTypes.add(a.type),
        );
        item.breakdown?.totalDeductionWithPension?.forEach((d: any) =>
          uniqueDeductionTypes.add(d.type),
        );
        item.breakdown?.merits?.forEach((m: any) =>
          uniqueMeritTypes.add(m.type),
        );
      });

      payrollDataToExport.forEach((item: any) => {
        const fullName =
          `${item.employeeInfo?.firstName || ''} ${item.employeeInfo?.middleName || ''} ${item.employeeInfo?.lastName || ''}`.trim() ||
          '--';
        const tinNumber =
          item.employeeInfo?.employeeInformation?.additionalInformation
            ?.tinNumber || '--';
        const basicSalary =
          item.employeeInfo?.basicSalaries?.find((bs: any) => bs.status)
            ?.basicSalary || 0;
        const deductions = item.breakdown?.totalDeductionWithPension || [];
        const variablePay = item.breakdown?.variablePay?.amount || 0;
        const totalIncentive = item.breakdown?.incentives?.amount || 0;

        const allowances = item.breakdown?.allowances || [];
        const merits = item.breakdown?.merits || [];
        const transportAllowance = allowances
          ?.filter((item: any) => item.type === 'Transport Allowance')
          ?.reduce((acc: any, item: any) => {
            return acc + Number(item.amount);
          }, 0);
        const taxableTransport =
          transportAllowance >= 600 ? transportAllowance - 600 : 0;
        const totalBenefits = item.totalMerit || 0;

        // Find Position Allowance from allowances
        const positionAllowance =
          allowances?.find(
            (a: any) =>
              a.type === 'Position Allowance' ||
              a.type?.toLowerCase().includes('position'),
          )?.amount || 0;

        // Calculate taxable income: subtract 600 only if Transport Allowance >= 600
        const taxableIncomeDeduction = transportAllowance >= 600 ? 600 : 0;
        const taxableIncome = item.grossSalary - taxableIncomeDeduction;

        const payrollRowData: any = {
          fullName,
          tinNumber,
          basicSalary: formatAmount(basicSalary),
          transportAllowance: formatAmount(transportAllowance),
          taxableTransport: formatAmount(taxableTransport),
          totalBenefits: formatAmount(totalBenefits || 0),
          variablePay: formatAmount(variablePay || 0),
          grossIncome: formatAmount(item.grossSalary || 0),
          employeePension: formatAmount(
            item.breakdown?.pension?.find((i: any) => i.type == 'Pension')
              ?.amount || 0,
          ),
          tax: formatAmount(item.breakdown?.tax?.amount),
          companyPesnion: formatAmount(
            item.breakdown?.pension?.find(
              (i: any) => i.type == 'CompanyContribution',
            )?.amount || 0,
          ),
          totalDeduction: formatAmount(item.totalDeductions || 0),
          totalIncentive: formatAmount(totalIncentive || 0),
          taxableIncome: formatAmount(taxableIncome || 0),
          netIncome: formatAmount(item.netPay || 0),
          positionAllowance: formatAmount(positionAllowance || 0),
        };

        // Calculate total deductions
        const totalDeductions = deductions.reduce(
          (sum: number, d: any) => sum + Number(d.amount || 0),
          0,
        );
        const deductionRow: any = {
          fullName,
          tinNumber,
          totalDeductions: formatAmount(totalDeductions),
        };

        // Calculate total allowances
        const totalAllowances = allowances.reduce(
          (sum: number, a: any) => sum + Number(a.amount || 0),
          0,
        );
        const allowanceRow: any = {
          fullName,
          tinNumber,
          totalAllowances: formatAmount(totalAllowances),
        };

        // Calculate total merits
        const totalMerits = merits.reduce(
          (sum: number, m: any) => sum + Number(m.amount || 0),
          0,
        );
        const meritRow: any = {
          fullName,
          tinNumber,
          totalMerits: formatAmount(totalMerits),
        };

        // **Ensure every row has all expected unique columns**
        uniqueDeductionTypes.forEach((type: any) => {
          const deduction = deductions.find((d: any) => d.type === type);
          deductionRow[type] = formatAmount(deduction?.amount || 0);
        });

        uniqueAllowanceTypes.forEach((type) => {
          const allowance = allowances.find((a: any) => a.type === type);
          allowanceRow[type] = formatAmount(allowance?.amount || 0);
        });

        uniqueMeritTypes.forEach((type) => {
          const merit = merits.find((m: any) => m.type === type);
          meritRow[type] = formatAmount(merit?.amount || 0);
        });

        payrollData.push(payrollRowData);
        deductionData.push(deductionRow);
        allowanceData.push(allowanceRow);
        meritData.push(meritRow);
      });

      const workbook = new Workbook();

      const createSheet = (
        sheetName: string,
        data: any[],
        uniqueTypes: Set<string>,
        totalKey: string,
      ) => {
        const sheet = workbook.addWorksheet(sheetName);

        // **Define Headers**
        // For Payrolls sheet, ensure TIN Number comes right after Full Name
        const payrollHeaders =
          sheetName === 'Payrolls'
            ? [
                { header: 'Full Name', key: 'fullName', minWidth: 30 },
                { header: 'TIN Number', key: 'tinNumber', minWidth: 15 },
                ...Array.from(uniqueTypes)
                  .filter((type) => type !== 'tinNumber') // Remove tinNumber from the rest
                  .map((type) => ({
                    header: columnHeaderMap.get(type) || type,
                    key: type,
                    minWidth: 12,
                  })),
              ]
            : [
                { header: 'Full Name', key: 'fullName', minWidth: 30 },
                { header: 'TIN Number', key: 'tinNumber', minWidth: 15 },
                ...Array.from(uniqueTypes).map((type) => ({
                  header: columnHeaderMap.get(type) || type,
                  key: type,
                  minWidth: 12,
                })),
                { header: `Total ${sheetName}`, key: totalKey, minWidth: 18 },
              ];

        const headers = payrollHeaders;

        // **Set Column Width Dynamically**
        sheet.columns = headers.map((col) => ({
          header: col.header,
          key: col.key,
          width: Math.max(col.header?.length + 2, col.minWidth || 10),
        }));

        // **Add Data Rows**
        data.forEach((row) => sheet.addRow(row));

        // **Calculate and Add Total Row**
        if (data?.length > 0) {
          const totalRow: any = { fullName: 'Total' };

          // Calculate totals for each column
          headers.forEach((col) => {
            if (col.key !== 'fullName') {
              let sum = 0;
              let hasValidNumbers = false;

              data.forEach((row) => {
                const value = row[col.key];
                if (value) {
                  // Handle both string and number values
                  const numValue =
                    typeof value === 'string'
                      ? parseFloat(value.replace(/,/g, ''))
                      : Number(value);

                  if (!isNaN(numValue)) {
                    sum += numValue;
                    hasValidNumbers = true;
                  }
                }
              });

              // Only add total if we found valid numbers
              if (hasValidNumbers) {
                totalRow[col.key] = sum.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
              } else {
                totalRow[col.key] = '';
              }
            }
          });

          // Add the total row
          // const totalRowIndex = data?.length + 2; // +1 for header, +1 for 1-based index
          const totalRowAdded = sheet.addRow(totalRow);

          // Style the total row
          totalRowAdded.eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE6E6E6' }, // Light gray background
            };
            cell.alignment = { horizontal: 'right' };
          });
        }

        // **Style Header Row**
        sheet.getRow(1).eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF3498DB' },
          };
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // **Style Data Rows**
        for (let i = 2; i <= data?.length + 1; i++) {
          sheet.getRow(i).eachCell((cell) => {
            if (Number(cell.col) > 1) {
              // Skip the Full Name column
              cell.alignment = { horizontal: 'right' };
            }
          });
        }

        return sheet;
      };

      createSheet('Payrolls', payrollData, uniquePayrollColumns, '');
      createSheet(
        'Deductions',
        deductionData,
        uniqueDeductionTypes,
        'totalDeductions',
      );
      createSheet(
        'Allowances',
        allowanceData,
        uniqueAllowanceTypes,
        'totalAllowances',
      );
      createSheet('Merits', meritData, uniqueMeritTypes, 'totalMerits');

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], { type: 'application/octet-stream' }),
        'Payroll_Details.xlsx',
      );

      NotificationMessage.success({
        message: 'Export Successful',
        description: 'Payroll data exported successfully!',
      });
    } catch (error) {
      NotificationMessage.error({
        message: 'Export Error',
        description: 'An error occurred while exporting payroll data.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportBank = async (dataToExport?: any[]) => {
    const payrollDataToExport = dataToExport || mergedPayrollForExport;
    if (!employeeInfo || employeeInfo?.length === 0) {
      notification.error({
        message: 'No Data Available',
        description: 'There is no data available to export.',
      });
      return;
    }
    setLoading(true);
    try {
      const formatAmount = (amount: number | undefined | null) => {
        return Number(amount || 0).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };

      // Filter employees based on selected payroll data
      const selectedEmployeeIds = new Set(
        payrollDataToExport.map((p: any) => p.employeeId),
      );
      const filteredEmployees = employeeInfo.filter((employee: any) =>
        selectedEmployeeIds.has(employee.id),
      );

      const flatData = filteredEmployees.map((employee: any) => {
        const payroll = payrollDataToExport.find(
          (p: any) => p.employeeId === employee.id,
        ) as Payroll | undefined;

        return {
          employeeName: `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''}`,
          email: employee.email || '--',
          accountNumber:
            employee.employeeInformation?.bankInformation?.accountNumber ||
            '--',
          bankName:
            employee.employeeInformation?.bankInformation?.bankName || '--',
          netPay: formatAmount(payroll?.netPay),
        };
      });

      const exportColumns = [
        { header: 'Employee Name', key: 'employeeName', width: 50 },
        { header: 'Employee Email', key: 'email', width: 50 },
        { header: 'Account Number', key: 'accountNumber', width: 40 },
        { header: 'Bank Name', key: 'bankName', width: 30 },
        { header: 'Net Pay', key: 'netPay', width: 30 },
      ];

      await exportToExcel(flatData, exportColumns, 'Banks');
    } catch (error) {
      notification.error({
        message: 'Error Exporting Bank Information',
        description: 'An error occurred while exporting data.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBankLetter = async (amount: any) => {
    if (!amount) {
      notification.error({
        message: 'Amount Missing',
        description: 'Please provide the amount for the bank letter.',
      });
      return;
    }
    setLoading(true);
    try {
      await generateBankLetter(amount);
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : 'An error occurred while generating the bank letter.';
      notification.error({
        message: 'Error Generating Bank Letter',
        description,
      });
    } finally {
      setLoading(false);
    }
  };

  const truncateText = (text: string, max = 25) =>
    typeof text === 'string' && text.length > max
      ? `${text.slice(0, max)}...`
      : text;

  const dynamicAllowanceColumns = activeAllowanceTypes.map((type: any) => ({
    title: (
      <Tooltip
        id={`payroll-allowance-column-tooltip-${type.id}`}
        data-cy={`payroll-allowance-column-tooltip-${type.id}`}
        title={type.name}
      >
        <span
          id={`payroll-allowance-column-title-${type.id}`}
          data-cy={`payroll-allowance-column-title-${type.id}`}
          style={{
            display: 'inline-block',
            maxWidth: 260,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {truncateText(type.name, 25)}
        </span>
      </Tooltip>
    ),
    dataIndex: type.id,
    key: type.id,
    minWidth: 150,
    //eslint-disable-next-line
    render: (_: any, record: any) => {
      const cellId = `payroll-row-${record.id || record.employeeId}-allowance-${type.id}`;
      const empAllowance = (record.breakdown?.allowances || []).find(
        (a: any) =>
          String(a.compensationItemId) === String(type.id) ||
          a.type === type.name,
      );
      if (!empAllowance)
        return (
          <div
            id={`${cellId}-empty-view-container`}
            data-cy={`${cellId}-empty-view-container`}
          >
            -
          </div>
        );

      const basicSalary =
        record.employeeInfo?.basicSalaries?.find((s: any) => s.status)
          ?.basicSalary || 0;

      if (type.isRate && type.defaultAmount) {
        const percent = (basicSalary * Number(type.defaultAmount)) / 100;
        return (
          <div
            id={`${cellId}-percent-view-container`}
            data-cy={`${cellId}-percent-view-container`}
          >
            {percent
              ? Number(percent).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : '-'}
          </div>
        );
      }

      const amount = empAllowance.amount ?? empAllowance.totalAmount ?? null;

      return (
        <div
          id={`${cellId}-view-container`}
          data-cy={`${cellId}-view-container`}
        >
          {amount != null
            ? Number(amount).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : '-'}
        </div>
      );
    },
  }));

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'employeeId',
      key: 'employeeId',
      minWidth: 200,
      render: (notused: any, record: any) => (
        <div
          id={`payroll-row-${record.id || record.employeeId}-name-view-container`}
          data-cy={`payroll-row-${record.id || record.employeeId}-name-view-container`}
          className="flex items-center gap-2"
        >
          <Avatar
            data-cy={`payroll-row-${record.id || record.employeeId}-avatar-view-component`}
            src={record.employeeInfo?.profileImage}
            size={32}
          />
          <span
            id={`payroll-row-${record.id || record.employeeId}-fullname-view-text`}
            data-cy={`payroll-row-${record.id || record.employeeId}-fullname-view-text`}
          >
            {`${record.employeeInfo?.firstName || ''} ${record.employeeInfo?.lastName || ''}`}
          </span>
        </div>
      ),
    },
    {
      title: 'TIN Number',
      dataIndex: 'tinNumber',
      key: 'tinNumber',
      minWidth: 150,
      render: (notused: any, record: any) => {
        const tinNumber =
          record.employeeInfo?.employeeInformation?.additionalInformation
            ?.tinNumber || '--';
        return (
          <span
            id={`payroll-row-${record.id || record.employeeId}-tin-view-text`}
            data-cy={`payroll-row-${record.id || record.employeeId}-tin-view-text`}
          >
            {tinNumber}
          </span>
        );
      },
    },
    {
      title: 'Basic Salary',
      dataIndex: 'basicSalary',
      key: 'basicSalary',
      minWidth: 150,
      render: (nonused: any, record: any) => {
        const activeSalary = record.employeeInfo?.basicSalaries?.find(
          (salary: any) => salary.status === true,
        );
        return activeSalary ? activeSalary.basicSalary : 0;
      },
    },

    ...dynamicAllowanceColumns,

    {
      title: 'Total Allowance',
      dataIndex: 'totalAllowance',
      key: 'totalAllowance',
      minWidth: 150,
      render: (key: string) => Number(key)?.toLocaleString(),
    },
    {
      title: 'Total Benefits',
      dataIndex: 'totalMerit',
      key: 'totalMerit',
      minWidth: 150,
      render: (key: string) => Number(key)?.toLocaleString(),
    },
    {
      title: 'Variable Pay',
      dataIndex: 'variablePay',
      key: 'variablePay',
      minWidth: 150,
      render: (notused: any, record: any) =>
        Number(record.breakdown?.variablePay?.amount)?.toLocaleString(),
    },
    {
      title: 'Gross Salary',
      dataIndex: 'grossSalary',
      key: 'grossSalary',
      minWidth: 150,
      render: (key: string) => Number(key)?.toLocaleString(),
    },
    {
      title: 'Employee Pension',
      dataIndex: 'pension',
      key: 'pension',
      minWidth: 150,
      render: (notused: any, record: any) =>
        Number(
          record.breakdown?.pension?.find((i: any) => i.type == 'Pension')
            ?.amount,
        )?.toLocaleString(),
    },
    {
      title: 'Tax',
      dataIndex: 'tax',
      key: 'tax',
      minWidth: 150,
      render: (notused: any, record: any) =>
        Number(record.breakdown?.tax?.amount)?.toLocaleString(),
    },
    {
      title: 'Company Pension',
      dataIndex: 'companyPension',
      key: 'companyPension',
      minWidth: 150,
      render: (notused: any, record: any) =>
        Number(
          record.breakdown?.pension?.find(
            (i: any) => i.type == 'CompanyContribution',
          )?.amount,
        )?.toLocaleString(),
    },
    {
      title: 'Total Deduction',
      dataIndex: 'totalDeductions',
      key: 'totalDeductions',
      minWidth: 150,
      render: (key: string) => Number(key)?.toLocaleString(),
    },
    {
      title: 'Total Incentive',
      dataIndex: 'incentives',
      key: 'incentives',
      minWidth: 150,
      render: (notused: any, record: any) =>
        Number(record.breakdown?.incentives?.amount)?.toLocaleString(),
    },
    {
      title: 'Taxable Income',
      dataIndex: 'taxableIncome',
      key: 'taxableIncome',
      minWidth: 150,
      render: (notused: any, record: any) => {
        const allowances = record.breakdown?.allowances || [];
        const transportAllowance = allowances
          ?.filter((item: any) => item.type === 'Transport Allowance')
          ?.reduce((acc: any, item: any) => {
            return acc + Number(item.amount);
          }, 0);
        // Subtract 600 only if Transport Allowance >= 600
        const taxableIncomeDeduction = transportAllowance >= 600 ? 600 : 0;
        const taxableIncome = record.grossSalary - taxableIncomeDeduction;
        return Number(taxableIncome)?.toLocaleString();
      },
    },
    {
      title: 'Net Income',
      dataIndex: 'netPay',
      key: 'netPay',
      minWidth: 150,
      render: (key: string) => Number(key || 0)?.toLocaleString(),
    },
  ];
  const { isMobile, isTablet } = useIsMobile();

  const handleEmployeeSelect = (value: string | null | undefined) => {
    handleSearch({ employeeId: value ?? undefined });
  };
  const options = (
    isMockPeriod
      ? getMockEmployeeOptions()
      : searchValue?.divisionId && payroll?.divisionUsers
        ? payroll.divisionUsers
        : allEmployees?.items || []
  ).map((emp: any) => ({
    value: emp.value || emp.id,
    label:
      emp.label ||
      `${emp?.firstName || ''} ${emp?.middleName || ''} ${emp?.lastName || ''}`.trim(),
    employeeData: emp.employeeData || emp,
  }));

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  const onPageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
    setCurrentPage(1);
  };

  const handleApprovePayroll = () => {
    if (isMockPeriod) {
      addActivityLog(selectedPayPeriodId, {
        action: 'Approved',
        remarks: 'Payroll approved in the approval workflow.',
      });
      setIsApproveModalOpen(false);
      notification.success({
        message: 'Payroll Approved',
        description: 'This action was recorded in the Activity Log.',
      });
      return;
    }

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
      addActivityLog(selectedPayPeriodId, {
        action: 'Approved',
        remarks: 'Payroll approved in the approval workflow.',
      });
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

  const payrollViewTabs = [
    { key: 'payroll' as const, label: 'Payroll' },
    { key: 'reconciliation' as const, label: 'Reconciliation' },
    { key: 'activity-log' as const, label: 'Activity Log' },
  ];

  const handleChangePayPeriod = () => {
    setPayPeriodId('');
    setSearchValue({});
    setSearchQuery('');
    setCurrentPage(1);
    setSelectedRowKeys([]);
    router.push('/payroll');
  };

  const selectedPeriodLabel = selectedPayPeriod
    ? formatPayPeriodLabel(selectedPayPeriod)
    : 'Pay Periods';

  return (
    <div
      id="payroll-dashboard-view-container"
      data-cy="payroll-dashboard-view-container"
      className={
        isMobile
          ? 'bg-white overflow-x-hidden pb-2 [padding-top:max(1.5rem,env(safe-area-inset-top,0px))] py-4 w-full'
          : ''
      }
    >
      <div
        id="payroll-dashboard-inner-wrapper"
        data-cy="payroll-dashboard-inner-wrapper"
        className="w-full"
      >
        {/* Header Section */}
        <div
          id="payroll-dashboard-header-view-container"
          data-cy="payroll-dashboard-header-view-container"
          className="mb-6"
        >
          <h2
            id="payroll-dashboard-query-view-text"
            data-cy="payroll-dashboard-query-view-text"
            hidden
            style={{ marginBottom: '20px' }}
          >
            {payPeriodQuery}
          </h2>
          <div
            id="payroll-dashboard-title-wrapper"
            data-cy="payroll-dashboard-title-wrapper"
            className="w-full"
          >
            <CustomBreadcrumb
              title={
                <span
                  id="payroll-dashboard-title-view-text"
                  data-cy="payroll-dashboard-title-view-text"
                >
                  Payroll
                </span>
              }
              onBack={handleChangePayPeriod}
              backControlDataCy="payroll-dashboard-change-pay-period-back"
              subtitle={
                <Breadcrumb
                  data-cy="payroll-dashboard-breadcrumb"
                  className="mt-2 mb-0 whitespace-nowrap"
                  style={{ whiteSpace: 'nowrap' }}
                  items={[
                    {
                      title: (
                        <Link
                          href="/payroll"
                          data-cy="payroll-dashboard-breadcrumb-payroll-link"
                          className="text-xs sm:text-sm"
                        >
                          Payroll
                        </Link>
                      ),
                    },
                    {
                      title: (
                        <span
                          data-cy="payroll-breadcrumb-current"
                          className="text-xs sm:text-sm"
                        >
                          {selectedPeriodLabel}
                        </span>
                      ),
                    },
                  ]}
                />
              }
              titleExtra={
                <div
                  id="payroll-dashboard-actions-view-container"
                  data-cy="payroll-dashboard-actions-view-container"
                  className="flex gap-3 items-center"
                >
                  {/* More actions dropdown */}
                  <Dropdown
                    data-cy="payroll-more-actions-dropdown"
                    menu={{
                      items: [
                        {
                          key: 'send-payslip',
                          label: 'Email Payslip',
                          disabled: mergedPayrollForExport?.length === 0,
                          onClick: () => setOpen(true),
                        },
                        ...(hasPendingApprovals || isMockPeriod
                          ? [
                              {
                                key: 'approve',
                                label: 'Approve Payroll',
                                onClick: () => setIsApproveModalOpen(true),
                              },
                            ]
                          : []),
                        {
                          key: 'export',
                          label: 'Export',
                          onClick: () => setIsModalOpen(true),
                        },
                      ],
                    }}
                    trigger={['click']}
                  >
                    <Button
                      id="payroll-more-actions-click-button"
                      data-cy="payroll-more-actions-click-button"
                      className="flex !p-0 items-center justify-center w-10 h-10 min-w-10 border border-gray-300"
                      aria-label="More actions"
                    >
                      <MoreHorizIcon
                        className="text-gray-600 text-lg leading-none"
                        data-cy="payroll-more-actions-dots-view-text"
                      />
                    </Button>
                  </Dropdown>

                  {/* Generate / Regenerate button */}
                  {canGenerateOrRegenerate && (
                    <Popconfirm
                      id="payroll-generate-popconfirm-view-component"
                      data-cy="payroll-generate-popconfirm-view-component"
                      title={
                        payroll?.items?.length
                          ? 'Are you sure you want to regenerate the payroll ?'
                          : 'Are you sure you want to generate the payroll ?'
                      }
                      onConfirm={handleDeletePayroll}
                      okText="Yes"
                      cancelText="No"
                      disabled={!(payroll?.items?.length > 0)}
                    >
                      <AccessGuard
                        id="payroll-generate-guard-view-component"
                        data-cy="payroll-generate-guard-view-component"
                        permissions={[
                          Permissions.GeneratePayroll,
                          Permissions.DeletePayroll,
                        ]}
                      >
                        <Button
                          id="payroll-generate-open-modal-click-button"
                          data-cy="payroll-generate-open-modal-click-button"
                          type="primary"
                          aria-label={
                            isMobile || isTablet
                              ? payroll?.items?.length > 0
                                ? 'Regenerate payroll'
                                : 'Generate payroll'
                              : undefined
                          }
                          icon={
                            <span
                              className="inline-flex items-center justify-center leading-none"
                              data-cy="payroll-generate-button-icon-wrapper"
                            >
                              {payroll?.items?.length > 0 ? (
                                <FileSyncOutlined
                                  data-cy="payroll-generate-icon"
                                  className="text-base leading-none"
                                />
                              ) : (
                                <TbFileExport
                                  data-cy="payroll-generate-icon"
                                  size={16}
                                  className="block leading-none"
                                />
                              )}
                            </span>
                          }
                          className={
                            isMobile || isTablet
                              ? 'flex !w-10 !min-w-10 items-center justify-center !gap-0 !p-0 h-10 leading-none [&_.ant-btn-icon]:inline-flex [&_.ant-btn-icon]:items-center [&_.ant-btn-icon]:justify-center [&_.ant-btn-icon_svg]:block'
                              : 'flex items-center gap-2 px-6 h-10 leading-none [&_.ant-btn-icon]:inline-flex [&_.ant-btn-icon]:items-center [&_.ant-btn-icon]:justify-center [&_.ant-btn-icon_svg]:block'
                          }
                          onClick={() => setIsPayrollModalOpen(true)}
                          loading={
                            isCreatingPayroll || loading || deleteLoading
                          }
                        >
                          {!(isMobile || isTablet) &&
                            (payroll?.items?.length > 0 ? (
                              <span
                                className="inline-flex items-center leading-none"
                                data-cy="payroll-regenerate-button-label"
                              >
                                Regenerate
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center leading-none"
                                data-cy="payroll-generate-button-label"
                              >
                                Generate
                              </span>
                            ))}
                        </Button>

                        {isPayrollModalOpen && (
                          <GeneratePayrollModal
                            data-cy="payroll-generate-modal-view-component"
                            onGenerate={handleGeneratePayroll}
                            onClose={() => setIsPayrollModalOpen(false)}
                            loading={isCreatingPayroll || loading}
                            isRegenerate={payroll?.items?.length > 0}
                            selectedPayPeriodId={selectedPayPeriodId}
                          />
                        )}
                      </AccessGuard>
                    </Popconfirm>
                  )}
                </div>
              }
            />
          </div>
        </div>

        {/* Send Payslip Modal */}
        <Modal
          data-cy="payroll-send-payslip-modal-view-modal"
          title="Email Payslips"
          open={open}
          onCancel={() => setOpen(false)}
          centered
          width={470}
          footer={[
            <Button
              id="payroll-send-payslip-cancel-click-button"
              data-cy="payroll-send-payslip-cancel-click-button"
              key="cancel"
              type="default"
              htmlType="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>,
            <Button
              id="payroll-send-payslip-send-click-button"
              data-cy="payroll-send-payslip-send-click-button"
              key="send"
              type="primary"
              htmlType="button"
              onClick={() => {
                if (mergedPayrollForExport?.length > 0) {
                  sendingPaySlipHandler(mergedPayrollForExport);
                  addActivityLog(selectedPayPeriodId, {
                    action: 'Payslip Sent',
                    remarks: `Payslips emailed to ${mergedPayrollForExport.length} employee(s).`,
                  });
                  setOpen(false);
                }
              }}
              disabled={mergedPayrollForExport?.length === 0}
            >
              Send
            </Button>,
          ]}
        >
          <div
            id="payroll-send-payslip-modal-content-view-container"
            data-cy="payroll-send-payslip-modal-content-view-container"
            className="text-gray-600"
          >
            <p
              id="payroll-send-payslip-modal-description-view-text"
              data-cy="payroll-send-payslip-modal-description-view-text"
              className="text-base leading-6 m-0 max-w-[360px]"
            >
              You are about to send payslips to{' '}
              {mergedPayrollForExport?.length ?? 0} selected employees out of{' '}
              {(searchValue?.divisionId
                ? payrollForExport?.divisionUsers?.length
                : allEmployees?.items?.length) ?? 0}{' '}
              total employees.
            </p>
          </div>
        </Modal>

        {/* Approve Payroll Modal */}
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

      <div
        id="payroll-dashboard-content-wrapper"
        data-cy="payroll-dashboard-content-wrapper"
        className="w-full"
      >
        <div
          id="payroll-dashboard-tabs"
          data-cy="payroll-dashboard-tabs"
          className="mb-4 w-full"
        >
          <div
            className="flex w-full items-end justify-between gap-2 border-b border-gray-200"
            data-cy="payroll-dashboard-tabs-container"
          >
            <div
              className="scrollbar-hide flex min-w-0 flex-1 items-end gap-8 overflow-x-auto [-webkit-overflow-scrolling:touch]"
              data-cy="payroll-dashboard-tabs-scroll"
            >
              {payrollViewTabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    id={`payroll-dashboard-tab-${tab.key}`}
                    data-cy={`payroll-dashboard-tab-label-${tab.key}`}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative shrink-0 border-0 bg-transparent p-3 text-left text-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 ${
                      isActive
                        ? 'font-semibold text-primary'
                        : 'font-normal text-gray-800 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                    {isActive ? (
                      <span
                        className="pointer-events-none absolute inset-x-0 bottom-[-1px] z-10 h-0.5 bg-primary"
                        data-cy={`payroll-dashboard-tab-indicator-${tab.key}`}
                        aria-hidden
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Card (border starts below header + filters) */}
        {activeTab === 'payroll' ? (
          <div
            id="payroll-content-card-view-container"
            data-cy="payroll-content-card-view-container"
            className={
              isMobile
                ? 'bg-white rounded-xl shadow-sm border border-gray-100 p-4'
                : 'bg-white rounded-xl shadow-sm border border-gray-100 p-6'
            }
          >
            {/* Toolbar Section — Search + Filter */}
            <div
              id="payroll-filters-wrapper-view-container"
              data-cy="payroll-filters-wrapper-view-container"
              className="flex justify-between items-center gap-2 sm:gap-0 mb-8"
            >
              <Select
                id="payroll-search-employee-interact-select"
                data-cy="payroll-search-employee-interact-select"
                showSearch
                allowClear
                className="max-w-xs min-h-[40px] min-w-[240px] sm:min-w-[280px] [&_.ant-select-arrow]:!top-0 [&_.ant-select-arrow]:!bottom-0 [&_.ant-select-arrow]:!mt-0 [&_.ant-select-arrow]:!h-auto [&_.ant-select-arrow]:!flex [&_.ant-select-arrow]:!items-stretch [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!min-h-10 [&_.ant-select-selector]:!border-gray-200 [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector:hover]:!border-gray-300 [&_.ant-select-focused_.ant-select-selector]:!border-gray-300 [&_.ant-select-focused_.ant-select-selector]:!shadow-none"
                placeholder="Search Employee"
                value={searchValue?.employeeId}
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
                  <span
                    className="flex h-full min-h-full items-center self-stretch border-l border-gray-200 pl-3 text-gray-400"
                    data-cy="payroll-search-employee-suffix"
                  >
                    <SearchOutlined className="text-base" />
                  </span>
                }
              />
              <FilterPopover
                onSearch={handleSearch}
                defaultValues={searchValue as any}
                selectedPayPeriodId={selectedPayPeriodId}
                autoSearch={false}
              />
            </div>

            {payrollForExportLoading ? (
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
                    value={payrollForExport?.totalGrossPaymentAmount}
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
                    value={payrollForExport?.totalNetPayAmount}
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
                    value={payrollForExport?.totalAllowanceAmount}
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
                    value={payrollForExport?.totalMeritAmount}
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
                    value={payrollForExport?.totalDeductionsAmount}
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
              id="payroll-table-wrapper-view-container"
              data-cy="payroll-table-wrapper-view-container"
              className="payroll-table-scroll-host overflow-x-auto scrollbar-none rounded-lg overflow-hidden"
            >
              {payrollTableLoading ? (
                <PayrollTableLoadingSkeleton
                  columns={columns}
                  rows={pageSize}
                />
              ) : (
                <Table
                  id="payroll-table-view-table"
                  data-cy="payroll-table-view-table"
                  className="payroll-table"
                  dataSource={mergedPayroll || []}
                  columns={columns}
                  pagination={false}
                  locale={{
                    // Same pattern as feedback tables / redesign empty state
                    emptyText: (
                      <div
                        className="payroll-table-empty-viewport-center py-10"
                        data-cy="payroll-table-empty-wrap"
                      >
                        <EmptyState
                          minimal
                          description="No data found"
                          data-cy="payroll-table-empty"
                          className="!py-2"
                        />
                      </div>
                    ),
                  }}
                  rowClassName={(record: any, index: number) => {
                    void record;
                    return index % 2 === 1 ? 'payroll-zebra-row' : '';
                  }}
                  rowSelection={{
                    selectedRowKeys,
                    onChange: (newSelectedRowKeys: React.Key[]) => {
                      setSelectedRowKeys(newSelectedRowKeys);
                    },
                    onSelectAll: (isSelected: boolean) => {
                      if (isSelected) {
                        const allKeys = mergedPayroll.map(
                          (item: any) => item.id || item.employeeId,
                        );
                        setSelectedRowKeys(allKeys);
                      } else {
                        setSelectedRowKeys([]);
                      }
                    },
                  }}
                  rowKey={(record: any) => record.id || record.employeeId}
                />
              )}
            </div>
            {/* Pagination footer — outside scrollable table wrapper */}
            <div
              id="payroll-pagination-footer"
              data-cy="payroll-pagination-footer"
              className="bg-white px-0"
            >
              {isMobile || isTablet ? (
                <CustomMobilePagination
                  data-cy="payroll-mobile-pagination-view-component"
                  totalResults={payroll?.meta?.totalItems || 0}
                  pageSize={pageSize}
                  onChange={onPageChange}
                  onShowSizeChange={onPageChange}
                />
              ) : (
                <CustomPagination
                  data-cy="payroll-desktop-pagination-view-component"
                  current={currentPage}
                  total={payroll?.meta?.totalItems || 0}
                  pageSize={pageSize}
                  onChange={onPageChange}
                  onShowSizeChange={onPageSizeChange}
                />
              )}
            </div>
          </div>
        ) : activeTab === 'reconciliation' ? (
          <div
            id="payroll-reconciliation-content-card"
            data-cy="payroll-reconciliation-content-card"
            className={
              isMobile
                ? 'bg-white rounded-xl shadow-sm border border-gray-100 p-4'
                : 'bg-white rounded-xl shadow-sm border border-gray-100 p-6'
            }
          >
            <ReconciliationTab payPeriodId={selectedPayPeriodId} />
          </div>
        ) : (
          <div
            id="payroll-activity-log-content-card"
            data-cy="payroll-activity-log-content-card"
            className={
              isMobile
                ? 'bg-white rounded-xl shadow-sm border border-gray-100 p-4'
                : 'bg-white rounded-xl shadow-sm border border-gray-100 p-6'
            }
          >
            <ActivityLogTab payPeriodId={selectedPayPeriodId} />
          </div>
        )}
        <Modal
          title={
            <h2
              className="text-[16px] font-normal text-gray-900 m-0 leading-tight"
              data-cy="payroll-export-modal-title-view-text"
            >
              Export for Bank
            </h2>
          }
          data-cy="payroll-export-modal-view-modal"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          centered
          width={450}
          styles={{
            body: { padding: '8px 0 16px' },
          }}
          footer={[
            <Button
              id="payroll-export-modal-cancel-click-button"
              data-cy="payroll-export-modal-cancel-click-button"
              key="cancel"
              type="default"
              htmlType="button"
              size="large"
              className="px-6 !font-normal !text-[#4D4D4D] border border-solid !border-[#D9D9D9]"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>,
            <Button
              id="payroll-export-modal-submit-click-button"
              data-cy="payroll-export-modal-submit-click-button"
              key="export"
              type="primary"
              size="large"
              className="px-6 !font-normal shadow-none"
              onClick={handleExportAll}
              disabled={
                loading ||
                (!bankLetter && !exportPayrollData && !paySlip && !exportBank)
              }
              loading={loading}
            >
              Export
            </Button>,
          ]}
        >
          <div
            id="payroll-export-modal-options-view-container"
            data-cy="payroll-export-modal-options-view-container"
            style={{
              border: '1px solid #f0f0f0',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              marginTop: '12px',
            }}
          >
            <div
              id="payroll-export-bank-letter-toggle-view-container"
              data-cy="payroll-export-bank-letter-toggle-view-container"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'flex-start',
              }}
            >
              <Text
                id="payroll-export-bank-letter-toggle-view-text"
                data-cy="payroll-export-bank-letter-toggle-view-text"
                style={{ fontSize: '13px' }}
              >
                Export Bank Letter
              </Text>
              <Switch
                id="payroll-export-bank-letter-toggle-switch"
                data-cy="payroll-export-bank-letter-toggle-switch"
                checked={bankLetter}
                onChange={() => setBankLetter(!bankLetter)}
              />
            </div>

            <div
              id="payroll-export-payroll-toggle-view-container"
              data-cy="payroll-export-payroll-toggle-view-container"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'flex-start',
              }}
            >
              <Text
                id="payroll-export-payroll-toggle-view-text"
                data-cy="payroll-export-payroll-toggle-view-text"
                style={{ fontSize: '13px' }}
              >
                Export Payroll
              </Text>
              <Switch
                id="payroll-export-payroll-toggle-switch"
                data-cy="payroll-export-payroll-toggle-switch"
                checked={exportPayrollData}
                onChange={() => setExportPayrollData(!exportPayrollData)}
              />
            </div>

            <div
              id="payroll-export-payslip-toggle-view-container"
              data-cy="payroll-export-payslip-toggle-view-container"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'flex-start',
              }}
            >
              <Text
                id="payroll-export-payslip-toggle-view-text"
                data-cy="payroll-export-payslip-toggle-view-text"
                style={{ fontSize: '13px' }}
              >
                Send Email for employees
              </Text>
              <Switch
                id="payroll-export-payslip-toggle-switch"
                data-cy="payroll-export-payslip-toggle-switch"
                checked={paySlip}
                onChange={() => setPaySlip(!paySlip)}
              />
            </div>

            <div
              id="payroll-export-bank-toggle-view-container"
              data-cy="payroll-export-bank-toggle-view-container"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'flex-start',
              }}
            >
              <Text
                id="payroll-export-bank-toggle-view-text"
                data-cy="payroll-export-bank-toggle-view-text"
                style={{ fontSize: '13px' }}
              >
                Export Bank
              </Text>
              <Switch
                id="payroll-export-bank-toggle-switch"
                data-cy="payroll-export-bank-toggle-switch"
                checked={exportBank}
                onChange={() => setExportBank(!exportBank)}
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Payroll;
