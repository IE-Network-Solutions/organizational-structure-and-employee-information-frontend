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

  const handleExportPayroll = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll Data');

    worksheet.columns = [
      { header: 'Full Name', key: 'fullName', width: 40 },
      { header: 'Basic Salary', key: 'basicSalary', width: 30 },
      { header: 'Total Allowance', key: 'totalAllowance', width: 30 },
      { header: 'Total Benefits', key: 'totalBenefits', width: 30 },
      { header: 'Total Deduction', key: 'totalDeductions', width: 30 },
      { header: 'Gross Income', key: 'grossIncome', width: 30 },
      { header: 'Tax', key: 'tax', width: 30 },
      { header: 'Employee Pension', key: 'employeePension', width: 30 },
      { header: 'Cost Sharing', key: 'costSharing', width: 30 },
      { header: 'Net Income', key: 'netIncome', width: 30 },
    ];

    for (const item of payroll?.payrolls || []) {
      const basicSalary = <EmployeeBasicSalary id={item?.employeeId} />;
      worksheet.addRow({
        fullName: item?.employeeId,
        basicSalary,
        totalAllowance: item?.totalAllowance,
        totalBenefits: item?.totalMerit,
        totalDeductions: item?.totalDeductions,
        grossIncome: item?.grossSalary,
        tax: item?.tax,
        employeePension: item?.pension,
        costSharing: item?.costsharing,
        netIncome: item?.netPay,
      });
    }

    worksheet.getRow(1).font = { bold: true, size: 18 };
    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'payroll_data.xlsx';
    link.click();
  };
  const handleBankLetter = (amount: any) => {
    const dynamicData = {
      date: '16-01-2025',
      reference: 'IE/FIN/250116/001',
      bankName: 'Enat Bank',
      branch: 'Mexico Derartu Tulu branch',
      month: 'December 2024',
      amount: amount,
      amountWords:
        'five million three hundred fifty-five thousand nine hundred thirty-eight point five eight',
      accountNumber: '0061101660052002',
    };

    const bankLetterContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head><title>Bank Letter</title></head>
        <body>
          <p style="text-align: right;">P.O.Box 122321 Addis Ababa Ethiopia</p>
          <p style="text-align: right;">info@ienetworksolutions.com</p>
          <p style="text-align: right;">www.ienetworksolutions.com</p>
          <br/>
          <p>Date: ${dynamicData.date}</p>
          <p>Ref: ${dynamicData.reference}</p>
          <br/>
          <p>To: - ${dynamicData.bankName}</p>
          <p>${dynamicData.branch}</p>
          <p>Addis Ababa</p>
          <br/>
          <p><b>Subject:</b> ${dynamicData.month} Salary Transfer Request</p>
          <br/>
          <p>
            We hereby authorize your branch to transfer ETB ${dynamicData.amount} (${dynamicData.amountWords}) for the month of ${dynamicData.month} 
            for employee salary net payment listed in the attached table from our account to the respective account mentioned with the listed branch 
            of ${dynamicData.bankName}.
          </p>
          <p>
            Please deduct the transfer service charges from IE Network Solutions PLC account ${dynamicData.accountNumber} maintained at ${dynamicData.branch}.
          </p>
          <br/>
          <p>Sincerely</p>
          <br/><br/><br/>
          <p>IE Network Solutions PLC</p>
          <p>
            T: +251(0) 115 570544   |   M: +251(0) 911 511275 / +251(0) 911 210654 / +251(0) 930 105789   |   F: +251(0) 115 57 05 4
          </p>
        </body>
      </html>
    `;

    const blob = new Blob([bankLetterContent], {
      type: 'application/msword',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Bank_Letter.doc';
    link.click();
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
