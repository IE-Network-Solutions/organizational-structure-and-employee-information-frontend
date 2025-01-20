'use client';
import React, { useEffect, useState } from 'react';
import { Table, Row, Button, notification } from 'antd';
import Filters from './_components/filters';
import {
  useGetActivePayroll,
  useGetAllActiveBasicSalary,
} from '@/store/server/features/payroll/payroll/queries';
import { useCreatePayroll } from '@/store/server/features/payroll/payroll/mutation';
import { EmployeeDetails } from '../../(okrplanning)/okr/settings/criteria-management/_components/criteria-drawer';
import PayrollCard from './_components/cards';
import { useGetBasicSalaryById } from '@/store/server/features/employees/employeeManagment/basicSalary/queries';
import * as ExcelJS from 'exceljs';
import { useExportData } from './_components/excel';
import { useGenerateBankLetter } from './_components/Latter';

const EmployeeBasicSalary = ({ id }: { id: string }) => {
  const { data, error } = useGetBasicSalaryById(id);
  if (error || !data) {
    return '--';
  }
  const employeeBasicSalary =
    data.find((item: any) => item.status)?.basicSalary || '--';
  return employeeBasicSalary;
};

const Payroll = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: payroll, refetch } = useGetActivePayroll(searchQuery);

  const { data: allActiveSalary } = useGetAllActiveBasicSalary();

  const {
    mutate: createPayroll,
    isLoading: isCreatingPayroll,
    isSuccess: isCreatePayrollSuccess,
  } = useCreatePayroll();

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
  }, [isCreatePayrollSuccess, payroll]);

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
      const payrollData = {
        payrollItems: allActiveSalary.map((item: any) => ({
          ...item,
          basicSalary: parseInt(item.basicSalary, 10),
        })),
      };
      createPayroll(payrollData);
    } catch (error) {
      notification.error({
        message: 'Error Generating Payroll',
        description: 'An error occurred while generating payroll.',
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
    if (searchValues?.yearId) {
      queryParams.append('yearId', searchValues.yearId);
    }
    if (searchValues?.sessionId) {
      queryParams.append('sessionId', searchValues.sessionId);
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
    { title: 'Tax', dataIndex: 'tax', key: 'tax', minWidth: 150 },
    {
      title: 'Employee Pension',
      dataIndex: 'pension',
      key: 'pension',
      minWidth: 150,
    },
    {
      title: 'Cost Sharing',
      dataIndex: 'costsharing',
      key: 'costsharing',
      minWidth: 150,
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
      <div className="flex justify-between items-center gap-4">
        <h2 style={{ marginBottom: '20px' }}>Payroll</h2>
        <div className="flex gap-4">
          <Button
            type="default"
            className="text-white bg-violet-300 border-none p-6"
            onClick={() => {}}
          >
            Export Bank
          </Button>
          <Button
            type="default"
            className="text-white bg-violet-300 border-none p-6"
            onClick={() => {
              handleBankLetter(payroll?.totalGrossPaymentAmount);
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
          dataSource={payroll?.payrolls || []}
          columns={columns}
          pagination={{
            current: currentPage,
            pageSize: 10,
            onChange: setCurrentPage,
          }}
        />
      </div>
    </div>
  );
};

export default Payroll;
