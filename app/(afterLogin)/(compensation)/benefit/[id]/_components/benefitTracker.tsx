import { Table, Select, Pagination, Divider, Form } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Card } from 'antd';
import React, { useEffect } from 'react';
import { FiChevronLeft } from 'react-icons/fi';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import dayjs from 'dayjs';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';

const { Option } = Select;

interface PaymentData {
  key: string;
  date: string;
  amount: string;
  payPeriod: string;
}
const BenefitTracking = () => {
  const [form] = Form.useForm();

  const { setEmployeeBenefitData, employeeBenefitData } =
    useBenefitEntitlementStore();
  const handleBackData = () => {
    setEmployeeBenefitData(null);
  };
  const { data: payPeriods, isLoading: payLoading } = useGetPayPeriod();

  useEffect(() => {
    if (employeeBenefitData?.length) {
      const formattedData = employeeBenefitData.map((benefit: any) => ({
        amount: benefit.amount ? Number(benefit.amount) : undefined,
        mode: benefit.mode || undefined,
        userId: benefit.userId,
        payPeriodId: benefit.payPeriodId || undefined,
        // Add other fields as needed
      }));
      form.setFieldsValue({ benefits: formattedData });
    }
  }, [employeeBenefitData, form]);
  console.log(employeeBenefitData, 'employeeBenefitData');
  return (
    <Card
      bodyStyle={{ padding: 0 }}
      title={
        <div className="flex items-center gap-3 cursor-pointer">
          <FiChevronLeft onClick={() => handleBackData()} size={20} />
          Loan Tracking
        </div>
      }
      className="px-4 max-w-5xl mx-auto bg-white"
    >
      <div className="grid  gap-4 text-sm my-3">
        <div className="grid grid-cols-2 items-center gap-2">
          <span className="text-gray-500">Full Name</span>
          <div className="font-medium">
            <EmployeeDetails
              empId={
                employeeBenefitData?.userId ||
                employeeBenefitData[0]?.compensationItemEntitlement?.employeeId
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <span className="text-gray-500">Total Amount Take</span>
          <div className="font-medium">
            {employeeBenefitData
              ?.filter((item: any) => item.isPaid === true)
              .reduce(
                (acc: any, item: any) => acc + (Number(item.amount) || 0),
                0,
              ) || 0}
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <span className="text-gray-500">Expected pay per period</span>
          <div className="font-medium">
            {employeeBenefitData.reduce(
              (acc: any, item: any) => acc + (Number(item.amount) || 0),
              0,
            ) || 0}
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <span className="text-gray-500">Period</span>
          <div className="font-medium">-</div>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <span className="text-gray-500">Total paid amount</span>
          <div className="text-green-600 font-medium">10,000</div>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <span className="text-gray-500">Remaining amount</span>
          <div className="text-yellow-500 font-medium">
            {employeeBenefitData
              ?.filter((item: any) => item.isPaid === false)
              .reduce(
                (acc: any, item: any) => acc + (Number(item.amount) || 0),
                0,
              ) || 0}
          </div>
        </div>
      </div>
      <Divider className="my-4" />

      <h3 className="text-sm font-light mb-2">Paid Back</h3>
      <Form form={form} layout="vertical">
        <Form.List name="benefits">
          {(fields) => (
            <Table
              dataSource={fields}
              columns={[
                {
                  title: 'Date',
                  dataIndex: 'date',
                  key: 'date',
                  render: (_, __, index) => (
                    <Form.Item name={[index, 'createdAt']} className="mb-0">
                      <span>
                        {dayjs(employeeBenefitData?.[index]?.createdAt).format(
                          'MMM DD, YYYY',
                        )}
                      </span>
                    </Form.Item>
                  ),
                },
                {
                  title: 'Paid Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: (_, __, index) => (
                    <Form.Item name={[index, 'amount']} className="mb-0">
                      <span>{employeeBenefitData?.[index]?.amount}</span>
                    </Form.Item>
                  ),
                },
                {
                  title: 'Pay Period',
                  dataIndex: 'payPeriodId',
                  key: 'payPeriodId',
                  render: (_, __, index) => (
                    <Form.Item
                      name={[index, 'payPeriodId']}
                      className="mb-0 w-60"
                    >
                      <Select
                        placeholder="Select Period"
                        allowClear
                        className="w-60"
                        loading={payLoading}
                      >
                        {payPeriods?.map((period: any) => (
                          <Option key={period.id} value={period.id}>
                            {dayjs(period.startDate).format('MMM DD, YYYY')} –{' '}
                            {dayjs(period.endDate).format('MMM DD, YYYY')}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  ),
                },
              ]}
              pagination={false}
              rowKey={(field) => field.key}
            />
          )}
        </Form.List>
      </Form>

      <div className="flex justify-between items-center mb-4">
        <Pagination
          current={1}
          total={50}
          pageSize={8}
          showSizeChanger={false}
          showQuickJumper={false}
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show</span>
          <Select defaultValue="8" size="small" className="w-16">
            <Option value="8">8</Option>
            <Option value="10">10</Option>
            <Option value="20">20</Option>
          </Select>
        </div>
      </div>
    </Card>
  );
};

export default BenefitTracking;
