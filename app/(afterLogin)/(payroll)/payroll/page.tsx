'use client';
import React, { useEffect, useState } from 'react';

import {
  Table,
  Row,
  Button,
  notification,
  Popconfirm,
  Modal,
  Switch,
  Select,
  Tooltip,
  Avatar,
} from 'antd';
import { Workbook } from 'exceljs';
import Filters from './_components/filters';
import {
  useGetActivePayroll,
  useGetAllActiveBasicSalary,
  useGetEmployeeInfo,
  useGetAllPayrollForExport,
} from '@/store/server/features/payroll/payroll/queries';
import {
  useCreatePayroll,
  useDeletePayroll,
  useSendingPayrollPayslip,
} from '@/store/server/features/payroll/payroll/mutation';
import PayrollCard from './_components/cards';
import { useGenerateBankLetter } from './_components/Latter';
import { saveAs } from 'file-saver';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  useGetAllUsers,
  useGetAllUsersData,
} from '@/store/server/features/employees/employeeManagment/queries';
import { PaySlipData } from '@/store/server/features/payroll/payroll/interface';
import { useExportData } from './_components/excel';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/components/common/hooks/useIsMobile';
import { PiExportLight } from 'react-icons/pi';
import { LuSettings2 } from 'react-icons/lu';
import useEmployeeStore from '@/store/uistate/features/payroll/employeeInfoStore';
import { TbFileExport } from 'react-icons/tb';
import GeneratePayrollModal, { Incentive } from './_components/modal';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';
import { usePayrollStore } from '@/store/uistate/features/payroll/payroll';

