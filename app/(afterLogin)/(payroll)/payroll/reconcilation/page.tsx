'use client';

import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { usePayrollStore } from '@/store/uistate/features/payroll/payroll';
import { Button, Card, Col, Row, Select, Table } from 'antd';
import { PiExportLight } from 'react-icons/pi';

const PayrollReconcilation = () => {
  const columns = [
    {
      title: 'Types',
      dataIndex: 'types',
      key: 'types',
      minWidth: 200,
      render: (notused: any, record: any) => (
        <div className="flex items-center gap-2">
          <span>{record.types}</span>
        </div>
      ),
    },
    {
      title: 'Previous',
      dataIndex: 'previous',
      key: 'previous',
      minWidth: 150,
      render: (notused: any, record: any) => {
        const previous = record.previous || '--';
        return <span>{previous}</span>;
      },
    },
    {
      title: 'Current',
      dataIndex: 'current',
      key: 'current',
      minWidth: 150,
      render: (nonused: any, record: any) => {
        const current = record.current || '--';
        return <span>{current}</span>;
      },
    },

    {
      title: 'Variance(AMT)',
      dataIndex: 'variance',
      key: 'variance',
      minWidth: 150,
      render: (key: string) => Number(key)?.toLocaleString(),
    },
    {
      title: 'Variance(%)',
      dataIndex: 'variancePercentage',
      key: 'variancePercentage',
      minWidth: 150,
      render: (key: string) => Number(key)?.toLocaleString(),
    },
    {
      title: 'Impact',
      dataIndex: 'impact',
      key: 'impact',
      minWidth: 150,
      render: (notused: any, record: any) => record.impact || '--',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      minWidth: 150,
      render: (notused: any, record: any) => (
        <div className="flex items-center gap-2">
          <span>{record.action}</span>
        </div>
      ),
    },
  ];

  const payrollVarianceData = [
    {
      key: '1',
      types: 'Basic Salary',
      previous: '6,900,000',
      current: '8,900,000',
      variance: 2000000,
      variancePercentage: 12.7,
      impact: 'Increase due to new hires',
      action: 'View Details',
    },
    {
      key: '2',
      types: 'Overtime Payment',
      previous: '450,000',
      current: '520,000',
      variance: 70000,
      variancePercentage: 15.5,
      impact: 'High OT hours',
      action: 'View Details',
    },
    {
      key: '3',
      types: 'Allowances',
      previous: '1,200,000',
      current: '1,260,000',
      variance: 60000,
      variancePercentage: 5,
      impact: 'Minor adjustment',
      action: 'View Details',
    },
    {
      key: '4',
      types: 'Benefits',
      previous: '800,000',
      current: '820,000',
      variance: 20000,
      variancePercentage: 2.5,
      impact: '--',
      action: 'View Details',
    },
    {
      key: '5',
      types: 'Deductions',
      previous: '300,000',
      current: '280,000',
      variance: -20000,
      variancePercentage: -6.6,
      impact: 'Reduction in penalties',
      action: 'View Details',
    },
  ];

  return (
    <div
      className="min-h-screen w-full px-3 sm:px-6 "
      id="manage-employees-page"
      data-cy="manage-employees-page"
    >
      <BlockWrapper className="h-auto w-full bg-white">
        <div
          className="flex flex-wrap justify-between items-center"
          id="manage-employees-header"
          data-cy="manage-employees-header"
        >
          <CustomBreadcrumb
            title="Payroll Reconciliation"
            subtitle="Employee Payroll Reconciliation"
          />

          <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
            <Button
              type="primary"
              size="large"
              className="h-10 w-10 sm:w-auto"
              icon={<PiExportLight />}
            >
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
        <Row gutter={[16, 16]} align="middle" className="mb-6">
          <Col xs={24} sm={24} md={4} lg={4} xl={4}>
            <Select
              allowClear
              className="min-h-12 w-full"
              placeholder="Current Pay Period"
            />
          </Col>
          <Col xs={24} sm={24} md={4} lg={4} xl={4}>
            <div>
              <Select
                placeholder="Previous Pay Period"
                allowClear
                style={{ width: '100%', height: '48px' }}
              ></Select>
            </div>
          </Col>
        </Row>

        <div className="flex 2xl:grid 2xl:grid-cols-3 gap-12">
          {/* Total Payroll Cost */}
          <Card className="rounded-xl shadow-sm border">
            <p className="text-gray-500 text-sm mb-2">Total Payroll Cost</p>
            <p className="text-2xl font-semibold text-gray-900">
              ETB 8,900,000
            </p>

            <p className="text-sm text-gray-500 mt-3">
              Previous: <span className="font-semibold">6,900,000</span>
            </p>
          </Card>
          {/* Net Variance */}
          <Card className="rounded-xl shadow-sm border">
            <p className="text-gray-500 text-sm mb-2">Net Variance</p>
            <p className="text-2xl font-semibold text-gray-900">
              + ETB 8,900,000
            </p>

            <p className="text-sm text-red-500 mt-3">12.7 ↑ Increase +3.03%</p>
          </Card>
          {/* Headcount Impact */}
          <Card className="rounded-xl shadow-sm border">
            <p className="text-gray-500 text-sm mb-2">Headcount Impact</p>
            <p className="text-2xl font-semibold text-gray-900">
              150 Employees
            </p>

            <div className="flex gap-4 text-sm mt-3 text-gray-500">
              <p>
                Previous: <span className="font-semibold">130</span>
              </p>
              <p>
                Terminations: <span className="font-semibold">3</span>
              </p>
            </div>
          </Card>
        </div>

        <div className="w-full mt-6">
          <Table
            dataSource={payrollVarianceData}
            columns={columns}
            pagination={false}
          />
        </div>
      </BlockWrapper>
    </div>
  );
};

export default PayrollReconcilation;
