'use client';
import React, { useEffect, useState } from 'react';
import { Table, Card, Row, Col, Button, notification } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
import Filters from './_components/filters';
import {
  useGetActivePayroll,
  useGetAllActiveBasicSalary,
} from '@/store/server/features/payroll/payroll/queries';
import { useCreatePayroll } from '@/store/server/features/payroll/payroll/mutation';
import { EmployeeDetails } from '../../(okrplanning)/okr/settings/criteria-management/_components/criteria-drawer';

const Payroll = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: payroll } = useGetActivePayroll();
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
  }, [isCreatePayrollSuccess]);

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
      createPayroll(allActiveSalary);
    } catch (error) {
      notification.error({
        message: 'Error Generating Payroll',
        description: 'An error occurred while generating payroll.',
      });
    } finally {
      setLoading(false);
    }
  };

  const cardData = [
    { title: 'Total Amount', value: '7,456,345 ETB', growth: '12.7%' },
    { title: 'Net Paid Amount', value: '4,000,345 ETB', growth: '12.7%' },
    { title: 'Total Allowance', value: '4,000,345 ETB', growth: '12.7%' },
    { title: 'Total Benefit', value: '4,000,345 ETB', growth: '12.7%' },
    { title: 'Total Deduction', value: '4,000,345 ETB', growth: '12.7%' },
  ];

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
      dataIndex: 'netPay',
      key: 'netPay',
      minWidth: 200,
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
      title: 'Company Pension',
      dataIndex: 'companypension',
      key: 'companypension',
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
      dataIndex: 'netincome',
      key: 'netincome',
      minWidth: 200,
    },
  ];

  const handleSearch = () => {};
  return (
    <div style={{ padding: '20px' }}>
      <div className="flex justify-between items-center gap-4">
        <h2 style={{ marginBottom: '20px' }}>Payroll</h2>
        <div className="flex gap-4">
          <Button
            type="default"
            className="text-white bg-violet-300 border-none p-6"
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
        {cardData.map((card, index) => (
          <Col
            key={index}
            style={{
              flex: '0 0 auto',
              minWidth: '350px',
            }}
            className="flex-none"
          >
            <Card bordered={false} className="bg-slate-100 my-4">
              <h3>{card.value}</h3>
              <p>{card.title}</p>
              <span style={{ color: 'green' }}>
                <ArrowUpOutlined /> {card.growth} ↑ vs last pay period
              </span>
            </Card>
          </Col>
        ))}
      </Row>
      <div className="overflow-x-auto scrollbar-none">
        <Table
          dataSource={payroll}
          columns={columns}
          pagination={{
            current: currentPage,
            pageSize: 8,
            total: 50,
            showSizeChanger: true,
            onChange: (page) => setCurrentPage(page),
          }}
          bordered
        />
      </div>
    </div>
  );
};

export default Payroll;
