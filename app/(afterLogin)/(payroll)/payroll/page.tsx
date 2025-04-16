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
} from 'antd';
import { Workbook } from 'exceljs';
import Filters from './_components/filters';
import {
  useGetActivePayroll,
  useGetAllActiveBasicSalary,
  useGetEmployeeInfo,
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
import { useGetAllUsersData } from '@/store/server/features/employees/employeeManagment/queries';
import { PaySlipData } from '@/store/server/features/payroll/payroll/interface';
import { useExportData } from './_components/excel';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
const Payroll = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportBank, setExportBank] = useState(true);
  const [bankLetter, setBankLetter] = useState(true);
  const [paySlip, setPaySlip] = useState(false);
  const [exportPayrollData, setExportPayrollData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [payPeriodQuery, setPayPeriodQuery] = useState('');
  const [payPeriodId, setPayPeriodId] = useState('');
  const { data: payroll, refetch } = useGetActivePayroll(searchQuery);
  const { data: employeeInfo } = useGetEmployeeInfo();
  const { data: allActiveSalary } = useGetAllActiveBasicSalary();
  const { data: allEmployees } = useGetAllUsersData();

  const { mutate: createPayroll, isLoading: isCreatingPayroll } =
    useCreatePayroll();

  const { mutate: sendPaySlip, isLoading: sendingPaySlipLoading } =
    useSendingPayrollPayslip();

  const { generateBankLetter } = useGenerateBankLetter();
  const { exportToExcel } = useExportData();

  const [loading, setLoading] = useState(false);
  const [mergedPayroll, setMergedPayroll] = useState<any>([]);
  const { mutate: deletePayroll, isLoading: deleteLoading } =
    useDeletePayroll();

  useEffect(() => {
    if (payroll?.payrolls && allEmployees?.items) {
      const mergedData = payroll?.payrolls.map((pay: any) => {
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

    if (exportTasks.length === 0) {
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
          employeeName: `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''}`,
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

    console.log(values,"1******************")
    return console.log(values,"2******************")

    sendPaySlip({ values });
  };
  const handleDeductionExportPayroll = async () => {
    if (!mergedPayroll || mergedPayroll.length === 0) {
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

      const exportColumns = [
        { type: 'Basic Salary', key: 'basicSalary' },
        { type: 'Transport Allowance', key: 'transportAllowance' },
        { type: 'Taxable Transport', key: 'taxableTransport' },
        // { type: 'Total Allowance', key: 'totalAllowance' },
        { type: 'Total Award', key: 'totalBenefits' },
        { type: 'Gross Salary', key: 'grossIncome' },
        { type: 'Taxable Income', key: 'taxableIncome' },

        { type: 'Tax', key: 'tax' },
        { type: 'Total Deduction', key: 'totalDeduction' },
        { type: 'Employee Pension', key: 'employeePension' },
        { type: 'Company Pension', key: 'companyPesnion' },
        // { type: 'Total Deduction', key: 'totalDeduction' },
        // { type: 'Variable Pay', key: 'variablePay' },
        // { type: 'Gross Income', key: 'grossIncome' },
        { type: 'Net Income', key: 'netIncome' },
      ];
      const columnHeaderMap = new Map<string, string>(
        exportColumns.map((col) => [col.key, col.type]),
      );
      exportColumns.forEach((col) => uniquePayrollColumns.add(col.key));
      mergedPayroll.forEach((item: any) => {
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

      mergedPayroll.forEach((item: any) => {
        const fullName =
          `${item.employeeInfo?.firstName || ''} ${item.employeeInfo?.middleName || ''} ${item.employeeInfo?.lastName || ''}`.trim() ||
          '--';
        const basicSalary =
          item.employeeInfo?.basicSalaries?.find((bs: any) => bs.status)
            ?.basicSalary || 0;
        const tax = item.breakdown?.tax?.amount
          ? item.breakdown.tax.amount.toFixed(2)
          : '0.0';

        const deductions = item.breakdown?.totalDeductionWithPension || [];
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
          basicSalary: Number(basicSalary).toFixed(2),
          transportAllowance: Number(transportAllowance).toFixed(2),
          taxableTransport: Number(taxableTransport).toFixed(2),
          totalBenefits: Number(totalBenefits || 0).toFixed(2),
          grossIncome: Number(item.grossSalary || 0).toFixed(2),

          taxableIncome: Number(item.grossSalary - 600 || 0).toFixed(2),
          tax,
          totalDeduction: Number(item.totalDeductions || 0).toFixed(2),
          employeePension: Number(
            item.breakdown?.pension?.find((i: any) => i.type == 'Pension')
              ?.amount || 0,
          ).toFixed(2),
          companyPesnion: Number(
            item.breakdown?.pension?.find(
              (i: any) => i.type == 'CompanyContribution',
            )?.amount || 0,
          ).toFixed(2),

          // totalAllowance: Number(item.totalAllowance || 0).toFixed(2),
          // variablePay: Number(item.breakdown?.variablePay?.amount || 0).toFixed(
          //   2,
          // ),
          netIncome: Number(item.netPay || 0).toFixed(2),
        };

        const deductionRow: any = {
          fullName,
          totalDeductions: payrollRowData.totalDeduction,
        };
        const allowanceRow: any = {
          fullName,
          totalAllowances: payrollRowData.totalAllowance,
        };
        const meritRow: any = {
          fullName,
          totalMerits: payrollRowData.totalBenefits,
        };

        // **Ensure every row has all expected unique columns**
        uniqueDeductionTypes.forEach((type: any) => {
          const deduction = deductions.find((d: any) => d.type === type);
          deductionRow[type] = deduction
            ? Number(deduction.amount).toFixed(2)
            : '0.00';
        });

        uniqueAllowanceTypes.forEach((type) => {
          const allowance = allowances.find((a: any) => a.type === type);
          allowanceRow[type] = allowance
            ? Number(allowance.amount).toFixed(2)
            : '0.00';
        });

        uniqueMeritTypes.forEach((type) => {
          const merit = merits.find((m: any) => m.type === type);
          meritRow[type.replace(/\s+/g, '').toLowerCase()] = merit
            ? Number(merit.amount).toFixed(2)
            : '0.00';
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
            minWidth: 12, // Ensure readable width
          })),
          ...(sheetName !== 'Payrolls'
            ? [{ header: `Total ${sheetName}`, key: totalKey, minWidth: 18 }]
            : []),
        ];

        // **Set Column Width Dynamically**
        sheet.columns = headers.map((col) => ({
          header: col.header,
          key: col.key,
          width: Math.max(col.header.length + 2, col.minWidth || 10), // Ensure a minimum width
        }));

        // **Add Data Rows**
        data.forEach((row) => sheet.addRow(row));

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


  console.log(mergedPayroll.length , payroll?.payrolls?.length,"*******************")

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

  return (
    <div style={{ padding: '20px' }}>
      <div className="flex justify-between items-center gap-4 scrollbar-none">
        <h2 className="text-3xl mb-7">Payroll</h2>
        <h2 hidden style={{ marginBottom: '20px' }}>
          {payPeriodQuery}
        </h2>

        <div className="flex gap-4  mb-7">
          <AccessGuard permissions={[Permissions.PayrollExport]}>
            <Button
              className="text-[#3636F0] bg-[#B2B2FF] border-none p-6"
              onClick={() => setIsModalOpen(true)}
            >
              Export
            </Button>
          </AccessGuard>

          <AccessGuard permissions={[Permissions.SendPayslipEmail]}>
            <Popconfirm
              title="Send Payslips"
              description={
                <div>
                  {mergedPayroll.length > 0 ? (
                    mergedPayroll.length < allEmployees?.items?.length ? (
                      <p>This will send payslips to {mergedPayroll.length} selected employees (filtered from {allEmployees?.items?.length} total).</p>
                    ) : (
                      <p>This will send payslips to ALL {allEmployees?.items?.length} employees.</p>
                    )
                  ) : (
                    <p style={{ color: 'red', marginTop: '8px' }}>
                      No employees selected. Please adjust your filters.
                    </p>
                  )}
                  {mergedPayroll.length > 0 && mergedPayroll.length < allEmployees?.items?.length && (
                    <p style={{ color: 'orange', marginTop: '8px' }}>
                      Note: You're sending to a filtered subset. Clear filters to send to everyone.
                    </p>
                  )}
                </div>
              }
              okText={
                mergedPayroll.length === 0 ? "Cannot Send" : 
                mergedPayroll.length < allEmployees?.items?.length ? "Send to Filtered" : "Send to All"
              }
              cancelText="Cancel"
              onConfirm={() => {
                if (mergedPayroll.length > 0) {
                  sendingPaySlipHandler(mergedPayroll);
                }
              }}
              okButtonProps={{
                disabled: mergedPayroll.length === 0
              }}
            >
              <Button
                type="default"
                loading={sendingPaySlipLoading}
                className="text-white bg-primary border-none p-6"
                disabled={mergedPayroll.length === 0}
              >
                {mergedPayroll.length === 0 ? "No Employees Selected" : 
                mergedPayroll.length < allEmployees?.items?.length ? `Send to ${mergedPayroll.length} Filtered` : "Send to All"}
              </Button>
            </Popconfirm>
          </AccessGuard>
          <Popconfirm
            title={
              payroll?.payrolls.length
                ? 'Are you sure you want to regenerate the payroll ?'
                : 'Are you sure you want to generate the payroll ?'
            }
            onConfirm={handleDeletePayroll}
            okText="Yes"
            cancelText="No"
            disabled={!(payroll?.payrolls.length > 0)}
          >
            <AccessGuard
              permissions={[
                Permissions.GeneratePayroll,
                Permissions.DeletePayroll,
              ]}
            >
              <Button
                type="primary"
                className="p-6"
                onClick={()=>{
                  handleGeneratePayroll()
                }}
                // onClick={
                //   payroll?.payrolls.length > 0
                //     ? undefined
                //     : handleGeneratePayroll
                // }
                loading={isCreatingPayroll || loading || deleteLoading}
                // disabled={isCreatingPayroll || loading || deleteLoading}
              >
                {payroll?.payrolls.length > 0 ? 'Regenerate' : 'Generate'}
              </Button>
            </AccessGuard>
          </Popconfirm>
        </div>
      </div>

      <Filters onSearch={handleSearch} oneRow={true} />
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
            disabled={!bankLetter || loading}
            loading={loading}
          >
            Export
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-5 m-6">
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
              disabled
              checked={paySlip}
              onChange={() => setPaySlip(!paySlip)}
            />
          </div>

          <div className="flex flex-col justify-between items-start gap-2 ">
            <span>Export Bank</span>
            <Switch
              checked={bankLetter}
              onChange={() => setExportBank(!exportBank)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Payroll;
