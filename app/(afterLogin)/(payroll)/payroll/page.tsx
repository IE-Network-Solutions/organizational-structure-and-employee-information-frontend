'use client';
import React, { useEffect, useState } from 'react';
import { Table, Row, Button, notification, Spin, Space } from 'antd';
import Filters from './_components/filters';
import {
  useGetActivePayroll,
  useGetAllActiveBasicSalary,
} from '@/store/server/features/payroll/payroll/queries';
import { useCreatePayroll } from '@/store/server/features/payroll/payroll/mutation';
import { EmployeeDetails } from '../../(okrplanning)/okr/settings/criteria-management/_components/criteria-drawer';
import PayrollCard from './_components/cards';
import { useGetBasicSalaryById } from '@/store/server/features/employees/employeeManagment/basicSalary/queries';
import * as XLSX from 'xlsx';

export const EmployeeBasicSalary = ({ id }: { id: string }) => {
  const { isLoading, data, error } = useGetBasicSalaryById(id);
  if (isLoading) {
    return <Spin />;
  }
  if (error || !data) {
    return '--';
  }
  const employeeBasicSalary =
    data.find((item: any) => item.status)?.basicSalary || '--';
  return <Space size="small">{employeeBasicSalary}</Space>;
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

  useEffect(() => {
    if (isCreatePayrollSuccess) {
      notification.success({
        message: 'Payroll Generated',
        description: 'Payroll has been successfully generated.',
      });
    }
  }, [isCreatePayrollSuccess, payroll]);

  const [loading, setLoading] = useState(false);

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

  const exportToExcel = (data: any[], fileName: string) => {
    // Extract unique types for allowances, deductions, and merits
    const uniqueAllowances = Array.from(
      new Set(
        data.flatMap((item) =>
          item.breakdown.allowances.map((entry: any) => entry.type),
        ),
      ),
    );

    const uniqueDeductions = Array.from(
      new Set(
        data.flatMap((item) =>
          item.breakdown.deductions.map((entry: any) => entry.type),
        ),
      ),
    );

    const uniqueMerits = Array.from(
      new Set(
        data.flatMap((item) =>
          item.breakdown.merits.map((entry: any) => entry.type),
        ),
      ),
    );

    // Define headers dynamically
    const headers = [
      [
        'Employee Name',
        'Gross Salary',
        'Net Pay',
        ...uniqueAllowances.map((type) => `${type}`), // Allowance columns
        ...uniqueDeductions.map((type) => `${type}`), // Deduction columns
        ...uniqueMerits.map((type) => `${type}`), // Merit columns
        'Total Allowance',
        'Total Deductions',
        'Total Merit',
      ],
    ];

    // Map the payroll data to match the headers
    const rows = data.map((item) => {
      // Map allowances, deductions, and merits to their respective columns
      const allowanceMap = uniqueAllowances.reduce(
        (acc, type) => {
          acc[type] =
            item.breakdown.allowances.find((entry: any) => entry.type === type)
              ?.amount || '0.00';
          return acc;
        },
        {} as Record<string, string>,
      );

      const deductionMap = uniqueDeductions.reduce(
        (acc, type) => {
          acc[type] =
            item.breakdown.deductions.find((entry: any) => entry.type === type)
              ?.amount || '0.00';
          return acc;
        },
        {} as Record<string, string>,
      );

      const meritMap = uniqueMerits.reduce(
        (acc, type) => {
          acc[type] =
            item.breakdown.merits.find((entry: any) => entry.type === type)
              ?.amount || '0.00';
          return acc;
        },
        {} as Record<string, string>,
      );

      return [
        item.employeeId, // Employee Name
        item.grossSalary || '0.00', // Gross Salary
        item.netPay || '0.00', // Net Pay
        ...uniqueAllowances.map((type) => allowanceMap[type]), // Allowance values
        ...uniqueDeductions.map((type) => deductionMap[type]), // Deduction values
        ...uniqueMerits.map((type) => meritMap[type]), // Merit values
        item.totalAllowance || '0.00', // Total Allowance
        item.totalDeductions || '0.00', // Total Deductions
        item.totalMerit || '0.00', // Total Merit
      ];
    });

    // Combine headers and rows
    const worksheetData = [...headers, ...rows];

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Add column widths for better readability
    worksheet['!cols'] = [
      { wch: 25 }, // Employee Name
      { wch: 15 }, // Gross Salary
      { wch: 15 }, // Net Pay
      ...uniqueAllowances.map(() => ({ wch: 20 })), // Allowances
      ...uniqueDeductions.map(() => ({ wch: 20 })), // Deductions
      ...uniqueMerits.map(() => ({ wch: 20 })), // Merits
      { wch: 20 }, // Total Allowance
      { wch: 20 }, // Total Deductions
      { wch: 20 }, // Total Merit
    ];

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
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
      minWidth: 200,
      render: (notused: any, record: any) => {
        return <EmployeeBasicSalary id={record?.employeeId} />;
      },
    },
    {
      title: 'Total Allowance',
      dataIndex: 'totalAllowance',
      key: 'totalAllowance',
      minWidth: 200,
    },
    {
      title: 'Total Benefits',
      dataIndex: 'totalMerit',
      key: 'totalMerit',
      minWidth: 200,
    },
    {
      title: 'Total Deduction',
      dataIndex: 'totalDeductions',
      key: 'totalDeductions',
      minWidth: 200,
    },
    {
      title: 'Gross Income',
      dataIndex: 'grossSalary',
      key: 'grossSalary',
      minWidth: 200,
    },
    { title: 'Tax', dataIndex: 'tax', key: 'tax', minWidth: 200 },
    {
      title: 'Employee Pension',
      dataIndex: 'pension',
      key: 'pension',
      minWidth: 200,
    },
    {
      title: 'Cost Sharing',
      dataIndex: 'costsharing',
      key: 'costsharing',
      minWidth: 200,
    },
    {
      title: 'Net Income',
      dataIndex: 'netPay',
      key: 'netPay',
      minWidth: 200,
    },
  ];
  const handleExportPayroll = () => {
    exportToExcel(payroll?.payrolls, 'PayrollData');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div className="flex justify-between items-center gap-4">
        <h2 style={{ marginBottom: '20px' }}>Payroll</h2>
        <div className="flex gap-4">
          <Button
            type="default"
            className="text-white bg-violet-300 border-none p-6"
            onClick={handleExportPayroll}
          >
            Export Bank
          </Button>
          <Button
            type="default"
            className="text-white bg-violet-300 border-none p-6"
          >
            Bank Letter
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
            pageSize: 6,
            onChange: (page) => setCurrentPage(page),
          }}
          bordered
        />
      </div>
    </div>
  );
};

export default Payroll;