const Payroll = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportBank, setExportBank] = useState(true);
  const [bankLetter, setBankLetter] = useState(true);
  const [paySlip, setPaySlip] = useState(false);
  const [exportPayrollData, setExportPayrollData] = useState(true);
  const {
    searchQuery,
    setSearchQuery,
    isFilterModalOpen,
    setIsFilterModalOpen,
    isPayrollModalOpen,
    setIsPayrollModalOpen,
  } = useEmployeeStore();

  const { pageSize, currentPage, setCurrentPage, setPageSize } =
    usePayrollStore();

  const [payPeriodQuery, setPayPeriodQuery] = useState('');
  const [payPeriodId, setPayPeriodId] = useState('');
  const { data: payroll, refetch } = useGetActivePayroll(
    searchQuery,
    pageSize,
    currentPage,
  );
  const { data: employeeInfo } = useGetEmployeeInfo();
  const { data: allActiveSalary } = useGetAllActiveBasicSalary();
  const { data: allEmployees } = useGetAllUsersData();
  const { data: employeeData } = useGetAllUsers();
  const [searchValue, setSearchValue] = useState<{ [key: string]: string }>({});

  // Add the export hook for fetching all payroll data without pagination
  const { refetch: refetchAllPayroll } = useGetAllPayrollForExport(searchQuery);

  const { mutate: createPayroll, isLoading: isCreatingPayroll } =
    useCreatePayroll();

  const { mutate: sendPaySlip, isLoading: sendingPaySlipLoading } =
    useSendingPayrollPayslip();
  const { generateBankLetter } = useGenerateBankLetter();
  const { exportToExcel } = useExportData();

  const [loading, setLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [mergedPayroll, setMergedPayroll] = useState<any>([]);
  const { mutate: deletePayroll, isLoading: deleteLoading } =
    useDeletePayroll();

  useEffect(() => {
    if (payroll?.items && allEmployees?.items) {
      const mergedData = payroll?.items.map((pay: any) => {
        const employee = allEmployees.items.find(
          (emp: any) => emp.id === pay.employeeId,
        );
        return {
          ...pay,
          employeeInfo: employee || null,
        };
      });

      setMergedPayroll(mergedData);
    }
  }, [payroll, allEmployees]);

  const handleExportAll = async () => {
    const exportTasks: Promise<any>[] = []; // Ensure array contains promises

    if (paySlip)
      exportTasks.push(Promise.resolve(sendingPaySlipHandler(mergedPayroll)));

    if (exportPayrollData)
      exportTasks.push(Promise.resolve(handleDeductionExportPayroll()));

    if (exportBank) exportTasks.push(handleExportBank());

    if (bankLetter)
      exportTasks.push(
        Promise.resolve(handleBankLetter(payroll?.totalNetPayAmount)),
      );

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
        description: 'Selected export operations completed successfully.',
      });
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

  const handleSearch = (searchValues: any) => {
    const queryParams = new URLSearchParams();

    if (searchValues?.employeeId) {
      queryParams.append('employeeId', searchValues.employeeId);
    }
    if (searchValues?.monthId) {
      queryParams.append('monthId', searchValues.monthId);
    }
    if (searchValues?.payPeriodId) {
      queryParams.append('payPeriodId', searchValues.payPeriodId);
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      setPayPeriodQuery(query);
      setPayPeriodId(searchValues.payPeriodId);
    }

    const searchParams = queryParams.toString()
      ? `&${queryParams.toString()}`
      : '';
    setSearchQuery(searchParams);
    refetch();
  };

  const handleGeneratePayroll = async (data: Incentive) => {
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
          },
        },
      );
      setIsPayrollModalOpen(false);
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
  const handleDeductionExportPayroll = async () => {
    setLoading(true);
    setExportProgress('Fetching payroll data...');
    try {
      // Fetch all payroll data for export (without pagination)
      const allPayroll = await fetchAllPayrollForExport();

      if (
        !validatePayrollData(
          allPayroll,
          'There is no data available to export.',
        )
      ) {
        setLoading(false);
        setExportProgress('');
        return;
      }

      setExportProgress('Processing data...');
      // Merge all payroll data with employee data
      const allMergedPayroll = mergePayrollWithEmployees(allPayroll.items);

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
        { type: 'Basic Salary', key: 'basicSalary' },
        { type: 'Transport Allowance', key: 'transportAllowance' },
        { type: 'Taxable Transport', key: 'taxableTransport' },
        { type: 'Total Award', key: 'totalBenefits' },
        { type: 'Gross Salary', key: 'grossIncome' },
        { type: 'Taxable Income', key: 'taxableIncome' },
        { type: 'Tax', key: 'tax' },
        { type: 'Total Deduction', key: 'totalDeduction' },
        { type: 'Variable Pay', key: 'variablePay' },
        { type: 'Total Incentive', key: 'totalIncentive' },
        { type: 'Employee Pension', key: 'employeePension' },
        { type: 'Company Pension', key: 'companyPesnion' },
        { type: 'Net Income', key: 'netIncome' },
      ];
      const columnHeaderMap = new Map<string, string>(
        exportColumns.map((col) => [col.key, col.type]),
      );
      exportColumns.forEach((col) => uniquePayrollColumns.add(col.key));

      // Collect unique types from all payroll data
      allMergedPayroll.forEach((item: any) => {
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

      setExportProgress('Generating Excel file...');
      // Process all payroll data
      allMergedPayroll.forEach((item: any) => {
        const fullName =
          `${item.employeeInfo?.firstName || ''} ${item.employeeInfo?.middleName || ''} ${item.employeeInfo?.lastName || ''}`.trim() ||
          '--';
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
        const taxableTransport = transportAllowance - 600;
        const totalBenefits = item.totalMerit || 0;

        const payrollRowData: any = {
          fullName,
          basicSalary: formatAmount(basicSalary),
          transportAllowance: formatAmount(transportAllowance),
          taxableTransport: formatAmount(taxableTransport),
          totalBenefits: formatAmount(totalBenefits || 0),
          grossIncome: formatAmount(item.grossSalary || 0),
          taxableIncome: formatAmount(item.grossSalary - 600 || 0),
          tax: formatAmount(item.breakdown?.tax?.amount),
          totalDeduction: formatAmount(item.totalDeductions || 0),
          variablePay: formatAmount(variablePay || 0),
          totalIncentive: formatAmount(totalIncentive || 0),
          employeePension: formatAmount(
            item.breakdown?.pension?.find((i: any) => i.type == 'Pension')
              ?.amount || 0,
          ),
          companyPesnion: formatAmount(
            item.breakdown?.pension?.find(
              (i: any) => i.type == 'CompanyContribution',
            )?.amount || 0,
          ),
          netIncome: formatAmount(item.netPay || 0),
        };

        // Calculate total deductions
        const totalDeductions = deductions.reduce(
          (sum: number, d: any) => sum + Number(d.amount || 0),
          0,
        );
        const deductionRow: any = {
          fullName,
          totalDeductions: formatAmount(totalDeductions),
        };

        // Calculate total allowances
        const totalAllowances = allowances.reduce(
          (sum: number, a: any) => sum + Number(a.amount || 0),
          0,
        );
        const allowanceRow: any = {
          fullName,
          totalAllowances: formatAmount(totalAllowances),
        };

        // Calculate total merits
        const totalMerits = merits.reduce(
          (sum: number, m: any) => sum + Number(m.amount || 0),
          0,
        );
        const meritRow: any = {
          fullName,
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
          meritRow[type.replace(/\s+/g, '').toLowerCase()] = formatAmount(
            merit?.amount || 0,
          );
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
        const headers = [
          { header: 'Full Name', key: 'fullName', minWidth: 30 },
          ...Array.from(uniqueTypes).map((type) => ({
            header: columnHeaderMap.get(type) || type,
            key: type,
            minWidth: 12,
          })),
          ...(sheetName !== 'Payrolls'
            ? [{ header: `Total ${sheetName}`, key: totalKey, minWidth: 18 }]
            : []),
        ];

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
      setExportProgress('Downloading file...');
      saveAs(
        new Blob([buffer], { type: 'application/octet-stream' }),
        'Payroll_Details_All_Data.xlsx',
      );

      NotificationMessage.success({
        message: 'Export Successful',
        description: `Payroll data exported successfully! (${allMergedPayroll.length} records)`,
      });
    } catch (error) {
      NotificationMessage.error({
        message: 'Export Error',
        description: 'An error occurred while exporting payroll data.',
      });
    } finally {
      setLoading(false);
      setExportProgress('');
    }
  };

  const handleExportBank = async () => {
    if (!employeeInfo || employeeInfo?.length === 0) {
      notification.error({
        message: 'No Data Available',
        description: 'There is no data available to export.',
      });
      return;
    }
    setLoading(true);
    try {
      // Fetch all payroll data for bank export (without pagination)
      const allPayroll = await fetchAllPayrollForExport();

      if (
        !validatePayrollData(
          allPayroll,
          'There is no payroll data available to export.',
        )
      ) {
        setLoading(false);
        return;
      }

      const formatAmount = (amount: number | undefined | null) => {
        return Number(amount || 0).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };

      const flatData = employeeInfo.map((employee: any) => {
        const payroll = allPayroll.items.find(
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
      notification.error({
        message: 'Error Generating Bank Letter',
        description: 'An error occurred while generating the bank letter.',
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'employeeId',
      key: 'employeeId',
      minWidth: 200,
      render: (notused: any, record: any) => (
        <div className="flex items-center gap-2">
          <Avatar src={record.employeeInfo?.profileImage} size={32} />
          <span>
            {`${record.employeeInfo?.firstName || ''} ${record.employeeInfo?.lastName || ''}`}
          </span>
        </div>
      ),
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
    {
      title: 'Transport Allowance',
      dataIndex: 'transportAllowance',
      key: 'transportAllowance',
      minWidth: 150,
      render: (notused: any, record: any) => {
        const totalTransportAllowance =
          record.breakdown?.allowances
            ?.filter((item: any) => item.type === 'Transport Allowance')
            ?.reduce(
              (acc: number, item: any) => acc + Number(item.amount),
              0,
            ) || 0;
        return <div>{totalTransportAllowance.toFixed(2)}</div>;
      },
    },
    {
      title: 'Taxable Transport Allowance',
      dataIndex: 'taxableTransportAllowance', // Fixed typo in dataIndex
      key: 'taxableTransportAllowance', // Fixed typo in key (taxabale -> taxable)
      minWidth: 150,
      render: (notused: any, record: any) => {
        const totalTransportAllowance =
          record.breakdown?.allowances
            ?.filter((item: any) => item.type === 'Transport Allowance')
            ?.reduce(
              (acc: number, item: any) => acc + Number(item.amount),
              0,
            ) || 0;
        const taxableAmount = totalTransportAllowance - 600;
        return <div>{taxableAmount.toFixed(2)}</div>;
      },
    },
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
      title: 'Tax',
      dataIndex: 'tax',
      key: 'tax',
      minWidth: 150,
      render: (notused: any, record: any) =>
        Number(record.breakdown?.tax?.amount)?.toLocaleString(),
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
      title: 'Variable Pay',
      dataIndex: 'variablePay',
      key: 'variablePay',
      minWidth: 150,
      render: (notused: any, record: any) =>
        Number(record.breakdown?.variablePay?.amount)?.toLocaleString(),
    },
    {
      title: 'Gross Income after VP',
      dataIndex: 'grossSalary',
      key: 'grossSalary',
      minWidth: 150,
      render: (key: string) => Number(key)?.toLocaleString(),
    },
    {
      title: 'Taxable Income',
      dataIndex: 'taxableIncome',
      key: 'taxableIncome',
      minWidth: 150,
      render: (notused: any, record: any) =>
        Number(record.grossSalary - 600)?.toLocaleString(),
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

  const handleEmployeeSelect = (value: string) => {
    setSearchValue((prev) => {
      const updatedSearchValue = { ...prev, employeeId: value };
      handleSearch(updatedSearchValue);
      return updatedSearchValue;
    });
  };
  const options =
    employeeData?.items?.map((emp: Record<string, string>) => ({
      value: emp.id,
      label: `${emp?.firstName || ''} ${emp?.middleName} ${emp?.lastName}`, // Full name as label
      employeeData: emp,
    })) || [];

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

  const fetchAllPayrollForExport = async () => {
    try {
      const result = await refetchAllPayroll();
      return result.data;
    } catch (error) {
      throw new Error('Failed to fetch payroll data for export');
    }
  };

  const mergePayrollWithEmployees = (payrollItems: any[]) => {
    return payrollItems.map((pay: any) => {
      const employee = allEmployees?.items?.find(
        (emp: any) => emp.id === pay.employeeId,
      );
      return {
        ...pay,
        employeeInfo: employee || null,
      };
    });
  };

  const validatePayrollData = (payroll: any, errorMessage: string) => {
    if (!payroll?.items || payroll?.items?.length === 0) {
      NotificationMessage.error({
        message: 'No Data Available',
        description: errorMessage,
      });
      return false;
    }
    return true;
  };

  return (
    <div
      className={isMobile ? 'pt-[16px] bg-gray-100' : 'pt-[16px] bg-white'}
      style={{ padding: isMobile ? '3px' : '20px' }}
    >
      <div
        className={`flex justify-between items-center scrollbar-none ${isMobile ? 'bg-gray-100' : 'bg-white'} pt-6 ${isMobile ? '-mx-1' : ''}`}
      >
        <h2 className="text-2xl mb-7">Payroll</h2>
        <h2 hidden style={{ marginBottom: '20px' }}>
          {payPeriodQuery}
        </h2>
        <div className="flex gap-4  mb-7">
          <AccessGuard permissions={[Permissions.PayrollExport]}>
            <Tooltip title="Export">
              <Button
                className={`text-[#3636F0] bg-[#B2B2FF] border-none p-5 mr-2 ${isMobile ? 'flex items-center justify-center' : ''}`}
                onClick={() => setIsModalOpen(true)}
              >
                {isMobile ? <PiExportLight size={24} /> : 'Export'}
              </Button>
            </Tooltip>
          </AccessGuard>

          {!isMobile && (
            <AccessGuard permissions={[Permissions.SendPayslipEmail]}>
              <Popconfirm
                title="Send Payslips"
                description={
                  <div>
                    {mergedPayroll?.length > 0 ? (
                      mergedPayroll?.length < allEmployees?.items?.length ? (
                        <p>
                          This will send payslips to {mergedPayroll?.length}{' '}
                          selected employees (filtered from{' '}
                          {allEmployees?.items?.length} total).
                        </p>
                      ) : (
                        <p>
                          This will send payslips to ALL{' '}
                          {allEmployees?.items?.length} employees.
                        </p>
                      )
                    ) : (
                      <p style={{ color: 'red', marginTop: '8px' }}>
                        No employees selected. Please adjust your filters.
                      </p>
                    )}
                    {mergedPayroll?.length > 0 &&
                      mergedPayroll?.length < allEmployees?.items?.length && (
                        <p style={{ color: 'orange', marginTop: '8px' }}>
                          Note: You&apos;re sending to a filtered subset. Clear
                          filters to send to everyone.
                        </p>
                      )}
                  </div>
                }
                okText={
                  mergedPayroll?.length === 0
                    ? 'Cannot Send'
                    : mergedPayroll?.length < allEmployees?.items?.length
                      ? 'Send to Filtered'
                      : 'Send to All'
                }
                cancelText="Cancel"
                onConfirm={() => {
                  if (mergedPayroll?.length > 0) {
                    sendingPaySlipHandler(mergedPayroll);
                  }
                }}
                okButtonProps={{
                  disabled: mergedPayroll?.length === 0,
                }}
              >
                <Tooltip
                  title={
                    mergedPayroll?.length === 0
                      ? 'No employees selected. Please adjust your filters.'
                      : mergedPayroll?.length < allEmployees?.items?.length
                        ? `Will send to ${mergedPayroll?.length} filtered employee(s)`
                        : 'Will send to all employees'
                  }
                >
                  <span>
                    {' '}
                    {/* Important: wrap the disabled button in a span for tooltip to work */}
                    <Button
                      type="default"
                      loading={sendingPaySlipLoading}
                      className="text-white bg-primary border-none p-5 flex flex-col items-start disabled:opacity-50"
                      disabled={mergedPayroll?.length === 0}
                    >
                      <span className="text-base font-semibold">
                        Send Payslip
                      </span>
                    </Button>
                  </span>
                </Tooltip>
              </Popconfirm>
            </AccessGuard>
          )}
          <Popconfirm
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
              permissions={[
                Permissions.GeneratePayroll,
                Permissions.DeletePayroll,
              ]}
            >
              <Tooltip
                title={
                  payroll?.items?.length > 0
                    ? 'Regenerate Payroll'
                    : 'Generate Payroll'
                }
              >
                <Button
                  type="primary"
                  className={`p-5 mr-2 ${isMobile ? 'flex items-center justify-center' : ''}`}
                  onClick={() => setIsPayrollModalOpen(true)}
                  loading={isCreatingPayroll || loading || deleteLoading}
                >
                  {isMobile ? (
                    <TbFileExport size={24} />
                  ) : payroll?.items?.length > 0 ? (
                    'Regenerate'
                  ) : (
                    'Generate'
                  )}
                </Button>

                {isPayrollModalOpen && (
                  <GeneratePayrollModal
                    onGenerate={handleGeneratePayroll}
                    onClose={() => setIsPayrollModalOpen(false)}
                  />
                )}
              </Tooltip>
            </AccessGuard>
          </Popconfirm>
        </div>
      </div>
      <div
        className={
          isMobile ? 'pl-2 pr-1 pt-2 bg-white mr-2' : 'pl-2 pr-1 pt-2 bg-white'
        }
      >
        {!isMobile ? (
          <Filters onSearch={handleSearch} oneRow={true} />
        ) : (
          <div className="flex justify-between items-center gap-4">
            <Select
              showSearch
              allowClear
              className="min-h-12 w-full"
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
            />
            <Button
              className="p-6 mr-2"
              onClick={() => setIsFilterModalOpen(true)}
              icon={<LuSettings2 size={20} />}
            />
          </div>
        )}
        {isFilterModalOpen && (
          <Modal
            title="Filters"
            open={isFilterModalOpen}
            onCancel={() => setIsFilterModalOpen(false)}
            footer={
              <div className="flex justify-center gap-4">
                <Button
                  key="cancel"
                  onClick={() => {
                    setSearchQuery('');
                    setIsFilterModalOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  key="filter"
                  type="primary"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="text-white bg-blue border-none"
                  loading={loading}
                >
                  Filter
                </Button>
              </div>
            }
            width={isMobile ? '90%' : '50%'}
          >
            <Filters
              onSearch={handleSearch}
              oneRow={false}
              disable={['name']}
            />
          </Modal>
        )}
        <Row
          gutter={16}
          style={{
            marginBottom: '20px',
            overflowX: isMobile ? 'hidden' : 'auto',
            whiteSpace: isMobile ? 'normal' : 'nowrap',
            display: !isMobile ? 'flex' : 'block',
            flexWrap: 'nowrap',
            width: isMobile ? '100%' : 'auto',
          }}
          className="scrollbar-none"
        >
          <PayrollCard
            title="Total Amount"
            value={payroll?.totalGrossPaymentAmount}
          />
          <PayrollCard
            title="Net Paid Amount"
            value={payroll?.totalNetPayAmount}
          />
          <PayrollCard
            title="Total Allowance"
            value={payroll?.totalAllowanceAmount}
          />

          <PayrollCard
            title="Total Benefit"
            value={payroll?.totalMeritAmount}
          />
          <PayrollCard
            title="Total Deduction"
            value={payroll?.totalDeductionsAmount}
          />
        </Row>
        <div className="overflow-x-auto scrollbar-none">
          <Table
            dataSource={mergedPayroll || []}
            columns={columns}
            pagination={false}
          />
          {isMobile || isTablet ? (
            <CustomMobilePagination
              totalResults={payroll?.meta?.totalItems || 0}
              pageSize={pageSize}
              onChange={onPageChange}
              onShowSizeChange={onPageChange}
            />
          ) : (
            <CustomPagination
              current={currentPage}
              total={payroll?.meta?.totalItems || 0}
              pageSize={pageSize}
              onChange={onPageChange}
              onShowSizeChange={onPageSizeChange}
            />
          )}
        </div>
        <Modal
          title="Export for Bank"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={
            <div className="flex justify-center gap-4">
              <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                key="export"
                type="primary"
                onClick={handleExportAll}
                className="text-white bg-blue border-none"
                disabled={!exportPayrollData || loading}
                loading={loading}
              >
                {loading ? 'Exporting...' : 'Export'}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-5 m-6">
            {loading && exportProgress && (
              <div className="text-center text-blue-600 font-medium">
                {exportProgress}
              </div>
            )}
            <div className="flex flex-col justify-between items-start gap-2 ">
              <span>Export Bank Letter</span>
              <Switch
                checked={bankLetter}
                onChange={() => setBankLetter(!bankLetter)}
              />
            </div>
            <div className="flex flex-col justify-between items-start gap-2 ">
              <span>Export Payroll</span>
              <Switch
                checked={exportPayrollData}
                onChange={() => setExportPayrollData(!exportPayrollData)}
              />
            </div>

            <div className="flex flex-col justify-between items-start gap-2 ">
              <span> Send Email for employees</span>
              <Switch
                disabled={!isMobile}
                checked={paySlip}
                onChange={() => setPaySlip(!paySlip)}
              />
            </div>

            <div className="flex flex-col justify-between items-start gap-2 ">
              <span>Export Bank</span>
              <Switch
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