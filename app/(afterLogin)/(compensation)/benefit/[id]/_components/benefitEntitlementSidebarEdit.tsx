'use client';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Form, Input, InputNumber, Select, Spin, Table } from 'antd';
import { useUpdatedBenefitEntitlementSettlement } from '@/store/server/features/compensation/benefit/mutations';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useEffect } from 'react';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useEmployeeSettlementTracking } from '@/store/server/features/payroll/settlementTracking/queries';
import NotificationMessage from '@/components/common/notification/notificationMessage';

dayjs.extend(isBetween);

const { Option } = Select;

type BenefitEntitlementProps = {
  title: string;
};

const BenefitEntitlementSideBarEdit = ({ title }: BenefitEntitlementProps) => {
  const {
    isBenefitEntitlementSidebarUpdateOpen,
    benefitData,
    setIsBenefitEntitlementSidebarUpdateOpen,
    totalAmount,
    setTotalAmount,
    settlementPeriod,
    setSettlementPeriod,
    data,
    setData,
  } = useBenefitEntitlementStore();

  const { mutate: updateBenefitEntitlement, isLoading: updateBenefitLoading } =
    useUpdatedBenefitEntitlementSettlement();
  const { data: employeeEntitlementData, isLoading } =
    useEmployeeSettlementTracking(benefitData?.id, benefitData?.userId);
  const { data: allUsers, isLoading: allUserLoading } = useGetAllUsers();
  const [form] = Form.useForm();

  const { data: payPeriods, isLoading: payLoading } = useGetPayPeriod();

  const onClose = () => {
    form.resetFields();
    setData([]);
    setIsBenefitEntitlementSidebarUpdateOpen(false);
  };

  const onFormSubmit = (formValues: any) => {
    const paymentAmount = formValues.payments.reduce(
      (acc: number, item: { amount?: number }) =>
        acc + Number(item.amount || 0),
      0,
    );
    const totalAmountChecker = totalAmount == paymentAmount;
    if (totalAmountChecker == false) {
      NotificationMessage.warning({
        message: `Total Amount should be equal to the sum of all payments. total amount ${totalAmount} and payment amount ${paymentAmount}`,
      });
    } else {
      updateBenefitEntitlement(
        { payments: formValues?.payments, id: employeeEntitlementData?.id },
        {
          onSuccess: () => {
            form.resetFields();
            onClose();
          },
        },
      );
    }
  };

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-14',
      size: 'large',
      loading: updateBenefitLoading,
      onClick: () => onClose(),
    },
    {
      label: <span>Update</span>,
      key: 'create',
      className: 'h-14',
      type: 'primary',
      size: 'large',
      loading: updateBenefitLoading,
      onClick: () => form.submit(),
    },
  ];

  useEffect(() => {
    const payments = employeeEntitlementData?.settlementTracking.map(
      (entry: any) => ({
        amount: parseFloat(entry.amount),
        payPeriodId: entry.payPeriodId || null,
        isPaid: entry.isPaid,
        id: entry.id,
      }),
    );
    const totalAmount = (
      employeeEntitlementData?.settlementTracking || []
    ).reduce(
      (acc: number, item: { amount?: number }) =>
        acc + Number(item.amount || 0),
      0,
    );
    setTotalAmount(totalAmount);
    setSettlementPeriod(
      Number(employeeEntitlementData?.settlementTracking?.length) || 0,
    );
    form.setFieldsValue({
      payments,
      userId: employeeEntitlementData?.employeeId,
    });
    setData(payments);
  }, [employeeEntitlementData, form, isLoading]);

  const columns = [
    {
      dataIndex: 'amount',
      key: 'amount',
      render: (notused: any, record: any, index: number) => (
        <>
          <Form.Item
            label={'Amount'}
            name={['payments', index, 'amount']}
            className="mb-0"
          >
            <InputNumber className="w-full" disabled={record?.isPaid} />
          </Form.Item>
          <Form.Item name={['payments', index, 'id']} className="mb-0" hidden>
            <Input className="w-full" value={record.id} />
          </Form.Item>
          <Form.Item
            name={['payments', index, 'isPaid']}
            className="mb-0"
            hidden
          >
            <Input className="w-full" value={record.isPaid} />
          </Form.Item>
        </>
      ),
    },
    {
      dataIndex: 'payPeriodId',
      key: 'payPeriodId',
      render: (notused: any, record: any, index: number) => (
        <Form.Item
          label={'Pay Period'}
          required
          name={['payments', index, 'payPeriodId']}
          className="mb-0"
          rules={[{ required: true, message: 'Pay Period is required' }]}
        >
          <Select
            disabled={record?.isPaid}
            placeholder="Pay Period"
            allowClear
            className="w-60"
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
  ];

  return (
    isBenefitEntitlementSidebarUpdateOpen && (
      <CustomDrawerLayout
        open={isBenefitEntitlementSidebarUpdateOpen}
        onClose={onClose}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            <span>Update {title}</span>
          </CustomDrawerHeader>
        }
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="600px"
      >
        <Spin spinning={allUserLoading || payLoading || isLoading}>
          <Form
            layout="vertical"
            form={form}
            onFinish={onFormSubmit}
            requiredMark={CustomLabel}
          >
            <div className="grid grid-cols-2 gap-4 mb-1">
              <Form.Item label="Total Amount">
                <InputNumber
                  className="w-full h-10"
                  value={totalAmount}
                  onChange={(value) => setTotalAmount(value || 0)}
                  disabled
                />
              </Form.Item>
              <Form.Item label="Settlement Period">
                <InputNumber
                  disabled
                  className="w-full h-10"
                  value={settlementPeriod}
                  onChange={(value) => setSettlementPeriod(value || 0)}
                />
              </Form.Item>
            </div>

            {data?.length > 0 && (
              <Table
                columns={columns}
                dataSource={data}
                bordered={false}
                className="mb-4"
                pagination={false}
              />
            )}
            <Form.Item
              name="userId"
              label="Select Employees"
              rules={[{ required: true, message: 'Please select employees' }]}
            >
              <Select
                disabled
                showSearch
                placeholder="Select a person"
                className="w-full min-h-10"
                allowClear
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={allUsers?.items?.map((item: any) => ({
                  ...item,
                  value: item?.id,
                  label: item?.firstName + ' ' + item?.lastName,
                }))}
                loading={allUserLoading}
              />
            </Form.Item>
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default BenefitEntitlementSideBarEdit;
