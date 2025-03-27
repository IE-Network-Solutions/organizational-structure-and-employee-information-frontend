'use client';
import React, { useEffect, useState } from 'react';
import { Table, Row, Button, notification, Popconfirm } from 'antd';
import Filters from './_components/filters';
import {
  useGetActivePayroll,
  useGetAllActiveBasicSalary,
  useGetEmployeeInfo,
} from '@/store/server/features/payroll/payroll/queries';
import {
  useCreatePayroll,
  useDeletePayroll,
} from '@/store/server/features/payroll/payroll/mutation';
import { EmployeeDetails } from '../../(okrplanning)/okr/settings/criteria-management/_components/criteria-drawer';
import PayrollCard from './_components/cards';
import { useGetBasicSalaryById } from '@/store/server/features/employees/employeeManagment/basicSalary/queries';
import { useExportData } from './_components/excel';
import { useGenerateBankLetter } from './_components/Latter';

const EmployeeBasicSalary = ({ id }: { id: string }) => {
  const { data, error } = useGetBasicSalaryById(id);
  if (error || !data) {
    return '--';
  }
  const employeeBasicSalary =
    data.find((item: any) => item.status)?.basicSalary || '--';
  return Number(employeeBasicSalary)?.toLocaleString();
};

const Payroll = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [payPeriodQuery, setPayPeriodQuery] = useState('');
  const [payPeriodId, setPayPeriodId] = useState('');
  const { data: payroll, refetch } = useGetActivePayroll(searchQuery);
  const { data: employeeInfo } = useGetEmployeeInfo();
  const { data: allActiveSalary } = useGetAllActiveBasicSalary();
  const {
    mutate: createPayroll,
    isLoading: isCreatingPayroll,
    isSuccess: isCreatePayrollSuccess,
  } = useCreatePayroll();

  const { mutate: deletePayroll, isLoading: deleteLoading } =
    useDeletePayroll();

  const { exportToExcel } = useExportData();
  const { generateBankLetter } = useGenerateBankLetter();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isCreatePayrollSuccess) {
      notification.success({
        message: 'Payroll Generated',
        description: 'Payroll has been successfully generated.',
      });
    }
  }, [isCreatePayrollSuccess, payroll, employeeInfo]);

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
      const payrovallData = {
        payrollItems: allActiveSalary.map((item: any) => ({
          ...item,
          basicSalary: parseInt(item.basicSalary, 10),
        })),
      };
      createPayroll({ payperoid: payPeriodQuery, values: payrovallData });
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
      ? `?${queryParams.toString()}`
      : '';
    setSearchQuery(searchParams);
    refetch();
  };

  const handleExportPayroll = async () => {
    if (!payroll?.payrolls || payroll.payrolls.length === 0) {
      notification.error({
        message: 'No Data Available',
        description: 'There is no data available to export.',
      });
      return;
    }
    setLoading(true);
    try {
      await exportToExcel(payroll.payrolls, columns, 'Payroll Data');
    } catch (error) {
      notification.error({
        message: 'Error Exporting Data',
        description: 'An error occurred while exporting data.',
      });
    } finally {
      setLoading(false);
    }
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
      const flatData = employeeInfo.map((employee: any) => ({
        employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`,
        email: employee.email || '--',
        accountNumber:
          employee.employeeInformation?.bankInformation?.accountNumber || '--',
        bankName:
          employee.employeeInformation?.bankInformation?.bankName || '--',
        basicsalary: employee.basicSalaries?.length
          ? employee.basicSalaries.at(-1).basicSalary
          : '--',
      }));

      const exportColumns = [
        { header: 'Employee Name', key: 'employeeName', width: 50 },
        { header: 'Employee Email', key: 'email', width: 50 },
        { header: 'Account Number', key: 'accountNumber', width: 40 },
        { header: 'Bank Name', key: 'bankName', width: 30 },
        { header: 'Net Pay', key: 'basicsalary', width: 30 },
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
      await generateBankLetter(amount, payroll?.payrolls);
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
      render: (notused: any, record: any) => {
        return <EmployeeDetails empId={record?.employeeId} />;
      },
    },
    {
      title: 'Basic Salary',
      dataIndex: 'basicSalary',
      key: 'basicSalary',
      minWidth: 150,
      render: (notused: any, record: any) => {
        return <EmployeeBasicSalary id={record?.employeeId} />;
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
      title: 'Total Deduction',
      dataIndex: 'totalDeductions',
      key: 'totalDeductions',
      minWidth: 150,
      render: (key: string) => Number(key)?.toLocaleString(),
    },
    {
      title: 'Gross Income',
      dataIndex: 'grossSalary',
      key: 'grossSalary',
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
        Number(record.breakdown?.pension[0]?.amount)?.toLocaleString(),
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
      title: 'Net Income',
      dataIndex: 'netPay',
      key: 'netPay',
      minWidth: 150,
      render: (key: string) => Number(key || 0)?.toLocaleString(),
    },
  ];
  return (
    <div style={{ padding: '20px' }}>
      <div className="flex justify-between items-center gap-4">
        <h2 style={{ marginBottom: '20px' }}>Payroll</h2>
        <div className="flex gap-4">
          <Button
            type="default"
            className="text-white bg-violet-300 border-none p-6"
            onClick={handleExportBank}
          >
            Export Bank
          </Button>
          <Button
            type="default"
            className="text-white bg-violet-300 border-none p-6"
            onClick={() => {
              handleBankLetter(payroll?.totalNetPayAmount);
            }}
          >
            Bank Letter
          </Button>
          <Button
            type="default"
            className="text-white bg-violet-300 border-none p-6"
            onClick={handleExportPayroll}
          >
            Export Payroll
          </Button>

          <Popconfirm
            title="Are you sure you want to delete the payroll?"
            onConfirm={handleDeletePayroll}
            okText="Yes"
            cancelText="No"
            disabled={!(payroll?.payrolls.length > 0)}
          >
            <Button
              type="primary"
              className="p-6"
              onClick={
                payroll?.payrolls.length > 0 ? undefined : handleGeneratePayroll
              }
              loading={isCreatingPayroll || loading || deleteLoading}
              disabled={isCreatingPayroll || loading || deleteLoading}
            >
              {payroll?.payrolls.length > 0
                ? 'Delete Payroll'
                : 'Generate Payroll'}
            </Button>
          </Popconfirm>
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
          dataSource={payroll?.payrolls || []}
          columns={columns}
          pagination={{
            current: currentPage,
            pageSize: 6,
            onChange: setCurrentPage,
          }}
        />
      </div>
    </div>
  );
};

export default Payroll;
