'use client';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Button, Form, Input, InputNumber, Select, Spin, Table } from 'antd';
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
const { TextArea } = Input;
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
    setEditBenefitData,
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
    setTotalAmount(0);
    setSettlementPeriod(0);
    setEditBenefitData(null);
    setIsBenefitEntitlementSidebarUpdateOpen(false);
  };

  const onFormSubmit = (formValues: any) => {
    const paymentAmount = (formValues?.payments || []).reduce(
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
        {
          payments: formValues?.payments || [],
          id: employeeEntitlementData?.id,
        },
        {
          onSuccess: () => {
            form.resetFields();
            onClose();
          },
        },
      );
    }
  };

  useEffect(() => {
    const payments = (employeeEntitlementData?.settlementTracking || []).map(
      (entry: any) => ({
        amount: parseFloat(entry.amount),
        payPeriodId: entry.payPeriodId || null,
        isPaid: entry.isPaid,
        id: entry.id,
        reason: entry?.reason,
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
      render: (notused: any, record: any, index: number) => {
        const isPaid = !!form.getFieldValue(['payments', index, 'isPaid']);
        return (
          <>
            <Form.Item
              label={'Amount'}
              name={['payments', index, 'amount']}
              className="mb-0"
            >
              <InputNumber className="w-full" disabled={isPaid} />
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
        );
      },
    },
    {
      dataIndex: 'payPeriodId',
      key: 'payPeriodId',
      render: (notused: any, record: any, index: number) => {
        const isPaid = !!form.getFieldValue(['payments', index, 'isPaid']);
        return (
          <Form.Item
            label={'Pay Period'}
            required
            name={['payments', index, 'payPeriodId']}
            className="mb-0"
            rules={[{ required: true, message: 'Pay Period is required' }]}
          >
            <Select
              disabled={isPaid}
              placeholder="Pay Period"
              allowClear
              className="w-full"
            >
              {payPeriods?.map((period: any) => (
                <Option key={period.id} value={period.id}>
                  {dayjs(period.startDate).format('MMM DD, YYYY')} –{' '}
                  {dayjs(period.endDate).format('MMM DD, YYYY')}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );
      },
    },
    {
      dataIndex: 'reason',
      key: 'reason',
      render: (notused: any, record: any, index: number) => {
        const isPaid = !!form.getFieldValue(['payments', index, 'isPaid']);
        return (
          <Form.Item
            label="Reason"
            name={['payments', index, 'reason']}
            className="mb-0"
          >
            <TextArea placeholder="reason" autoSize disabled={isPaid} />
          </Form.Item>
        );
      },
    },
  ];

  return (
    isBenefitEntitlementSidebarUpdateOpen && (
      <CustomDrawerLayout
        open={isBenefitEntitlementSidebarUpdateOpen}
        onClose={onClose}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            <span
              id="compensation-benefit-sidebar-edit-title"
              data-cy="compensation-benefit-sidebar-edit-title"
            >
              Update {title}
            </span>
          </CustomDrawerHeader>
        }
        footer={
          <div
            className="flex flex-row gap-4 justify-center py-3"
            id="compensation-benefit-sidebar-edit-footer"
            data-cy="compensation-benefit-sidebar-edit-footer"
          >
            <Button
              type="default"
              className="h-10 px-3 w-40"
              size="large"
              loading={updateBenefitLoading}
              onClick={() => onClose()}
              id="compensation-benefit-sidebar-edit-cancel-button"
              data-cy="compensation-benefit-sidebar-edit-cancel-button"
            >
              Cancel
            </Button>

            <Button
              type="primary"
              key="update"
              className="h-10 px-3 w-40"
              size="large"
              loading={updateBenefitLoading}
              onClick={() => form.submit()}
              id="compensation-benefit-sidebar-edit-update-button"
              data-cy="compensation-benefit-sidebar-edit-update-button"
            >
              Update
            </Button>
          </div>
        }
        width="40%"
      >
        <Spin
          spinning={allUserLoading || payLoading || isLoading}
          data-cy="compensation-benefit-sidebar-edit-spin"
        >
          <Form
            layout="vertical"
            form={form}
            onFinish={onFormSubmit}
            requiredMark={CustomLabel}
            id="compensation-benefit-sidebar-edit-form"
            data-cy="compensation-benefit-sidebar-edit-form"
          >
            <div
              className="grid grid-cols-2 gap-4 mb-1"
              id="compensation-benefit-sidebar-edit-grid"
              data-cy="compensation-benefit-sidebar-edit-grid"
            >
              <Form.Item
                data-cy="compensation-benefit-sidebar-edit-total-amount-item"
                label="Total Amount"
              >
                <InputNumber
                  className="w-full h-10"
                  value={totalAmount}
                  onChange={(value) => setTotalAmount(value || 0)}
                  disabled
                  id="compensation-benefit-sidebar-edit-total-input"
                  data-cy="compensation-benefit-sidebar-edit-total-input"
                />
              </Form.Item>
              <Form.Item
                data-cy="compensation-benefit-sidebar-edit-settlement-period-item"
                label="Settlement Period"
              >
                <InputNumber
                  disabled
                  className="w-full h-10"
                  value={settlementPeriod}
                  onChange={(value) => setSettlementPeriod(value || 0)}
                  id="compensation-benefit-sidebar-edit-settlement-input"
                  data-cy="compensation-benefit-sidebar-edit-settlement-input"
                />
              </Form.Item>
            </div>

            {data?.length > 0 && (
              <div
                id="compensation-benefit-sidebar-edit-table-wrapper"
                data-cy="compensation-benefit-sidebar-edit-table-wrapper"
              >
                <Table
                  data-cy="compensation-benefit-sidebar-edit-payments-table"
                  columns={columns}
                  dataSource={data}
                  bordered={false}
                  className="mb-4"
                  pagination={false}
                />
              </div>
            )}
            <Form.Item
              name="userId"
              label="Select Employees"
              rules={[{ required: true, message: 'Please select employees' }]}
              id="compensation-benefit-sidebar-edit-employee-item"
              data-cy="compensation-benefit-sidebar-edit-employee-item"
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
                id="compensation-benefit-sidebar-edit-employee-select"
                data-cy="compensation-benefit-sidebar-edit-employee-select"
              />
            </Form.Item>
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default BenefitEntitlementSideBarEdit;
