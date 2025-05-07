import { Table, Select, Pagination, Divider, Form } from 'antd';
import { Card } from 'antd';
import React, { useEffect } from 'react';
import { FiChevronLeft } from 'react-icons/fi';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import dayjs from 'dayjs';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import { useEmployeeSettlementTracking } from '@/store/server/features/payroll/settlementTracking/queries';

const { Option } = Select;

const BenefitTracking = () => {
  const [form] = Form.useForm();
  const { data: payPeriodData } = useGetPayPeriod();
  const {
    setEmployeeBenefitData,
    employeeBenefitData,
    detailCurrentPage,
    setDetailCurrentPage,
    detailPageSize,
    setDetailPageSize,
  } = useBenefitEntitlementStore();

  const handleBackData = () => {
    setEmployeeBenefitData(null);
  };

  const { data: payPeriods, isLoading: payLoading } = useGetPayPeriod();
  const compensationItemEntitlementId =
    employeeBenefitData?.id ||
    employeeBenefitData?.[0]?.compensationItemEntitlementId;
  const userId =
    employeeBenefitData?.userId ||
    employeeBenefitData?.[0]?.compensationItemEntitlement?.employeeId;

  const { data: employeeEntitlementData, isLoading } =
    useEmployeeSettlementTracking(compensationItemEntitlementId, userId);

  const settlementTracking = employeeEntitlementData?.settlementTracking || [];

  // Pagination logic
  const startIndex = (detailCurrentPage - 1) * detailPageSize;
  const endIndex = startIndex + detailPageSize;
  const paginatedTracking = settlementTracking.slice(startIndex, endIndex);

  useEffect(() => {
    const formattedData = paginatedTracking.map((benefit: any) => ({
      mode: benefit.mode || undefined,
      userId: benefit.userId,
      payPeriodId: benefit.payPeriodId || undefined,
    }));
    form.setFieldsValue({ benefits: formattedData });
  }, [paginatedTracking, form]);

  const periods =
    payPeriodData?.filter((item: any) =>
      settlementTracking.map((st: any) => st.payPeriodId).includes(item.id),
    ) ?? [];

  const startDates = periods.map((p: any) => new Date(p.startDate).getTime());
  const endDates = periods.map((p: any) => new Date(p.endDate).getTime());

  const earliestStart = startDates.length
    ? new Date(Math.min(...startDates)).toLocaleDateString()
    : '';
  const latestEnd = endDates.length
    ? new Date(Math.max(...endDates)).toLocaleDateString()
    : '';

  return (
    <Card
      bodyStyle={{ padding: 0 }}
      title={
        <div className="flex items-center gap-3 cursor-pointer">
          <FiChevronLeft onClick={handleBackData} size={20} />
          {employeeEntitlementData?.compensationItem?.name}
        </div>
      }
      loading={isLoading}
      className="px-4 max-w-5xl mx-auto bg-white"
    >
      <div className="grid gap-4 text-sm my-3">
        <div className="grid grid-cols-2 items-center gap-2">
          <span className="text-gray-500">Full Name</span>
          <div className="font-medium">
            <EmployeeDetails empId={employeeEntitlementData?.employeeId} />
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <span className="text-gray-500">Total Amount Take</span>
          <div className="font-medium">
            {Number(
              settlementTracking.reduce(
                (acc: any, item: any) => acc + (Number(item.amount) || 0),
                0,
              ) || 0,
            )?.toLocaleString()}
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <span className="text-gray-500">Expected pay per period</span>
          <div className="font-medium">
            {Number(
              settlementTracking.find((item: any) => item.isPaid === false)
                ?.amount || 0,
            )?.toLocaleString()}
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <span className="text-gray-500">Period</span>
          <div className="font-medium">
            {dayjs(earliestStart).format('MMM DD, YYYY')} -{' '}
            {dayjs(latestEnd).format('MMM DD, YYYY')}
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <span className="text-gray-500">Total paid amount</span>
          <div className="text-green-600 font-medium">
            {Number(
              settlementTracking
                .filter((item: any) => item.isPaid === true)
                .reduce(
                  (acc: any, item: any) => acc + (Number(item.amount) || 0),
                  0,
                ) || 0,
            )?.toLocaleString()}
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <span className="text-gray-500">Remaining amount</span>
          <div className="text-yellow-500 font-medium">
            {Number(
              settlementTracking
                .filter((item: any) => item.isPaid === false)
                .reduce(
                  (acc: any, item: any) => acc + (Number(item.amount) || 0),
                  0,
                ) || 0,
            )?.toLocaleString()}
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
                  render: (notused, notuseds, index) => (
                    <Form.Item name={[index, 'createdAt']} className="mb-0">
                      <span>
                        {dayjs(paginatedTracking?.[index]?.createdAt).format(
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
                  render: (notused, notuseds, index) => (
                    <Form.Item name={[index, 'amount']} className="mb-0">
                      <span>
                        {Number(
                          paginatedTracking?.[index]?.amount,
                        )?.toLocaleString()}
                      </span>
                    </Form.Item>
                  ),
                },
                {
                  title: 'Pay Period',
                  dataIndex: 'payPeriodId',
                  key: 'payPeriodId',
                  render: (notused, notuseds, index) => (
                    <Form.Item
                      name={[index, 'payPeriodId']}
                      className="mb-0 w-60"
                    >
                      <Select
                        placeholder="Select Period"
                        allowClear
                        className="w-60"
                        loading={payLoading}
                        disabled={paginatedTracking?.[index]?.isPaid}
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

      <div className="flex justify-between items-center my-6">
        <Pagination
          current={detailCurrentPage}
          total={settlementTracking.length}
          pageSize={detailPageSize}
          onChange={(page) => setDetailCurrentPage(page)}
          showSizeChanger={false}
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show</span>
          <Select
            value={detailPageSize.toString()}
            size="small"
            className="w-16"
            onChange={(value) => {
              setDetailPageSize(Number(value));
              setDetailCurrentPage(1); // reset to first page when pageSize changes
            }}
          >
            <Option value="5">5</Option>
            <Option value="10">10</Option>
            <Option value="20">20</Option>
            <Option value="20">50</Option>
            <Option value="20">10</Option>
          </Select>
        </div>
      </div>
    </Card>
  );
};

export default BenefitTracking;
