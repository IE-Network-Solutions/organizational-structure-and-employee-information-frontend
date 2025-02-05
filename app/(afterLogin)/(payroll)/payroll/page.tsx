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
import { EmployeeDetails } from '../../(okrplanning)/okr/settings/criteria-management/_components/criteria-drawer';
import PayrollCard from './_components/cards';
import { useGetBasicSalaryById } from '@/store/server/features/employees/employeeManagment/basicSalary/queries';
import { useExportData } from './_components/excel';
import { useGenerateBankLetter } from './_components/Latter';
import PaySlip from './_components/payslip';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

const EmployeeBasicSalary = ({ id }: { id: string }) => {
  const { data, error } = useGetBasicSalaryById(id);
  if (error || !data) {
    return '--';
  }
  const employeeBasicSalary =
    data.find((item: any) => item.status)?.basicSalary || '--';
  return employeeBasicSalary;
};

const dummyData = {
  employeeName: 'John Doe',
  companyName: 'IE Networks',
  jobTitle: 'Software Engineer',
  dateHired: '2022-12-15',
  salaryPeriod: 30,
  tin: '75894565',
  location: 'Addis Ababa, Ethiopia',
  payDate: '2022-12-15',
  earnings: [
    { description: 'Basic Salary', amount: 'ETB 50000' },
    { description: 'Transport Allowance', amount: 'ETB 50000' },
    { description: 'Total Earning', amount: 'ETB 100000' },
  ],
  bonuses: [
    {
      description: 'Variable Pay',
      amount: 'ETB Yearly Bonus (Yearly Bonus/ Yearly Bonus)',
    },
    { description: 'Allowance', amount: 'ETB 2000' },
    { description: 'Exam Bonus', amount: 'ETB 1500' },
    { description: 'Implementation Effectiveness', amount: 'ETB 1500' },
    { description: 'Effective Order and Delivery', amount: 'ETB 1500' },
    { description: 'Closed Deal', amount: 'ETB 2500' },
    { description: 'Staff Performance Evaluation', amount: 'ETB 4000' },
    { description: 'Timely VAT Collection', amount: 'ETB 1500' },
    { description: 'Timely Payment Collection', amount: 'ETB 1500' },
    {
      description: 'Best Employee’s Productivity and Engagement',
      amount: 'ETB 1500',
    },
    {
      description: 'Facilities High Availability Quarterly',
      amount: 'ETB 1500',
    },
    { description: 'Management Performance Evaluation', amount: 'ETB 1500' },
    { description: 'Other Bonus', amount: 'ETB 26000' },
    { description: 'Total Earnings', amount: 'ETB 26000' },
  ],
  deduction: [
    { description: 'tax', amount: 'ETB 2000' },

    { description: 'Employee Pension', amount: 'ETB 2000' },
    { description: 'Medical', amount: 'ETB 1500' },
    { description: 'Absentisim', amount: 'ETB 1500' },
    { description: 'PMA', amount: 'ETB 1500' },
    { description: 'Car Maintenance', amount: 'ETB 2500' },
    { description: 'Gym', amount: 'ETB 4000' },
    { description: 'Late comer', amount: 'ETB 1500' },
    {
      description: 'Loan',
      amount: 'ETB 1500',
    },
    {
      description: 'Other Deduction',
      amount: 'ETB 1500',
    },
  ],
  paymentMethod: 'Bank',
  bankName: 'XYZ Bank',
  accountNumber: '1234567890',
};

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
  const [mergedPayroll, setMergedPayroll] = useState([]);

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
      console.log(
        '______________________mergedPayroll____________________--',
        mergedData,
        payroll,
        allEmployees,
      );
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
    if (bankLetter) exportTasks.push(handleBankLetter(10000));

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

  const employeeNameMap = employeeInfo?.reduce((acc: any, employee: any) => {
    acc[employee.employeeId] =
      `${employee.firstName || ''} ${employee.lastName || ''}`;
    return acc;
  }, {});

  const handleExportPayroll = async () => {
    // if (!payroll?.payrolls || payroll.payrolls.length === 0) {
    //   notification.error({
    //     message: 'No Data Available',
    //     description: 'There is no data available to export.',
    //   });
    //   return;
    // }

    setLoading(true);
    try {
      const flatPayrollData = payroll.payrolls.map((item: any) => ({
        fullName: employeeNameMap[item.employeeId] || '--',
        basicSalary: item.basicSalary || '--',
        totalAllowance: item.totalAllowance || '--',
        totalBenefits: item.totalBenefits || '--',
        totalDeduction: item.totalDeductions || '--',
        grossIncome: item.grossIncome || '--',
        tax: item.tax || '--',
        employeePension: item.employeePension || '--',
        costSharing: item.costSharing || '--',
        netIncome: item.netPay || '--',
      }));

      const exportColumns = [
        { header: 'Full Name', key: 'fullName', width: 50 },
        { header: 'Basic Salary', key: 'basicSalary', width: 30 },
        { header: 'Total Allowance', key: 'totalAllowance', width: 30 },
        { header: 'Total Benefits', key: 'totalBenefits', width: 30 },
        { header: 'Total Deduction', key: 'totalDeduction', width: 30 },
        { header: 'Gross Income', key: 'grossIncome', width: 30 },
        { header: 'Tax', key: 'tax', width: 30 },
        { header: 'Employee Pension', key: 'employeePension', width: 30 },
        { header: 'Cost Sharing', key: 'costSharing', width: 30 },
        { header: 'Net Income', key: 'netIncome', width: 30 },
      ];

      await exportToExcel(flatPayrollData, exportColumns, 'Payroll Data');
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
          dataSource={payroll?.payrolls || []}
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
          <div className="flex flex-col justify-between items-start gap-2 ">
            <span>Send Email for employees</span>
            <Switch checked={true} onChange={() => {}} />
          </div>
        </div>
      </Modal>
      <PaySlip data={dummyData} />
    </div>
  );
};

export default Payroll;
