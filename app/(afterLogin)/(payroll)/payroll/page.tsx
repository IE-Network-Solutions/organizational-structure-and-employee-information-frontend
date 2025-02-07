'use client';
import React, { useEffect, useState } from 'react';
import { Table, Row, Button, notification, Switch, Modal } from 'antd';
import Filters from './_components/filters';
import {
  useGetActivePayroll,
  useGetAllActiveBasicSalary,
  useGetEmployeeInfo,
} from '@/store/server/features/payroll/payroll/queries';
import { useCreatePayroll } from '@/store/server/features/payroll/payroll/mutation';
import PayrollCard from './_components/cards';
import { useExportData } from './_components/excel';
import { useGenerateBankLetter } from './_components/Latter';
import PaySlip from './_components/payslip';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

const Payroll = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportBank, setExportBank] = useState(true);
  const [bankLetter, setBankLetter] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: payroll, refetch } = useGetActivePayroll(searchQuery);
  const { data: employeeInfo } = useGetEmployeeInfo();
  const { data: allActiveSalary } = useGetAllActiveBasicSalary();
  const { data: allEmployees } = useGetAllUsers();

  const {
    mutate: createPayroll,
    isLoading: isCreatingPayroll,
    isSuccess: isCreatePayrollSuccess,
  } = useCreatePayroll();

  const { exportToExcel } = useExportData();
  const { generateBankLetter } = useGenerateBankLetter();

  const [loading, setLoading] = useState(false);
  const [mergedPayroll, setMergedPayroll] = useState<any>([]);

  useEffect(() => {
    if (payroll?.payrolls && allEmployees?.items) {
      const mergedData = payroll.payrolls.map((pay: any) => {
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

  useEffect(() => {
    if (isCreatePayrollSuccess) {
      notification.success({
        message: 'Payroll Generated',
        description: 'Payroll has been successfully generated.',
      });
    }
  }, [isCreatePayrollSuccess, payroll, employeeInfo]);

  const handleExportAll = async () => {
    const exportTasks = [];

    if (exportBank) exportTasks.push(handleExportBank());
    if (bankLetter)
      exportTasks.push(handleBankLetter(payroll?.totalNetPayAmount));

    if (exportTasks.length === 0) {
      notification.error({
        message: 'No Export Option Selected',
        description: 'Please select at least one option to export.',
      });
      return;
    }

    setLoading(true);
    try {
      await Promise.all(exportTasks);
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
  const handleSearch = (searchValues: any) => {
    const queryParams = new URLSearchParams();

    if (searchValues?.employeeId) {
      queryParams.append('employeeId', searchValues.employeeId);
    }
    if (searchValues?.monthId) {
      queryParams.append('monthId', searchValues.monthId);
    }

    const searchParams = queryParams.toString()
      ? `?${queryParams.toString()}`
      : '';
    setSearchQuery(searchParams);
    refetch();
  };

  const handleGeneratePayroll = async () => {
    if (!allActiveSalary || allActiveSalary.length === 0) {
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
      };
      createPayroll({ values: payRollData });
    } catch (error) {
      notification.error({
        message: 'Error Generating Payroll',
        description: 'An error occurred while generating payroll.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPayroll = async () => {
    if (!mergedPayroll || mergedPayroll?.length === 0) {
      notification.error({
        message: 'No Data Available',
        description: 'There is no data available to export.',
      });
      return;
    }

    setLoading(true);
    try {
      interface Allowance {
        type: string;
        amount: string | number;
      }

      interface Deduction {
        type: string;
        amount: string | number;
      }

      interface Pension {
        type: string;
        amount: string | number;
      }
      const uniqueAllowanceTypes = new Set<string>();
      const uniqueDeductionTypes = new Set<string>();
      const uniquePensionTypes = new Set<string>();

      mergedPayroll?.forEach((item: any) => {
        const allowances: Allowance[] = item.breakdown?.allowances || [];
        allowances.forEach((allowance: Allowance) => {
          uniqueAllowanceTypes.add(allowance.type);
        });

        const deductions: Deduction[] = item.breakdown?.deductions || [];
        deductions.forEach((deduction: Deduction) => {
          uniqueDeductionTypes.add(deduction.type);
        });

        const pension: Pension[] = item.breakdown?.pension || [];
        pension.forEach((p: Pension) => {
          uniquePensionTypes.add(p.type);
        });
      });

      const getDynamicWidth = (header: string) =>
        Math.max(20, header.length * 2);

      const allowanceColumns = Array.from(uniqueAllowanceTypes).map((type) => ({
        header: type,
        key: type.replace(/\s+/g, '').toLowerCase(),
        width: getDynamicWidth(type),
      }));

      const deductionColumns = Array.from(uniqueDeductionTypes).map((type) => ({
        header: type,
        key: type.replace(/\s+/g, '').toLowerCase(),
        width: getDynamicWidth(type),
      }));

      const pensionColumns = Array.from(uniquePensionTypes).map((type) => ({
        header: type,
        key: type.replace(/\s+/g, '').toLowerCase(),
        width: getDynamicWidth(type),
      }));

      const flatPayrollData = mergedPayroll?.map((item: any) => {
        const fullName =
          `${item.employeeInfo?.firstName || ''} ${item.employeeInfo?.lastName || ''}`.trim() ||
          '--';

        const basicSalary =
          item.employeeInfo?.basicSalaries?.find((bs: any) => bs.status)
            ?.basicSalary || 0;

        const tax = item.breakdown?.tax?.amount
          ? item.breakdown.tax.amount.toFixed(2)
          : '0.0';

        const allowances: Allowance[] = item.breakdown?.allowances || [];
        const deductions: Deduction[] = item.breakdown?.deductions || [];
        const pensions: Pension[] = item.breakdown?.pension || [];

        const rowData: any = {
          fullName,
          basicSalary: Number(basicSalary).toFixed(2),
          totalAllowance: Number(item.totalAllowance || 0).toFixed(2),
          totalBenefits: Number(item.totalMerit || 0).toFixed(2),
          totalDeduction: Number(item.totalDeductions || 0).toFixed(2),
          grossIncome: Number(item.grossSalary || 0).toFixed(2),
          tax,
          netIncome: Number(item.netPay || 0).toFixed(2),
        };

        Array.from(uniqueAllowanceTypes).forEach((type) => {
          const allowance = allowances.find((a) => a.type === type);
          rowData[type.replace(/\s+/g, '').toLowerCase()] = allowance
            ? Number(allowance.amount || 0).toFixed(2)
            : '0';
        });

        Array.from(uniqueDeductionTypes).forEach((type) => {
          const deduction = deductions.find((d) => d.type === type);
          rowData[type.replace(/\s+/g, '').toLowerCase()] = deduction
            ? Number(deduction.amount || 0).toFixed(2)
            : '0';
        });

        Array.from(uniquePensionTypes).forEach((type) => {
          const pension = pensions.find((p) => p.type === type);
          rowData[type.replace(/\s+/g, '').toLowerCase()] = pension
            ? Number(pension.amount || 0).toFixed(2)
            : '0';
        });

        return rowData;
      });

      if (!flatPayrollData || flatPayrollData.length === 0) {
        throw new Error('Formatted payroll data is empty');
      }

      const exportColumns = [
        {
          header: 'Full Name',
          key: 'fullName',
          width: getDynamicWidth('Full Name'),
        },
        {
          header: 'Basic Salary',
          key: 'basicSalary',
          width: getDynamicWidth('Basic Salary'),
        },
        {
          header: 'Total Allowance',
          key: 'totalAllowance',
          width: getDynamicWidth('Total Allowance'),
        },
        {
          header: 'Total Benefits',
          key: 'totalBenefits',
          width: getDynamicWidth('Total Benefits'),
        },
        {
          header: 'Total Deduction',
          key: 'totalDeduction',
          width: getDynamicWidth('Total Deduction'),
        },
        {
          header: 'Gross Income',
          key: 'grossIncome',
          width: getDynamicWidth('Gross Income'),
        },
        { header: 'Tax', key: 'tax', width: getDynamicWidth('Tax') },
        ...allowanceColumns, // Add dynamic allowance columns
        ...deductionColumns, // Add dynamic deduction columns
        ...pensionColumns, // Add dynamic pension columns
        {
          header: 'Net Income',
          key: 'netIncome',
          width: getDynamicWidth('Net Income'),
        },
      ];

      await exportToExcel(flatPayrollData, exportColumns, 'Payroll Data');
    } catch (error) {
      notification.error({
        message: 'Error Exporting Data',
        description: `An error occurred while exporting data: ${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  type Payroll = {
    employeeId: string;
    netPay: number;
  };

  const handleExportBank = async () => {
    if (!employeeInfo || employeeInfo.length === 0) {
      notification.error({
        message: 'No Data Available',
        description: 'There is no data available to export.',
      });
      return;
    }

    setLoading(true);
    try {
      const flatData = employeeInfo.map((employee: any) => {
        const payroll = mergedPayroll.find(
          (p: any) => p.employeeId === employee.id,
        ) as Payroll | undefined;

        return {
          employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`,
          email: employee.email || '--',
          accountNumber:
            employee.employeeInformation?.bankInformation?.accountNumber ||
            '--',
          bankName:
            employee.employeeInformation?.bankInformation?.bankName || '--',
          netPay: payroll?.netPay ?? '--', // Ensure a fallback value
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
      generateBankLetter(amount);
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
      render: (notused: any, record: any) =>
        `${record.employeeInfo?.firstName || ''} ${record.employeeInfo?.lastName || ''}`,
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
      title: 'Total Allowance',
      dataIndex: 'totalAllowance',
      key: 'totalAllowance',
      minWidth: 150,
    },
    {
      title: 'Total Benefits',
      dataIndex: 'totalMerit',
      key: 'totalMerit',
      minWidth: 150,
    },
    {
      title: 'Total Deduction',
      dataIndex: 'totalDeductions',
      key: 'totalDeductions',
      minWidth: 150,
    },
    {
      title: 'Gross Income',
      dataIndex: 'grossSalary',
      key: 'grossSalary',
      minWidth: 150,
    },
    {
      title: 'Tax',
      dataIndex: ['breakdown', 'tax'],
      key: 'tax',
      minWidth: 150,
      render: (nonused: any, record: any) =>
        record.breakdown?.tax?.amount
          ? record.breakdown.tax.amount.toFixed(2)
          : '0.00',
    },
    {
      title: 'Employee Pension',
      dataIndex: 'pension',
      key: 'pension',
      minWidth: 150,
      render: (nonused: any, record: any) => {
        const totalPension =
          record.breakdown?.pension?.reduce(
            (sum: any, p: any) => sum + parseFloat(p.amount),
            0,
          ) || 0;
        return totalPension.toFixed(2);
      },
    },
    {
      title: 'Cost Sharing',
      dataIndex: 'costsharing',
      key: 'costsharing',
      minWidth: 150,
      render: (nonused: any, record: any) => {
        const costSharing = record.breakdown?.deductions?.find(
          (deduction: any) =>
            deduction.type.toLowerCase().startsWith('cost sharing '),
        );
        const amount =
          costSharing && typeof costSharing.amount === 'number'
            ? costSharing.amount.toFixed(2)
            : '0.00';

        return amount;
      },
    },
    {
      title: 'Net Income',
      dataIndex: 'netPay',
      key: 'netPay',
      minWidth: 150,
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div className="flex justify-between items-center gap-4 scrollbar-none">
        <h2 style={{ marginBottom: '20px' }}>Payroll</h2>
        <div className="flex gap-4">
          <Button
            type="default"
            className="text-white bg-violet-500 border-none p-6"
            onClick={() => setIsModalOpen(true)}
          >
            Export
          </Button>
          <Button
            type="default"
            className="text-white bg-violet-500 border-none p-6"
            onClick={handleExportPayroll}
          >
            Export Payroll
          </Button>

          <Button
            type="primary"
            className="p-6"
            onClick={handleGeneratePayroll}
            loading={isCreatingPayroll || loading}
            disabled={isCreatingPayroll || loading}
          >
            Generate Payroll
          </Button>
        </div>
      </div>

      <Filters onSearch={handleSearch} />
      <Row
        gutter={16}
        style={{
          marginBottom: '20px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          display: 'flex',
          flexWrap: 'nowrap',
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

        <PayrollCard title="Total Benefit" value={payroll?.totalMeritAmount} />
        <PayrollCard
          title="Total Deduction"
          value={payroll?.totalDeductionsAmount}
        />
      </Row>
      <div className="overflow-x-auto scrollbar-none">
        <Table
          dataSource={mergedPayroll || []}
          columns={columns}
          pagination={{
            current: currentPage,
            pageSize: 6,
            onChange: setCurrentPage,
          }}
        />
      </div>
      <Modal
        title="Export for Bank"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="export"
            type="primary"
            onClick={handleExportAll}
            className="text-white bg-blue border-none"
            disabled={!(exportBank || bankLetter) || loading}
            loading={loading}
          >
            Export
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-5 m-6">
          <div className="flex flex-col justify-between items-start gap-2 ">
            <span>Export Bank Letter</span>
            <Switch checked={bankLetter} onChange={setBankLetter} />
          </div>
          <div className="flex flex-col justify-between items-start gap-2 ">
            <span>Export Bank</span>
            <Switch checked={exportBank} onChange={setExportBank} />
          </div>
          {/* <div className="flex flex-col justify-between items-start gap-2 ">
            <span>Send Email for employees</span>
            <Switch checked={true} onChange={() => {}} />
          </div> */}
        </div>
      </Modal>
      <div className="h-12 overflow-hidden">
        <PaySlip data={mergedPayroll} />
      </div>
    </div>
  );
};

export default Payroll;
